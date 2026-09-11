import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-8xl font-black text-orange-200">۴۰۴</p>
      <h1 className="mt-4 text-2xl font-black">صفحه پیدا نشد!</h1>
      <p className="mt-3 text-sm leading-7 text-slate-500">
        احتمالاً این قطعه حذف شده یا آدرس اشتباه است.
        می‌توانید از جستجو استفاده کنید یا خودروی خود را انتخاب کنید تا قطعات سازگار را ببینید.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-primary">صفحه اصلی</Link>
        <Link href="/search" className="btn-outline">جستجوی قطعات</Link>
      </div>
    </div>
  );
}
