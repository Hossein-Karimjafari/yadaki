import { BarChart3, Handshake, Headset, PartyPopper, ReceiptText, Smartphone, Tag, Truck, type LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { toFaDigits } from "@/lib/format";
import { PartnerForm } from "./partner-form";

export const metadata = {
  title: "فروش عمده و همکاری",
  description: "قیمت ویژه همکاران، تعمیرگاه‌ها و عمده‌فروشان لوازم یدکی در فروشگاه یدکی",
};

const BENEFITS: Array<{ icon: LucideIcon; title: string; desc: string }> = [
  { icon: Tag, title: "قیمت اختصاصی همکار", desc: "مشاهده قیمت همکار روی تمام محصولات سایت بلافاصله پس از تأیید حساب" },
  { icon: BarChart3, title: "قیمت پلکانی تعدادی", desc: "هرچه بیشتر بخرید، ارزان‌تر — تخفیف پلکانی بر اساس حجم سفارش" },
  { icon: Truck, title: "ارسال سریع", desc: "اولویت در پردازش و ارسال سفارش‌های همکاران از انبار مرکزی" },
  { icon: ReceiptText, title: "فاکتور رسمی", desc: "امکان صدور فاکتور رسمی و استعلام قیمت برای سفارش‌های خاص" },
  { icon: Smartphone, title: "سفارش سریع", desc: "ثبت سفارش با لیست کد کالا و تعداد — مناسب خریدهای روزانه تعمیرگاه" },
  { icon: Headset, title: "پشتیبانی اختصاصی", desc: "کارشناس فروش مخصوص همکاران برای پیگیری سفارش‌ها و استعلام‌ها" },
];

const STEPS = [
  "با شماره موبایل خود در سایت ثبت‌نام کنید.",
  "فرم زیر را با اطلاعات کسب‌وکار تکمیل کنید.",
  "کارشناسان یدکی برای تأیید اطلاعات با شما تماس می‌گیرند.",
  "پس از تأیید، قیمت همکار روی همه محصولات فعال می‌شود.",
];

export default async function WholesalePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-100 text-orange-600">
          <Handshake className="size-9" />
        </span>
        <h1 className="mt-3 text-2xl font-black md:text-3xl">فروش عمده و همکاری با یدکی</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
          اگر تعمیرگاه‌دار، مکانیک، فروشگاه لوازم یدکی یا عمده‌فروش هستید، حساب
          همکاری یدکی برای شماست. پس از تأیید مدیر، قیمت‌های ویژه به‌صورت خودکار
          روی همه محصولات برای شما فعال می‌شود.
        </p>
      </div>

      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className="card p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <b.icon className="size-5" />
            </span>
            <h3 className="mt-2 font-black">{b.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="mb-2 text-xl font-black">مراحل شروع همکاری</h2>
        <ol className="space-y-3 text-sm leading-7 text-slate-600">
          {STEPS.map((s, i) => (
            <li key={i} className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-600 text-xs font-black text-white">
                {toFaDigits(i + 1)}
              </span>
              {s}
              {i === STEPS.length - 1 && <PartyPopper className="size-4 text-orange-500" />}
            </li>
          ))}
        </ol>
      </div>

      <PartnerForm isLoggedIn={!!user} />
    </div>
  );
}
