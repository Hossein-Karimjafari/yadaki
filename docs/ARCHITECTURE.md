# معماری سیستم «یدکی» (Yadaki)

فروشگاه اینترنتی لوازم یدکی خودرو — تک‌فروشنده با پشتیبانی B2B (همکار/تعمیرگاه/عمده) از فاز اول.

## ۱. استک فنی و دلیل انتخاب

| لایه | انتخاب | دلیل |
|---|---|---|
| فریم‌ورک | **Next.js 15 (App Router) + TypeScript** | SSR/SSG برای سئو، تک‌کدبیس فرانت+بک، RSC برای سرعت، اکوسیستم بزرگ |
| استایل | **Tailwind CSS v4** | سرعت توسعه، سازگاری کامل با RTL (`dir="rtl"`)، حجم خروجی کم |
| فونت | **Vazirmatn** | فونت فارسی استاندارد، متنوع وزن، مجوز آزاد |
| دیتابیس | **PostgreSQL + Prisma ORM** | ACID برای سفارش/موجودی، ایندکس‌های قوی، migration نسخه‌پذیر |
| جستجو | **Postgres Full-Text (فاز ۱) → Meilisearch (فاز ۲)** | تا ۵۰هزار محصول Postgres کافی است؛ Meili بعداً برای تایپ‌اُهد و تحمل غلط املایی |
| کش | **Redis (اختیاری، لایه انتزاعی)** | کش کوئری‌های پربازدید، ریت‌لیمیت؛ در فاز ۱ در-memory |
| احراز هویت | **OTP پیامکی + JWT (httpOnly cookie)** | عرف بازار ایران؛ بدون وابستگی خارجی |
| پرداخت | **لایه GatewayProvider → Zarinpal** | افزودن IDPay/پی‌پینگ/... فقط با پیاده‌سازی interface |
| پیامک | **لایه SmsProvider → کاوه‌نگار/ملی‌پیامک** | سوییچ آسان بین پنل‌ها |
| اعتبارسنجی | **Zod** | schema مشترک کلاینت/سرور |
| State | **Zustand (سبد/مقایسه) + RSC** | سبک، بدون boilerplate |
| استقرار | **Vercel (وب) + Postgres مدیریت‌شده** | CI/CD خودکار از گیت؛ قابل مهاجرت به سرور ایران |

## ۲. معماری کلی

```
┌─────────────────────────────────────────────────────┐
│                    Next.js App                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │
│  │ Storefront│ │ Account  │ │  Admin Panel         │ │
│  │ (SSR/SEO)│ │ (Client) │ │  (role-guarded)      │ │
│  └────┬─────┘ └────┬─────┘ └──────────┬───────────┘ │
│       └────────────┼──────────────────┘             │
│              Server Actions / Route Handlers        │
│  ┌──────────────────────────────────────────────┐   │
│  │ Domain Layer (services)                       │   │
│  │  products · search · cart · orders · payments │   │
│  │  inventory · compatibility · discounts · sms  │   │
│  └───────┬───────────────┬──────────────┬───────┘   │
│      Prisma ORM     Redis(cache)   Providers(SMS/Pay)│
└─────────┼───────────────────────────────────────────┘
     PostgreSQL
```

اصل‌ها:
- **Server-First**: همه خواندن‌ها با RSC؛ تعامل (سبد، فیلتر) با Client Component + Server Action.
- **لایه سرویس جدا از UI**: منطق قیمت‌گذاری، موجودی و سازگاری در `src/lib/*` تا در پنل ادمین هم reuse شود.
- **قیمت‌گذاری متمرکز**: تابع واحد `resolvePrice(user, product)` — عادی/همکار/عمده/تخفیف در یک نقطه.
- **سازگاری قطعه**: جدول `compatibility` (چند‌به‌چند product↔vehicle)؛ فیلتر خودرو در همه لیست‌ها اعمال می‌شود.

## ۳. مدل داده (ERD خلاصه)

گروه‌های اصلی (فاز ۱) — فیلدهای کلیدی:

### کاربر و خودرو
- `User`: id, phone (unique), name, email, role (`CUSTOMER|MECHANIC|WHOLESALE|ADMIN`), status, walletBalance, loyaltyPoints
- `Address`: user, province, city, postalCode, addressLine, plaque, unit, receiverName, receiverPhone
- `VehicleMake` / `VehicleModel` / `VehicleTrim`: ساختار درختی برند→مدل→تیپ (سال و موتور در trim)
- `UserVehicle` (گاراژ): user, make/model/trim, year, plate, isDefault

