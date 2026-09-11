import { prisma } from "@/lib/prisma";
import { updateUserRoleAction, toggleUserBlockAction } from "../actions";
import { ROLE_FA, formatJalali, toFaDigits } from "@/lib/format";

export const metadata = { title: "کاربران" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">کاربران ({toFaDigits(users.length)})</h2>
      <div className="card overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-3">کاربر</th>
              <th className="p-3">نقش</th>
              <th className="p-3">سفارش‌ها</th>
              <th className="p-3">عضویت</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3">تغییر نقش</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-50">
                <td className="p-3">
                  <span className="font-bold">{u.name ?? "—"}</span>
                  <br />
                  <span className="text-xs text-slate-400" dir="ltr">{toFaDigits(u.phone)}</span>
                </td>
                <td className="p-3">
                  <span className="badge bg-slate-100 text-slate-600">{ROLE_FA[u.role]}</span>
                </td>
                <td className="p-3 text-xs">{toFaDigits(u._count.orders)}</td>
                <td className="p-3 text-xs">{formatJalali(u.createdAt)}</td>
                <td className="p-3">
                  <span className={`badge ${
                    u.status === "BLOCKED" ? "bg-red-100 text-red-700" : u.status === "PENDING_PARTNER" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {u.status === "BLOCKED" ? "مسدود" : u.status === "PENDING_PARTNER" ? "در انتظار تأیید" : "فعال"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <form action={updateUserRoleAction} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} className="input !w-28 !px-2 !py-1 text-xs">
                        <option value="CUSTOMER">مشتری</option>
                        <option value="MECHANIC">تعمیرگاه</option>
                        <option value="WHOLESALE">عمده‌فروش</option>
                        <option value="ADMIN">مدیر</option>
                      </select>
                      <button className="text-xs text-orange-600 hover:underline">ثبت</button>
                    </form>
                    <form action={toggleUserBlockAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <button className="text-xs text-red-500 hover:underline">
                        {u.status === "BLOCKED" ? "رفع مسدودی" : "مسدود"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
