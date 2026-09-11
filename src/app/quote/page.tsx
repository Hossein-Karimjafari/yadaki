import { getCurrentUser } from "@/lib/auth";
import { QuoteForm } from "./quote-form";

export const metadata = {
  title: "استعلام قیمت قطعه",
  description: "استعلام قیمت قطعات کمیاب لوازم یدکی خودرو — کافیست نام قطعه و تعداد را بنویسید",
};

export default async function QuotePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <span className="text-5xl">🔎</span>
        <h1 className="mt-3 text-2xl font-black">استعلام قیمت قطعه</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
          قطعه‌ای که در سایت پیدا نکردید را برای ما بنویسید؛ شبکه تأمین‌کنندگان یدکی
          آن را پیدا و قیمت و زمان تأمین را به شما اعلام می‌کند. این سرویس برای
          قطعات کمیاب، قطعات خودروهای خارجی و سفارش‌های عمده رایگان است.
        </p>
      </div>
      <QuoteForm
        defaultName={user?.name ?? ""}
        defaultPhone={user?.phone ?? ""}
      />
    </div>
  );
}
