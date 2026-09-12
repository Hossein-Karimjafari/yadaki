"use client";

import { useActionState } from "react";
import { CircleCheck } from "lucide-react";
import { createReturnAction, type ReturnState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initial: ReturnState = {};

export function ReturnForm({ orderId }: { orderId: string }) {
  const [state, action] = useActionState(createReturnAction, initial);

  if (state.success) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
        <CircleCheck className="size-5 shrink-0" />
        {state.success}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">نوع درخواست</label>
          <select name="type" className="input">
            <option value="RETURN">مرجوعی کالا</option>
            <option value="WARRANTY">اعلام گارانتی</option>
          </select>
        </div>
        <div>
          <label className="label">دلیل</label>
          <select name="reason" className="input">
            <option>خرابی یا معیوب بودن قطعه</option>
            <option>عدم تطابق با خودرو</option>
            <option>انصراف از خرید</option>
            <option>آسیب در حمل</option>
            <option>سایر</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label">توضیحات</label>
        <textarea
          name="description"
          rows={3}
          className="input"
          placeholder="شرح مشکل یا توضیحات بیشتر..."
        />
      </div>
      {state.error && <p className="text-sm font-bold text-red-600">{state.error}</p>}
      <SubmitButton className="btn-outline w-full" pendingText="در حال ثبت...">
        ثبت درخواست مرجوعی / گارانتی
      </SubmitButton>
    </form>
  );
}
