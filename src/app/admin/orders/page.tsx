import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ORDER_STATUS_FA, formatJalali, formatToman, toFaDigits } from "@/lib/format";

export const metadata = { title: "مدیریت سفارش‌ها" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 20;
  const status = sp.status;

  const where = status ? { status: status as never } : {};
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { user: { select: { name: true, phone: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  const statusFilters = [
    { key: "", label: "همه" },
    { key: "PENDING_PAYMENT", label: "در انتظار پرداخت" },
    { key: "PAID", label: "پرداخت‌شده" },
    { key: "PROCESSING", label: "در پردازش" },
    { key: "PACKAGING", label: "آماده‌سازی" },
    { key: "SHIPPED", label: "ارسال‌شده" },
    { key: "DELIVERED", label: "تحویل‌شده" },
    { key: "CANCELED", label: "لغو‌شده" },
  ];
  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">سفارش‌ها ({toFaDigits(total)})</h2>
      <div className="flex flex-wrap gap-1.5">
        {statusFilters.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/admin/orders?status=${f.key}` : "/admin/orders"}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
              (status ?? "") === f.key ? "bg-orange-600 text-white" : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-3">کد</th>
              <th className="p-3">مشتری</th>
              <th className="p-3">تاریخ</th>
              <th className="p-3">مبلغ</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-50">
                <td className="p-3 font-mono text-xs font-bold">{o.code}</td>
                <td className="p-3 text-xs">
                  {o.user?.name ?? o.receiverName}
                  <br />
                  <span className="text-slate-400" dir="ltr">{toFaDigits(o.receiverPhone)}</span>
                </td>
                <td className="p-3 whitespace-nowrap text-xs">{formatJalali(o.createdAt)}</td>
                <td className="p-3 whitespace-nowrap text-xs font-bold">{formatToman(o.total)}</td>
                <td className="p-3">
                  <span className="badge bg-slate-100 text-slate-600">{ORDER_STATUS_FA[o.status]}</span>
                </td>
                <td className="p-3">
                  <Link href={`/admin/orders/${o.code}`} className="text-xs text-orange-600 hover:underline">
                    مدیریت
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/orders?page=${n}${status ? `&status=${status}` : ""}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                n === page ? "bg-orange-600 text-white" : "border border-slate-200 bg-white"
              }`}
            >
              {toFaDigits(n)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
