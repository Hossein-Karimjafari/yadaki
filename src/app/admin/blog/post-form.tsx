"use client";

import { useActionState } from "react";
import { createPostAction, type ProductFormState } from "../actions";
import { SubmitButton } from "@/components/submit-button";

const initial: ProductFormState = {};

export function PostForm() {
  const [state, action] = useActionState(createPostAction, initial);
  return (
    <form action={action} className="card space-y-4 p-5">
      <h3 className="font-black">مقاله جدید</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">عنوان *</label>
          <input name="title" className="input" required />
        </div>
        <div>
          <label className="label">slug (خالی = خودکار)</label>
          <input name="slug" className="input" dir="ltr" />
        </div>
      </div>
      <div>
        <label className="label">خلاصه</label>
        <textarea name="excerpt" rows={2} className="input" />
      </div>
      <div>
        <label className="label">متن مقاله *</label>
        <textarea name="body" rows={8} className="input" required />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" name="publish" value="1" defaultChecked className="h-4 w-4 accent-orange-600" />
        انتشار فوری
      </label>
      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p>}
      {state.success && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{state.success}</p>}
      <SubmitButton pendingText="در حال ذخیره...">ذخیره مقاله</SubmitButton>
    </form>
  );
}
