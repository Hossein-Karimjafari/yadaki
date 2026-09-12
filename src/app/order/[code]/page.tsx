import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, CircleCheck, CircleX } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ReturnForm } from "./return-form";
import {
  ORDER_STATUS_FA,
  formatJalaliTime,
  formatToman,
  toFaDigits,
} from "@/lib/format";

export const metadata = { title: "سفارش شما" };

const RETURN_FA: Record<string, string> = {
  PENDING: "در انتظار بررسی",
  APPROVED: "تأیید شد",
  REJECTED: "رد شد",
  RECEIVED: "دریافت شد",
  REPAIRING: "در حال تعمیر",
  REPLACED: "تعویض شد",
  REFUNDED: "بازپرداخت شد",
};

const TIMELINE: Array<{ key: string; label: string }> = [
  { key: "PENDING_PAYMENT", label: "ثبت سفارش" },
  { key: "PAID", label: "پرداخت" },
  { key: "PROCESSING", label: "پردازش" },
  { key: "PACKAGING", label: "آماده‌سازی" },
  { key: "SHIPPED", label: "ارسال" },
  { key: "DELIVERED", label: "تحویل" },
];

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ payment?: string; msg?: string }>;
}) {
  const { code } = await params;
  const sp = await searchParams;
  const order = await prisma.order.findUnique({
    where: { code },
    include: { items: { include: { product: { include: { images: true, brand: true } } } }, statusHistory: { orderBy: { createdAt: "asc" } }, payments: true },
  });
  if (!order) notFound();

  const user = await getCurrentUser();
  const eligibleForReturn =
    !!user &&
    order.userId === user.id &&
    ["PAID", "PROCESSING", "PACKAGING", "SHIPPED", "DELIVERED"].includes(order.status);
  const existingReturn = await prisma.returnRequest.findFirst({
    where: { orderId: order.id },
    orderBy: { createdAt: "desc" },
  });

  const payment = order.payments.find((p) => p.status === "SUCCESS");
  const currentIndex = TIMELINE.findIndex((t) => t.key === order.status);
  const canceled = ["CANCELED", "RETURNED", "REFUNDED"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {sp.payment === "ok" && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
          <span className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CircleCheck className="size-8" />
          </span>
          <h1 className="mt-2 text-xl font-black text-emerald-800">پرداخت با موفقیت انجام شد</h1>
          <p className="mt-1 text-sm text-emerald-700">
            سفارش شما ثبت شد و جزئیات آن پیامک شد. کد رهگیری: {payment?.refId}
          </p>
        </div>
      )}
      {sp.payment === "failed" && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
          <span className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <CircleX className="size-8" />
          </span>
          <h1 className="mt-2 text-xl font-black text-red-800">پرداخت ناموفق بود</h1>
          <p className="mt-1 text-sm text-red-700">
            {sp.msg ?? "مبلغی از حساب شما کسر نشده است."} می‌توانید مجدداً تلاش کنید.
          </p>
        </div>
      )}

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black">سفارش {order.code}</h2>
            <p className="text-xs text-slate-400">{formatJalaliTime(order.createdAt)}</p>
          </div>
          <span className={`badge ${
            canceled ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          }`}>
            {ORDER_STATUS_FA[order.status]}
          </span>
        </div>

        {!canceled && (
          <div className="mb-6 flex items-center">
            {TIMELINE.map((t, i) => (
              <div key={t.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      i <= currentIndex ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {i <= currentIndex ? <Check className="size-4" /> : toFaDigits(i + 1)}
                  </span>
                  <span className="mt-1 hidden text-[10px] text-slate-500 sm:block">{t.label}</span>
                </div>
                {i < TIMELINE.length - 1 && (
                  <div className={`mx-1 h-1 flex-1 rounded ${i < currentIndex ? "bg-orange-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="relative h-14 w-14 shrink-0 rounded-lg bg-white">
                <Image
                  src={item.product.images[0]?.url ?? "/part-placeholder.svg"}
                  alt={item.name}
                  fill
                  unoptimized
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/p/${item.product.slug}`} className="line-clamp-1 text-sm font-bold hover:text-orange-600">
                  {item.name}
                </Link>
                <span className="text-xs text-slate-400">
                  {item.product.brand.name} — تعداد: {toFaDigits(item.qty)}
                </span>
              </div>
              <span className="text-sm font-black">{formatToman(item.total)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
          <div>
            <h4 className="mb-2 font-black">آدرس تحویل</h4>
            <p className="leading-6 text-slate-500">
              {order.receiverName} — {order.receiverPhone}
              <br />
              {order.province}، {order.city}، {order.addressLine}
              {order.postalCode ? ` — کدپستی: ${toFaDigits(order.postalCode)}` : ""}
            </p>
            {order.note && <p className="mt-1 text-xs text-slate-400">یادداشت: {order.note}</p>}
          </div>
          <div>
            <div className="space-y-1.5">
              <SumRow label="جمع کالاها" value={formatToman(order.subtotal)} />
              {order.discount > 0 && (
                <SumRow label="تخفیف" value={`− ${formatToman(order.discount)}`} />
              )}
              <SumRow label="هزینه ارسال" value={formatToman(order.shippingCost)} />
              <SumRow label="روش ارسال" value={order.shippingMethod ?? "—"} plain />
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-black">
                <span>مبلغ کل</span>
                <span>{formatToman(order.total)} تومان</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/search" className="btn-outline">ادامه خرید</Link>
          <Link href="/account/orders" className="btn-primary">سفارش‌های من</Link>
        </div>

        {eligibleForReturn && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <h4 className="mb-3 text-sm font-black">درخواست مرجوعی یا گارانتی</h4>
            <ReturnForm orderId={order.id} />
          </div>
        )}
        {existingReturn && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            آخرین درخواست مرجوعی/گارانتی شما برای این سفارش: «{existingReturn.reason}» — وضعیت:{" "}
            <b>{RETURN_FA[existingReturn.status] ?? existingReturn.status}</b>
          </div>
        )}
      </div>

      <div className="card mt-4 p-5">
        <h4 className="mb-3 text-sm font-black">تاریخچه وضعیت</h4>
        <ol className="space-y-2 text-sm">
          {order.statusHistory.map((h) => (
            <li key={h.id} className="flex items-center justify-between text-slate-500">
              <span>{ORDER_STATUS_FA[h.status]}{h.note ? ` — ${h.note}` : ""}</span>
              <span className="text-xs">{formatJalaliTime(h.createdAt)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function SumRow({ label, value, plain = false }: { label: string; value: string; plain?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={plain ? "font-bold" : "font-bold"}>{value}</span>
    </div>
  );
}
