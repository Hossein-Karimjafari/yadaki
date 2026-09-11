import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { setOrderStatusAction } from "../../actions";
import { ORDER_STATUS_FA, formatJalaliTime, formatToman, toFaDigits } from "@/lib/format";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await prisma.order.findUnique({
    where: { code },
    include: {
      items: { include: { product: { include: { brand: true } } } },
      statusHistory: { orderBy: { createdAt: "asc" } },
      payments: true,
      user: true,
    },
  });
  if (!order) notFound();

  const transitions: Record<string, string[]> = {
    PAID: ["PROCESSING", "PACKAGING", "CANCELED"],
    PROCESSING: ["PACKAGING", "INCOMPLETE", "CANCELED"],
    PACKAGING: ["SHIPPED", "CANCELED"],
    SHIPPED: ["DELIVERED", "AWAITING_RETURN"],
    DELIVERED: ["AWAITING_RETURN"],
  };
  const nextStates = transitions[order.status] ?? [];
  const successPayment = order.payments.find((p) => p.status === "SUCCESS");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">سفارش {order.code}</h2>
        <span className="badge bg-blue-100 text-blue-700">{ORDER_STATUS_FA[order.status]}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 font-black">اقلام سفارش</h3>
            <div className="space-y-2 text-sm">
              {order.items.map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <span className="font-bold">{i.name}</span>
                    <span className="ms-2 text-xs text-slate-400">
                      {i.product.brand.name} — {toFaDigits(i.qty)} × {formatToman(i.unitPrice)}
                    </span>
                  </div>
                  <span className="font-black">{formatToman(i.total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 text-sm">
              <Row label="جمع کالاها" value={formatToman(order.subtotal)} />
              {order.discount > 0 && <Row label="تخفیف" value={`− ${formatToman(order.discount)}`} />}
              <Row label="ارسال" value={formatToman(order.shippingCost)} />
              <Row label="مبلغ کل" value={formatToman(order.total)} bold />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-black">تاریخچه وضعیت</h3>
            <ol className="space-y-2 text-sm">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="flex justify-between text-slate-500">
                  <span>{ORDER_STATUS_FA[h.status]}{h.note ? ` — ${h.note}` : ""}</span>
                  <span className="text-xs">{formatJalaliTime(h.createdAt)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5 text-sm">
            <h3 className="mb-3 font-black">مشتری و ارسال</h3>
            <p className="leading-6 text-slate-500">
              {order.user?.name ?? order.receiverName}
              <br />
              <span dir="ltr">{toFaDigits(order.receiverPhone)}</span>
              <br />
              {order.province}، {order.city}، {order.addressLine}
              {order.postalCode ? ` — ${toFaDigits(order.postalCode)}` : ""}
            </p>
            {order.note && (
              <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
                یادداشت مشتری: {order.note}
              </p>
            )}
            {successPayment && (
              <p className="mt-2 text-xs text-emerald-600">
                پرداخت موفق: {successPayment.gateway} — کد رهگیری {successPayment.refId}
              </p>
            )}
          </div>

          {nextStates.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 font-black">تغییر وضعیت</h3>
              <div className="space-y-2">
                {nextStates.map((s) => (
                  <form key={s} action={setOrderStatusAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <input type="hidden" name="code" value={order.code} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      className={`w-full rounded-xl p-2.5 text-sm font-bold ${
                        s === "CANCELED"
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-orange-50 text-orange-700 hover:bg-orange-100"
                      }`}
                    >
                      {ORDER_STATUS_FA[s] ?? s}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-black" : ""}`}>
      <span className="text-slate-500">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
