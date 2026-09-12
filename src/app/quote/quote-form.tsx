"use client";

import { useActionState } from "react";
import { CircleCheck } from "lucide-react";
import { submitQuoteAction, type QuoteState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initial: QuoteState = {};

export function QuoteForm({
  defaultName,
  defaultPhone,
}: {
  defaultName: string;
  defaultPhone: string;
}) {
  const [state, action] = useActionState(submitQuoteAction, initial);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CircleCheck className="size-9" />
        </span>
        <h3 className="mt-3 text-lg font-black text-emerald-800">درخواست شما ثبت شد</h3>
        <p className="mt-2 text-sm leading-7 text-emerald-700">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">نام و نام خانوادگی</label>
          <input name="name" className="input" defaultValue={defaultName} required />
        </div>
        <div>
          <label className="label">شماره موبایل</label>
          <input
            name="phone"
            className="input"
            defaultValue={defaultPhone}
            placeholder="09xxxxxxxxx"
            dir="ltr"
            required
          />
        </div>
      </div>
      <div>
        <label className="label">لیست قطعات موردنیاز</label>
        <textarea
          name="items"
          rows={6}
          className="input"
          placeholder={"هر خط یک قطعه:\nلنت ترمز جلو ۲۰۶ × ۲\nواترپمپ پارس\nفیلتر روغن پراید × ۱۰"}
          required
        />
        <p className="mt-1.5 text-[11px] text-slate-400">
          اگر کد فنی یا شماره OEM قطعه را دارید، حتماً در همین خط بنویسید تا دقیق‌تر استعلام شود.
        </p>
      </div>
      <div>
        <label className="label">توضیحات تکمیلی (اختیاری)</label>
        <textarea
          name="message"
          rows={3}
          className="input"
          placeholder="مثلاً: خودروی من پژو پارس TU5 مدل ۹۲ است، یا: برای تعمیرگاه به قیمت عمده نیاز دارم"
        />
      </div>
      {state.error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p>
      )}
      <SubmitButton className="btn-primary w-full !py-3" pendingText="در حال ارسال...">
        ثبت درخواست استعلام
      </SubmitButton>
    </form>
  );
}
