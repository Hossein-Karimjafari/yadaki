import { prisma } from "@/lib/prisma";
import { setReturnStatusAction } from "../actions";
import { formatJalali } from "@/lib/format";

export const metadata = { title: "مرجوعی‌ها و گارانتی" };

const STATUS_FA: Record<string, string> = {
  PENDING: "در انتظار بررسی",
  APPROVED: "تأیید شد",
  REJECTED: "رد شد",
  RECEIVED: "دریافت شد",
  REPAIRING: "در حال تعمیر",
  REPLACED: "تعویض شد",
  REFUNDED: "بازپرداخت شد",
};

const NEXT_STATUSES = ["APPROVED", "REJECTED", "RECEIVED", "REPAIRING", "REPLACED", "REFUNDED"];

export default async function AdminReturnsPage() {
  const returns = await prisma.returnRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { code: true } },
      user: { select: { name: true, phone: true } },
    },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">درخواست‌های مرجوعی و گارانتی</h2>
      {returns.length === 0 && (
        <div className="card p-10 text-center text-sm text-slate-400">درخواستی ثبت نشده است.</div>
      )}
      {returns.map((r) => (
        <div key={r.id} className="card p-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm">
              <span className="font-black">سفارش {r.order.code}</span>
              <span className="ms-2 text-xs text-slate-400">
                {r.user?.name} ({r.user?.phone})
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="badge bg-slate-100 text-slate-600">{STATUS_FA[r.status]}</span>
              <span className="text-slate-400">{formatJalali(r.createdAt)}</span>
            </div>
          </div>
          <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <b>دلیل:</b> {r.reason}
            {r.description ? <> — {r.description}</> : null}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {NEXT_STATUSES.filter((s) => s !== r.status).map((s) => (
              <form key={s} action={setReturnStatusAction}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="status" value={s} />
                <button
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                    s === "REJECTED" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600 hover:bg-orange-100"
                  }`}
                >
                  {STATUS_FA[s]}
                </button>
              </form>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
