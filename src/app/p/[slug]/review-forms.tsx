"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReviewAction, submitQuestionAction, type ReviewState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { Stars } from "@/components/category-icon";
import { toFaDigits } from "@/lib/format";

const initial: ReviewState = {};

interface ReviewItem {
  id: string;
  rating: number;
  body: string;
  date: string;
  userName: string;
}
interface QuestionItem {
  id: string;
  body: string;
  answer: string;
  date: string;
}

export function ReviewForms({
  productId,
  isLoggedIn,
  reviews,
  questions,
}: {
  productId: string;
  isLoggedIn: boolean;
  reviews: ReviewItem[];
  questions: QuestionItem[];
}) {
  const [tab, setTab] = useState<"reviews" | "qa">("reviews");
  const [reviewState, reviewAction] = useActionState(submitReviewAction, initial);
  const [questionState, questionAction] = useActionState(submitQuestionAction, initial);
  const [rating, setRating] = useState(5);

  return (
    <div className="card p-4">
      <div className="mb-4 flex gap-2 border-b border-slate-100 pb-2">
        <button
          onClick={() => setTab("reviews")}
          className={`rounded-lg px-4 py-1.5 text-sm font-bold ${
            tab === "reviews" ? "bg-orange-50 text-orange-700" : "text-slate-500"
          }`}
        >
          نظرات کاربران ({toFaDigits(reviews.length)})
        </button>
        <button
          onClick={() => setTab("qa")}
          className={`rounded-lg px-4 py-1.5 text-sm font-bold ${
            tab === "qa" ? "bg-orange-50 text-orange-700" : "text-slate-500"
          }`}
        >
          پرسش و پاسخ ({toFaDigits(questions.length)})
        </button>
      </div>

      {tab === "reviews" && (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl bg-slate-50 p-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-bold">{r.userName}</span>
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <Stars value={r.rating} className="size-3.5" />
                  {r.date}
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-600">{r.body}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-center text-sm text-slate-400">هنوز نظری ثبت نشده است.</p>
          )}

          <div className="rounded-xl border border-slate-200 p-4">
            <h4 className="mb-3 text-sm font-black">ثبت نظر جدید</h4>
            {!isLoggedIn ? (
              <a href="/login" className="btn-outline">برای ثبت نظر وارد شوید</a>
            ) : (
              <form action={reviewAction} className="space-y-3">
                <input type="hidden" name="productId" value={productId} />
                <input type="hidden" name="rating" value={rating} />
                <div className="flex items-center gap-1" dir="ltr">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={n <= rating ? "text-amber-400" : "text-slate-300"}
                      aria-label={`${n} ستاره`}
                    >
                      <Star className={`size-6 ${n <= rating ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  name="body"
                  rows={3}
                  className="input"
                  placeholder="تجربه خود از این قطعه را بنویسید..."
                />
                {reviewState.error && <p className="text-sm text-red-600">{reviewState.error}</p>}
                {reviewState.success && (
                  <p className="text-sm text-emerald-600">{reviewState.success}</p>
                )}
                <SubmitButton pendingText="در حال ثبت...">ثبت نظر</SubmitButton>
              </form>
            )}
          </div>
        </div>
      )}

      {tab === "qa" && (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id} className="space-y-2">
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <span className="badge bg-slate-200 text-slate-600">سوال</span>
                <p className="mt-2 leading-6">{q.body}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm">
                <span className="badge bg-emerald-200 text-emerald-800">پاسخ یدکی</span>
                <p className="mt-2 leading-6">{q.answer}</p>
                <span className="mt-1 block text-[11px] text-slate-400">{q.date}</span>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-center text-sm text-slate-400">هنوز سوالی پاسخ داده نشده است.</p>
          )}

          <div className="rounded-xl border border-slate-200 p-4">
            <h4 className="mb-3 text-sm font-black">پرسش خود را بپرسید</h4>
            {!isLoggedIn ? (
              <a href="/login" className="btn-outline">برای پرسش وارد شوید</a>
            ) : (
              <form action={questionAction} className="space-y-3">
                <input type="hidden" name="productId" value={productId} />
                <textarea
                  name="body"
                  rows={2}
                  className="input"
                  placeholder="سوال خود درباره این قطعه بنویسید..."
                />
                {questionState.error && <p className="text-sm text-red-600">{questionState.error}</p>}
                {questionState.success && (
                  <p className="text-sm text-emerald-600">{questionState.success}</p>
                )}
                <SubmitButton pendingText="در حال ارسال...">ارسال پرسش</SubmitButton>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
