import { prisma } from "@/lib/prisma";
import { answerQuestionAction, deleteQuestionAction } from "../actions";
import { CircleCheck } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { formatJalali } from "@/lib/format";

export const metadata = { title: "پرسش و پاسخ" };

export default async function AdminQuestionsPage() {
  const [unanswered, answered] = await Promise.all([
    prisma.question.findMany({
      where: { answer: null },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true } }, product: { select: { name: true } } },
      take: 50,
    }),
    prisma.question.findMany({
      where: { answer: { not: null } },
      orderBy: { answeredAt: "desc" },
      include: { product: { select: { name: true } } },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-black">سوالات بدون پاسخ ({unanswered.length})</h2>
      {unanswered.length === 0 && (
        <div className="flex items-center justify-center gap-1.5 card p-8 text-center text-sm text-slate-400">
          همه سوالات پاسخ داده شده‌اند
          <CircleCheck className="size-4 text-emerald-500" />
        </div>
      )}
      {unanswered.map((q) => (
        <div key={q.id} className="card p-4">
          <p className="text-xs text-slate-400">
            {q.product.name} — {q.user?.name ?? "کاربر"} — {formatJalali(q.createdAt)}
          </p>
          <p className="my-2 text-sm leading-6 text-slate-700">{q.body}</p>
          <form action={answerQuestionAction} className="flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="id" value={q.id} />
            <textarea name="answer" rows={2} className="input text-sm" placeholder="پاسخ شما..." />
            <div className="flex shrink-0 flex-col gap-2">
              <SubmitButton className="btn-primary !py-2 text-xs" pendingText="...">
                ثبت پاسخ
              </SubmitButton>
              <button formAction={deleteQuestionAction} className="btn-outline !py-2 text-xs !text-red-600">
                حذف سوال
              </button>
            </div>
          </form>
        </div>
      ))}

      <h2 className="text-lg font-black">پاسخ‌های اخیر</h2>
      <div className="card divide-y divide-slate-50">
          {answered.map((q) => (
            <div key={q.id} className="p-3 text-xs text-slate-500">
              <b>{q.product.name}</b> — {q.body} ← <span className="text-emerald-600">{q.answer}</span>
            </div>
          ))}
        {answered.length === 0 && <p className="p-6 text-center">چیزی نیست.</p>}
      </div>
    </div>
  );
}
