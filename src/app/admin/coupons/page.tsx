import { prisma } from "@/lib/prisma";
import { createCouponAction, toggleCouponAction } from "../actions";
import { formatToman, toFaDigits } from "@/lib/format";

export const metadata = { title: "کدهای تخفیف" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-black">کدهای تخفیف</h2>

      <form action={createCouponAction} className="card grid gap-3 p-5 sm:grid-cols-3">
        <div>
          <label className="label">کد *</label>
          <input name="code" className="input font-mono" dir="ltr" placeholder="SUMMER20" required />
        </div>
        <div>
          <label className="label">نوع *</label>
          <select name="type" className="input">
            <option value="PERCENT">درصدی</option>
            <option value="FIXED">مبلغ ثابت (تومان)</option>
          </select>
        </div>
        <div>
          <label className="label">مقدار *</label>
          <input name="value" className="input" inputMode="numeric" required />
        </div>
        <div>
          <label className="label">حداقل خرید (تومان)</label>
          <input name="minSubtotal" className="input" inputMode="numeric" />
        </div>
        <div>
          <label className="label">حداکثر تخفیف (تومان)</label>
          <input name="maxDiscount" className="input" inputMode="numeric" />
        </div>
        <div>
          <label className="label">سقف تعداد استفاده</label>
          <input name="usageLimit" className="input" inputMode="numeric" />
        </div>
        <div>
          <label className="label">تاریخ انقضا (ISO اختیاری)</label>
          <input name="endsAt" className="input" dir="ltr" placeholder="2026-12-31" />
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full">ایجاد کد تخفیف</button>
        </div>
      </form>

      <div className="card overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-3">کد</th>
              <th className="p-3">نوع / مقدار</th>
              <th className="p-3">محدودیت‌ها</th>
              <th className="p-3">استفاده</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-slate-50">
                <td className="p-3 font-mono font-bold" dir="ltr">{c.code}</td>
                <td className="p-3 text-xs">
                  {c.type === "PERCENT" ? `${toFaDigits(c.value)}٪` : formatToman(c.value)}
                </td>
                <td className="p-3 text-xs text-slate-500">
                  {c.minSubtotal ? `حداقل ${formatToman(c.minSubtotal)}` : "—"}
                  {c.maxDiscount ? ` / حداکثر ${formatToman(c.maxDiscount)}` : ""}
                  {c.usageLimit ? ` / سقف ${toFaDigits(c.usageLimit)}` : ""}
                </td>
                <td className="p-3 text-xs">{toFaDigits(c.usedCount)}</td>
                <td className="p-3">
                  <span className={`badge ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {c.isActive ? "فعال" : "غیرفعال"}
                  </span>
                </td>
                <td className="p-3">
                  <form action={toggleCouponAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-xs text-orange-600 hover:underline">
                      {c.isActive ? "غیرفعال کن" : "فعال کن"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">کد تخفیفی وجود ندارد.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
