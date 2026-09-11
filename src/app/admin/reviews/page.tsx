import { prisma } from "@/lib/prisma";
import { moderateReviewAction } from "../actions";
import { formatJalali, toFaDigits } from "@/lib/format";

export const metadata = { title: "مدیریت نظرات" };

export default async function AdminReviewsPage() {
  const [pending, recent] = await Promise.all([
    prisma.review.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, product: { select: { name: true, slug: true } } },
      take: 50,
    }),
    prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-3 text-lg font-black">نظرات در انتظار تأیید ({toFaDigits(pending.length)})</h2>
        {pending.length === 0 && (
          <div className="card p-8 text-center text-sm text-slate-400">نظر جدیدی برای بررسی نیست ✅</div>
        )}
        <div className="space-y-3">
          {pending.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-bold">{r.user?.name ?? "کاربر"}</span>
                <span className="flex items-center gap-2 text-xs">
                  <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                  <span className="text-slate-400">{formatJalali(r.createdAt)}</span>
                </span>
              </div>
              <p className="mb-1 text-xs text-slate-400">محصول: {r.product.name}</p>
              <p className="text-sm leading-6 text-slate-600">{r.body}</p>
              <div className="mt-3 flex gap-2">
                <form action={moderateReviewAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="decision" value="APPROVE" />
                  <button className="btn-primary !py-2 text-xs">تأیید و انتشار</button>
                </form>
                <form action={moderateReviewAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="decision" value="DELETE" />
                  <button className="btn-outline !py-2 text-xs !text-red-600">حذف</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-black">آخرین نظرات منتشرشده</h2>
        <div className="card divide-y divide-slate-50">
          {recent.map((r) => (
            <div key={r.id} className="p-3 text-xs text-slate-500">
              <b>{r.product.name}</b> — {r.user?.name ?? "کاربر"} — {"★".repeat(r.rating)} — {formatJalali(r.createdAt)}
            </div>
          ))}
          {recent.length === 0 && <p className="p-6 text-center">نظری منتشر نشده است.</p>}
        </div>
      </div>
    </div>
  );
}
