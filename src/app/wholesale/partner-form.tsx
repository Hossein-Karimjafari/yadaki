"use client";

import { useActionState } from "react";
import { submitPartnerAction, type PartnerState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initial: PartnerState = {};

export function PartnerForm({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [state, action] = useActionState(submitPartnerAction, initial);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <span className="text-5xl">🤝</span>
        <h3 className="mt-3 text-lg font-black text-emerald-800">درخواست ثبت شد</h3>
        <p className="mt-2 text-sm leading-7 text-emerald-700">{state.success}</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="card p-8 text-center">
        <p className="mb-4 text-sm leading-7 text-slate-600">
          برای ثبت درخواست همکاری، ابتدا با شماره موبایل وارد حساب شوید.
        </p>
        <a href="/login?next=/wholesale" className="btn-primary">ورود / ثبت‌نام</a>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-4 p-6">
      <div>
        <label className="label">نوع همکاری</label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm has-checked:border-orange-500 has-checked:bg-orange-50">
            <input type="radio" name="type" value="MECHANIC" defaultChecked className="h-4 w-4 accent-orange-600" />
            <span className="font-bold">تعمیرگاه / مکانیک</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm has-checked:border-orange-500 has-checked:bg-orange-50">
            <input type="radio" name="type" value="WHOLESALE" className="h-4 w-4 accent-orange-600" />
            <span className="font-bold">عمده‌فروش / فروشگاه</span>
          </label>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">نام تعمیرگاه / فروشگاه</label>
          <input name="shopName" className="input" required />
        </div>
        <div>
          <label className="label">شهر</label>
          <input name="city" className="input" required />
        </div>
      </div>
      <div>
        <label className="label">توضیحات (اختیاری)</label>
        <textarea
          name="message"
          rows={3}
          className="input"
          placeholder="مثلاً: سابقه ۱۰ سال فعالیت، حجم خرید ماهانه حدود ۵۰ میلیون تومان..."
        />
      </div>
      {state.error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p>
      )}
      <SubmitButton className="btn-primary w-full !py-3" pendingText="در حال ثبت...">
        ثبت درخواست همکاری
      </SubmitButton>
    </form>
  );
}
