"use client";

import { useActionState } from "react";
import { applyCouponAction, type ActionState } from "@/app/actions/cart";
import { SubmitButton } from "@/components/submit-button";

const initial: ActionState = {};

export function CouponForm({ appliedCode }: { appliedCode: string | null }) {
  const [state, formAction] = useActionState(applyCouponAction, initial);

  return (
    <form action={formAction} className="mb-3">
      <div className="flex gap-2">
        <input
          name="code"
          className="input !py-2 text-xs"
          placeholder="کد تخفیف"
          defaultValue={appliedCode ?? ""}
          dir="ltr"
        />
        <SubmitButton className="btn-outline !py-2 text-xs" pendingText="...">
          {appliedCode ? "تغییر" : "اعمال"}
        </SubmitButton>
      </div>
      {appliedCode && (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="badge bg-emerald-50 text-emerald-700">کد {appliedCode} فعال است</span>
          <button
            name="remove"
            value="1"
            className="text-red-500 hover:underline"
          >
            حذف کد
          </button>
        </div>
      )}
      {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="mt-1 text-xs text-emerald-600">{state.success}</p>}
    </form>
  );
}
