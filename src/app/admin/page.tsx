import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatToman, formatJalali, ORDER_STATUS_FA, toFaDigits } from "@/lib/format";

export const metadata = { title: "داشبورد مدیریت" };

export default async function AdminDashboard() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    ordersToday,
    revenueTotal,
    ordersProcessing,
    lowStock,
    outOfStock,
    latestOrders,
    pendingQuotes,
    usersCount,
    productsCount,
  ] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "PROCESSING", "PACKAGING", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: { in: ["PAID", "PROCESSING"] } } }),
    prisma.product.findMany({
      where: { status: "ACTIVE", stock: { gt: 0, lte: 3 } },
      select: { id: true, name: true, stock: true },
      take: 8,
      orderBy: { stock: "asc" },
    }),
    prisma.product.count({ where: { status: "ACTIVE", stock: 0 } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, phone: true } } },
    }),
    prisma.quoteRequest.count({ where: { status: "NEW" } }),
    prisma.user.count(),
    prisma.product.count(),
  ]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="سفارش امروز" value={toFaDigits(ordersToday)} href="/admin/orders" />
        <Stat label="فروش کل (پرداخت‌شده)" value={`${formatToman(revenueTotal._sum.total ?? 0)} تومان`} />
        <Stat label="در انتظار پردازش" value={toFaDigits(ordersProcessing)} href="/admin/orders" />
        <Stat label="استعلام‌های جدید" value={toFaDigits(pendingQuotes)} />
        <Stat label="محصولات کم‌موجود" value={toFaDigits(lowStock.length)} href="/admin/products" />
        <Stat label="محصولات ناموجود" value={toFaDigits(outOfStock)} href="/admin/products" />
        <Stat label="کاربران" value={toFaDigits(usersCount)} />
        <Stat label="کل محصولات" value={toFaDigits(productsCount)} href="/admin/products" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-black">آخرین سفارش‌ها</h3>
          <div className="space-y-2">
            {latestOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.code}`}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm hover:bg-orange-50"
              >
                <div>
                  <span className="font-bold">{o.code}</span>
                  <span className="ms-2 text-xs text-slate-400">
                    {o.user?.name ?? o.receiverName} — {formatJalali(o.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black">{formatToman(o.total)}</span>
                  <span className="badge bg-white text-slate-600">{ORDER_STATUS_FA[o.status]}</span>
                </div>
              </Link>
            ))}
            {latestOrders.length === 0 && (
              <p className="text-sm text-slate-400">هنوز سفارشی ثبت نشده است.</p>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 font-black">هشدار موجودی</h3>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-amber-50 p-3 text-sm">
                <span className="line-clamp-1">{p.name}</span>
                <span className="badge bg-amber-200 text-amber-800">
                  {toFaDigits(p.stock)} عدد
                </span>
              </div>
            ))}
            {lowStock.length === 0 && (
              <p className="text-sm text-slate-400">موجودی همه محصولات مناسب است ✅</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <div className="card h-full p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
