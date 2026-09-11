import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatToman, formatJalali, toFaDigits } from "@/lib/format";

export const metadata = { title: "درگاه پرداخت آزمایشی" };

export default async function SandboxPayPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = await prisma.order.findUnique({ where: { code } });
  if (!order || order.status !== "PENDING_PAYMENT") notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card overflow-hidden">
        <div className="bg-slate-900 p-6 text-center text-white">
          <p className="text-xs text-slate-400">درگاه پرداخت آزمایشی (Sandbox)</p>
          <p className="mt-2 text-3xl font-black">{formatToman(order.total)}</p>
          <p className="mt-1 text-sm text-slate-300">تومان</p>
        </div>
        <div className="space-y-3 p-6 text-sm">
          <Row label="پذیرنده" value="فروشگاه یدکی" />
          <Row label="شماره سفارش" value={order.code} ltr />
          <Row label="تاریخ" value={formatJalali(order.createdAt)} />
          <Row label="پرداخت‌کننده" value={order.receiverName} />
          <p className="rounded-lg bg-amber-50 p-3 text-[11px] leading-5 text-amber-700">
            این صفحه فقط برای محیط توسعه است. پس از تنظیم ZARINPAL_MERCHANT_ID و
            متغیر PAYMENT_GATEWAY=zarinpal، پرداخت واقعی از طریق زرین‌پال انجام می‌شود.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <a
              href={`/api/payment/callback?order=${order.code}&gateway=sandbox&authority=SANDBOX_OK&status=success`}
              className="btn-primary !py-3"
            >
              پرداخت موفق
            </a>
            <a
              href={`/api/payment/callback?order=${order.code}&gateway=sandbox&authority=SANDBOX_OK&status=cancel`}
              className="btn-outline !py-3"
            >
              انصراف
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${ltr ? "font-mono" : ""}`} dir={ltr ? "ltr" : undefined}>
        {ltr ? value : toFaDigits(value)}
      </span>
    </div>
  );
}
