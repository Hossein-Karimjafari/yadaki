"use client";

import { useActionState } from "react";
import { saveAddressAction, type SimpleState } from "../actions";
import { SubmitButton } from "@/components/submit-button";

const initial: SimpleState = {};

export function AddressForm() {
  const [state, action] = useActionState(saveAddressAction, initial);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label">نام گیرنده</label>
        <input name="receiverName" className="input" required />
      </div>
      <div>
        <label className="label">موبایل گیرنده</label>
        <input name="receiverPhone" className="input" placeholder="09xxxxxxxxx" dir="ltr" required />
      </div>
      <div>
        <label className="label">استان</label>
        <input name="province" className="input" required />
      </div>
      <div>
        <label className="label">شهر</label>
        <input name="city" className="input" required />
      </div>
      <div className="sm:col-span-2">
        <label className="label">نشانی کامل</label>
        <textarea name="addressLine" rows={2} className="input" required />
      </div>
      <div>
        <label className="label">کد پستی (اختیاری)</label>
        <input name="postalCode" className="input" inputMode="numeric" dir="ltr" />
      </div>
      <div className="sm:col-span-2">
        {state.error && <p className="mb-2 text-sm font-bold text-red-600">{state.error}</p>}
        {state.success && <p className="mb-2 text-sm font-bold text-emerald-600">{state.success}</p>}
        <SubmitButton pendingText="در حال ذخیره...">افزودن آدرس</SubmitButton>
      </div>
    </form>
  );
}