### کاتالوگ
- `Category`: چندسطحی (parentId), slug, icon, order
- `Brand`: name, slug, logo, country, isOriginal
- `Product`: slug, name, technicalCode, partNumber, oemNumber, condition (`NEW|STOCK|REFURBISHED|ORIGINAL|AFTERMARKET`), warrantyMonths, weight, shortDesc, longDesc, status, flags (isFeatured/isNew/isBestSeller)
- `ProductImage`, `ProductFile`
- `ProductVariant`: رنگ/بسته‌بندی، قیمت مستقل (اختیاری)
- `Compatibility`: product ↔ trim/model + yearFrom/yearTo (چندبه‌چند)
- `CrossRef`: کدهای جایگزین (partNumber های دیگر برندها)
- `Review` (امتیاز+متن، وضعیت تأیید), `Question`/`Answer`
- `Wishlist`, `CompareItem`

### فروش
- `Cart` (user یا مهمان با token) → `CartItem` (product, qty, priceSnapshot)
- `Order`: code, user/guest, status, amounts (subtotal, discount, shipping, tax, total), addressSnapshot, note
- `OrderItem`: product, qty, unitPrice, total
- `OrderStatusHistory`: تغییرات وضعیت با زمان
- `Payment`: order, gateway, amount, authority, refId, status
- `Coupon`: نوع درصدی/مبلغی، محدودیت محصول/دسته/برند/گروه مشتری، سقف استفاده
- `Shipment`: order, method, trackingCode, cost
- `ShippingMethod`: نام، هزینه پایه، مناطق

### انبار و B2B
- `Warehouse`, `Inventory` (product×warehouse), `StockMovement` (ورود/خروج/اصلاح با دلیل)
- `QuoteRequest` (استعلام قیمت): آیتم‌ها، وضعیت، پاسخ
- `PriceTier` (قیمت پلکانی تعدادی), `PartnerProfile` (اطلاعات همکار/تعمیرگاه + وضعیت تأیید)
- `ReturnRequest`/`WarrantyClaim`: آیتم، دلیل، عکس، وضعیت

### محتوا و سیستمی
- `Post` (وبلاگ), `Page` (استاتیک), `Banner`, `Setting` (کلید-مقدار), `SmsLog`, `ActivityLog`, `SearchLog`

ERD کامل در `prisma/schema.prisma` (منبع حقیقت) + فایل `docs/erd.md`.

## ۴. نقشه API / Server Actions

| ناحیه | مسیر/اکشن | نوع |
|---|---|---|
| احراز هویت | `POST /api/auth/otp/request`, `POST /api/auth/otp/verify`, `POST /api/auth/logout` | Route |
| سبد | `cart.add / cart.update / cart.remove / cart.applyCoupon` | Server Action |
| جستجو/لیست | `GET /search?q=&category=&brand=&vehicle=&min=&max=&sort=` | SSR page |
| سفارش | `checkout.submit` → `order.create` → `payment.start` → `POST /api/payment/zarinpal/callback` | Action+Route |
| حساب | پروفایل، آدرس‌ها، گاراژ، سفارش‌ها | Pages+Actions |
| ادمین | CRUD محصولات/دسته/برند/سفارش/کوپن/انبار | Pages+Actions |

## ۵. امنیت

- JWT در **httpOnly + Secure + SameSite=Lax** cookie؛refresh با اسلایدینگ.
- Zod validation روی همه ورودی‌ها؛ Prisma (پارامتری) ضد SQLi؛ escape خودکار React ضد XSS.
- ریت‌لیمیت: OTP (۳/ساعت)، جستجو، فرم‌ها (لایه `rateLimit()` قابل اتصال به Redis).
- ورود ادمین: OTP دومرحله‌ای + نقش‌محور (`requireRole('ADMIN')` در layout و اکشن‌ها).
- لاگ فعالیت: `ActivityLog` برای تغییرات حساس (قیمت/موجودی/سفارش).
- پرداخت: تأیید فقط سمت سرور با verify درگاه؛ snapshot قیمت در OrderItem (دستکاری سبد بی‌اثر).
- Secrets فقط در `.env` (validation با Zod هنگام boot).

## ۶. عملکرد

- RSC + streaming؛ اسکلتون برای لیست‌ها.
- `next/image` با WebP/AVIF خودکار + lazy loading.
- ایندکس‌های Postgres: `partNumber`, `oemNumber`, `technicalCode`, `slug`, `compatibility(trimId)`, `product(categoryId,status)`.
- کش: صفحات اصلی ISR؛ کوئری گران با `unstable_cache` (قابل تعویض با Redis).
- اعداد فارسی و تاریخ شمسی در لایه util (بدون کتابخانه سنگین در کلاینت).

## ۷. محیط‌ها و استقرار

- `development` (local) / `preview` (Vercel per-branch) / `production`.
- DB: `DATABASE_URL` متفاوت per-env؛ migration فقط از CI.
- بکاپ: dump روزانه Postgres (managed provider) + retention ۳۰ روز.
- مانیتورینگ: Vercel Analytics + Sentry (فاز ۲).
