import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./profile-form";
import { toFaDigits } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "پروفایل" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [ordersCount, stats] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.aggregate({
      where: { userId: user.id, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatBox label="تعداد سفارش‌ها" value={toFaDigits(ordersCount)} />
        <StatBox label="مجموع خرید" value={`${toFaDigits((stats._sum.total ?? 0).toLocaleString("en-US"))} تومان`} />
        <StatBox label="امتیاز وفاداری" value={toFaDigits(user.loyaltyPoints)} />
      </div>
      <div className="card p-6">
        <h2 className="mb-4 text-lg font-black">اطلاعات پروفایل</h2>
        <ProfileForm
          name={user.name ?? ""}
          email={user.email ?? ""}
          nationalCode={user.nationalCode ?? ""}
        />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
