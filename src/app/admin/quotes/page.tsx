import { prisma } from "@/lib/prisma";
import { answerQuoteAction, closeQuoteAction } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { formatJalaliTime, toFaDigits } from "@/lib/format";

export const metadata = { title: "استعلام‌های قیمت" };

export default async function AdminQuotesPage() {
  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { name: true, phone: true } } },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">درخواست‌های استعلام قیمت</h2>
      {quotes.length === 0 && (
        <div className="card p-10 text-center text-sm text-slate-400">درخواستی ثبت نشده است.</div>
      )}
      {quotes.map((q) => (
        <div key={q.id} className="card p-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-black">{q.name}</span>
              <span className="ms-2 text-xs text-slate-400" dir="ltr">{toFaDigits(q.phone)}</span>
              {q.user && <span className="badge ms-2 bg-emerald-100 text-emerald-700">کاربر سایت</span>}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="badge bg-slate-100 text-slate-600">
                {q.status === "NEW" ? "جدید" : q.status === "ANSWERED" ? "پاسخ داده شد" : "بسته"}
              </span>
              <span className="text-slate-400">{formatJalaliTime(q.createdAt)}</span>
            </div>
          </div>
          <ul className="mb-2 list-inside list-disc rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            {q.items.map((it) => (
              <li key={it.id}>
                {it.name}
                {it.qty > 1 ? ` × ${toFaDigits(it.qty)}` : ""}
              </li>
            ))}
          </ul>
          {q.message && <p className="mb-2 text-xs text-slate-500">یادداشت: {q.message}</p>}
          {q.answer ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
              <b>پاسخ داده‌شده:</b> {q.answer}
              {q.status !== "CLOSED" && (
                <form action={closeQuoteAction} className="mt-2">
                  <input type="hidden" name="id" value={q.id} />
                  <button className="text-xs text-slate-500 hover:underline">بستن درخواست</button>
                </form>
              )}
            </div>
          ) : (
            <form action={answerQuoteAction} className="space-y-2">
              <input type="hidden" name="id" value={q.id} />
              <textarea
                name="answer"
                rows={2}
                className="input text-sm"
                placeholder="پاسخ / قیمت پیشنهادی (پیامک یا تماس انجام می‌شود)..."
              />
              <SubmitButton className="btn-primary !py-2 text-xs" pendingText="...">
                ثبت پاسخ
              </SubmitButton>
            </form>
          )}
        </div>
      ))}
    </div>
  );
}
