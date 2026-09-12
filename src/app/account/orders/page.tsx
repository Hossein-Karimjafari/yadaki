import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { Package } from "lucide-react";
import { ORDER_STATUS_FA, formatJalali, formatToman, toFaDigits } from "@/lib/format";

export const metadata = { title: "سفارش‌های من" };

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  if (orders.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 p-16 text-center">
        <Package className="size-12 text-slate-300" />
        <h2 className="font-black">هنوز سفارشی ثبت نکرده‌اید</h2>
        <Link href="/search" className="btn-primary">شروع خرید</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-black">سفارش‌های من</h1>
      {orders.map((o) => (
        <Link key={o.id} href={`/order/${o.code}`} className="card block p-4 transition hover:border-orange-300">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-black">سفارش {o.code}</span>
              <span className="ms-3 text-xs text-slate-400">{formatJalali(o.createdAt)}</span>
            </div>
            <span className={`badge ${o.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
              {ORDER_STATUS_FA[o.status]}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {toFaDigits(o.items.length)} کالا — {o.items.slice(0, 2).map((i) => i.name).join("، ")}
              {o.items.length > 2 ? " و..." : ""}
            </span>
            <span className="font-black">{formatToman(o.total)} تومان</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
