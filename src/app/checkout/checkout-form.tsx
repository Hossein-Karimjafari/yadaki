"use client";

import { useActionState, useState } from "react";
import { submitCheckoutAction, type CheckoutState } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { formatToman } from "@/lib/format";

interface Method {
  id: string;
  name: string;
  cost: number;
  etaDays: string | null;
}
interface Addr {
  id: string;
  title: string | null;
  province: string;
  city: string;
  addressLine: string;
  postalCode: string | null;
  receiverName: string;
  receiverPhone: string;
}

const initial: CheckoutState = {};

export function CheckoutForm({
  shippingMethods,
  addresses,
  defaultName,
  defaultPhone,
}: {
  shippingMethods: Method[];
  addresses: Addr[];
  defaultName: string;
  defaultPhone: string;
}) {
  const [state, formAction] = useActionState(submitCheckoutAction, initial);
  const [selectedAddr, setSelectedAddr] = useState<string>("");
  const [method, setMethod] = useState<string>(shippingMethods[0]?.id ?? "");

  function applyAddress(id: string) {
    const a = addresses.find((x) => x.id === id);
    if (!a) return;
    setSelectedAddr(id);
    const form = document.getElementById("checkout-form") as HTMLFormElement;
    if (!form) return;
    (form.elements.namedItem("receiverName") as HTMLInputElement).value = a.receiverName;
    (form.elements.namedItem("receiverPhone") as HTMLInputElement).value = a.receiverPhone;
    (form.elements.namedItem("province") as HTMLInputElement).value = a.province;
    (form.elements.namedItem("city") as HTMLInputElement).value = a.city;
    (form.elements.namedItem("addressLine") as HTMLTextAreaElement).value = a.addressLine;
    (form.elements.namedItem("postalCode") as HTMLInputElement).value = a.postalCode ?? "";
  }

  const selectedMethod = shippingMethods.find((m) => m.id === method);

  return (
    <form id="checkout-form" action={formAction} className="space-y-4">
      {addresses.length > 0 && (
        <div className="card p-5">
          <h3 className="mb-3 font-black">آدرس‌های ذخیره‌شده</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {addresses.map((a) => (
              <button
                type="button"
                key={a.id}
                onClick={() => applyAddress(a.id)}
                className={`rounded-xl border p-3 text-right text-xs leading-5 ${
                  selectedAddr === a.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="font-bold">{a.title ?? a.receiverName}</span>
                <br />
                {a.province}، {a.city}، {a.addressLine}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <h3 className="mb-4 font-black">اطلاعات گیرنده و آدرس</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">نام و نام خانوادگی گیرنده</label>
            <input name="receiverName" className="input" defaultValue={defaultName} required />
          </div>
          <div>
            <label className="label">شماره موبایل گیرنده</label>
            <input
              name="receiverPhone"
              className="input"
              defaultValue={defaultPhone}
              placeholder="09xxxxxxxxx"
              dir="ltr"
              required
            />
          </div>
          <div>
            <label className="label">استان</label>
            <input name="province" className="input" required placeholder="تهران" />
          </div>
          <div>
            <label className="label">شهر</label>
            <input name="city" className="input" required placeholder="تهران" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">نشانی کامل (خیابان، کوچه، پلاک، واحد)</label>
            <textarea name="addressLine" rows={2} className="input" required />
          </div>
          <div>
            <label className="label">کد پستی (اختیاری)</label>
            <input name="postalCode" className="input" inputMode="numeric" dir="ltr" />
          </div>
          <div>
            <label className="label">یادداشت سفارش (اختیاری)</label>
            <input name="note" className="input" placeholder="مثلاً: بعدازظهر تحویل داده شود" />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-black">روش ارسال</h3>
        <div className="grid gap-2">
          {shippingMethods.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm ${
                method === m.id ? "border-orange-500 bg-orange-50" : "border-slate-200"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="shippingMethodId"
                  value={m.id}
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                  className="h-4 w-4 accent-orange-600"
                />
                <span className="font-bold">{m.name}</span>
                {m.etaDays && <span className="text-xs text-slate-400">({m.etaDays})</span>}
              </span>
              <span className="font-black">
                {m.cost === 0 ? "رایگان" : `${formatToman(m.cost)} تومان`}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-2 font-black">روش پرداخت</h3>
        <label className="flex items-center gap-2 rounded-xl border border-orange-500 bg-orange-50 p-3 text-sm">
          <input type="radio" name="payment" value="online" defaultChecked className="h-4 w-4 accent-orange-600" />
          <span className="font-bold">پرداخت آنلاین (درگاه امن بانکی)</span>
        </label>
        {selectedMethod && (
          <p className="mt-3 text-xs text-slate-500">
            هزینه ارسال {selectedMethod.name}: {formatToman(selectedMethod.cost)} تومان — در درگاه پرداخت به مبلغ اضافه می‌شود.
          </p>
        )}
      </div>

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {state.error}
        </div>
      )}

      <SubmitButton className="btn-primary w-full !py-3.5 text-base" pendingText="در حال انتقال به درگاه پرداخت...">
        پرداخت و ثبت نهایی سفارش
      </SubmitButton>
      <p className="text-center text-[11px] text-slate-400">
        با ثبت سفارش، قوانین و مقررات فروشگاه یدکی را می‌پذیرید.
      </p>
    </form>
  );
}
