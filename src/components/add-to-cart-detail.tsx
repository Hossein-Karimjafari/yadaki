"use client";

import { useActionState, useState } from "react";
import { addToCartAction, type ActionState } from "@/app/actions/cart";
import { SubmitButton } from "./submit-button";

const initial: ActionState = {};

export function AddToCartDetail({
  productId,
  maxQty,
  disabled,
}: {
  productId: string;
  maxQty: number;
  disabled: boolean;
}) {
  const [state, formAction] = useActionState(addToCartAction, initial);
  const [qty, setQty] = useState(1);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="qty" value={qty} />
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-xl border border-slate-300">
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            className="px-4 py-2 text-lg text-slate-500 hover:text-orange-600"
          >
            +
          </button>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(maxQty, Number(e.target.value) || 1)))}
            className="w-12 border-x border-slate-200 py-2 text-center text-sm font-bold outline-none"
            inputMode="numeric"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2 text-lg text-slate-500 hover:text-orange-600"
          >
            −
          </button>
        </div>
        <SubmitButton className="btn-primary flex-1 !py-3" disabled={disabled} pendingText="در حال افزودن...">
          افزودن به سبد خرید
        </SubmitButton>
      </div>
      {state.error && <p className="text-sm font-bold text-red-600">{state.error}</p>}
      {state.success && (
        <a href="/cart" className="block text-sm font-bold text-emerald-600 hover:underline">
          ✓ {state.success} — مشاهده سبد خرید
        </a>
      )}
      {disabled && !state.error && (
        <p className="text-sm font-bold text-red-600">این کالا فعلاً ناموجود است.</p>
      )}
    </form>
  );
}
