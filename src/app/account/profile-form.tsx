"use client";

import { useActionState } from "react";
import { updateProfileAction, type SimpleState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initial: SimpleState = {};

export function ProfileForm({
  name,
  email,
  nationalCode,
}: {
  name: string;
  email: string;
  nationalCode: string;
}) {
  const [state, action] = useActionState(updateProfileAction, initial);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label">نام و نام خانوادگی</label>
        <input name="name" className="input" defaultValue={name} />
      </div>
      <div>
        <label className="label">ایمیل</label>
        <input name="email" className="input" defaultValue={email} dir="ltr" />
      </div>
      <div>
        <label className="label">کد ملی</label>
        <input name="nationalCode" className="input" defaultValue={nationalCode} inputMode="numeric" dir="ltr" />
      </div>
      <div className="sm:col-span-2">
        {state.error && <p className="mb-2 text-sm font-bold text-red-600">{state.error}</p>}
        {state.success && <p className="mb-2 text-sm font-bold text-emerald-600">{state.success}</p>}
        <SubmitButton pendingText="در حال ذخیره...">ذخیره تغییرات</SubmitButton>
      </div>
    </form>
  );
}
