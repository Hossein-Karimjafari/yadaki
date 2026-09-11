"use client";

import { useActionState } from "react";
import { requestOtpAction, verifyOtpAction, type LoginState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { toFaDigits } from "@/lib/format";

const initial: LoginState = { step: "phone" };

export function LoginForm({ next }: { next?: string }) {
  const [state, phoneAction] = useActionState(requestOtpAction, initial);
  const [codeState, codeAction] = useActionState(verifyOtpAction, state);

  if (state.step === "code" || codeState.step === "code") {
    const phone = codeState.phone ?? state.phone ?? "";
    return (
      <form action={codeAction} className="space-y-4">
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="next" value={next ?? ""} />
        <p className="rounded-xl bg-orange-50 p-3 text-center text-sm text-orange-800">
          کد ۶ رقمی به شماره <b dir="ltr">{toFaDigits(phone)}</b> پیامک شد
        </p>
        <div>
          <label className="label">کد تأیید</label>
          <input
            name="code"
            className="input text-center text-lg tracking-[0.5em]"
            inputMode="numeric"
            maxLength={6}
            dir="ltr"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="label">نام و نام خانوادگی (فقط بار اول)</label>
          <input name="name" className="input" placeholder="اختیاری" />
        </div>
        {codeState.error && (
          <p className="rounded-lg bg-red-50 p-2.5 text-sm font-bold text-red-700">{codeState.error}</p>
        )}
        <SubmitButton className="btn-primary w-full !py-3" pendingText="بررسی کد...">
          ورود به حساب
        </SubmitButton>
        <a href="/login" className="block text-center text-xs text-slate-400 hover:text-orange-600">
          تغییر شماره موبایل
        </a>
      </form>
    );
  }

  return (
    <form action={phoneAction} className="space-y-4">
      <div>
        <label className="label">شماره موبایل</label>
        <input
          name="phone"
          className="input text-center text-lg"
          placeholder="09xxxxxxxxx"
          inputMode="tel"
          dir="ltr"
          autoFocus
          required
        />
      </div>
      {state.error && (
        <p className="rounded-lg bg-red-50 p-2.5 text-sm font-bold text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 p-2.5 text-sm font-bold text-emerald-700">{state.success}</p>
      )}
      <SubmitButton className="btn-primary w-full !py-3" pendingText="در حال ارسال کد...">
        دریافت کد تأیید
      </SubmitButton>
      <p className="text-center text-[11px] leading-5 text-slate-400">
        با ورود، <a href="#" className="text-orange-600">قوانین و مقررات</a> یدکی را می‌پذیرید.
        حساب کاربری جدید به‌صورت خودکار ساخته می‌شود.
      </p>
    </form>
  );
}
