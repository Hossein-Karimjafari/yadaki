"use client";

import { useActionState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { addToCartAction, type ActionState } from "@/app/actions/cart";
import { SubmitButton } from "./submit-button";

const initial: ActionState = {};

export function AddToCartButton({
  productId,
  disabled = false,
  compact = false,
}: {
  productId: string;
  disabled?: boolean;
  compact?: boolean;
}) {
  const [state, formAction] = useActionState(addToCartAction, initial);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="qty" value="1" />
      <SubmitButton
        className={compact ? "btn-primary !px-3 !py-2 text-xs" : "btn-primary w-full"}
        pendingText="..."
        disabled={disabled}
      >
        {compact ? <ShoppingCart className="size-4" /> : "افزودن به سبد خرید"}
      </SubmitButton>
      {state.error && (
        <span className="text-[11px] text-red-500">{state.error}</span>
      )}
      {state.success && (
        <a href="/cart" className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline">
          {state.success} <ArrowLeft className="size-3" /> مشاهده سبد
        </a>
      )}
      {disabled && !state.error && (
        <span className="text-[11px] text-red-500">ناموجود</span>
      )}
    </form>
  );
}
