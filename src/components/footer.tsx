import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-lg font-black text-white">
                ید
              </span>
              <span className="text-xl font-black">یدکی</span>
            </div>
            <p className="text-sm leading-6 text-slate-500">
              فروشگاه اینترنتی لوازم یدکی خودرو؛ با تضمین اصالت کالا، گارانتی معتبر و
              قیمت ویژه همکاران و تعمیرگاه‌ها.
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-black">دسترسی سریع</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/search" className="hover:text-orange-600">همه محصولات</Link></li>
              <li><Link href="/cart" className="hover:text-orange-600">سبد خرید</Link></li>
              <li><Link href="/account/orders" className="hover:text-orange-600">پیگیری سفارش</Link></li>
              <li><Link href="/login" className="hover:text-orange-600">ورود / ثبت‌نام</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-black">خدمات مشتریان</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>گارانتی و مرجوعی</li>
              <li>شرایط ارسال</li>
              <li>قوانین و مقررات</li>
              <li>حریم خصوصی</li>
              <li>سوالات متداول</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-black">ارتباط با ما</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>📞 پشتیبانی: ۰۲۱-۹۱۰۰۰۰۰۰</li>
              <li>🕐 شنبه تا پنجشنبه، ۹ تا ۱۸</li>
              <li>✉️ support@yadaki.example</li>
              <li>📍 تهران، ایران</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <span className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-[10px] text-slate-400">
                نماد اعتماد
              </span>
              <span className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-[10px] text-slate-400">
                ساماندهی
              </span>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} فروشگاه یدکی — کلیه حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
