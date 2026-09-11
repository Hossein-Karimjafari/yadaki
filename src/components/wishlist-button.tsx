"use client";

import { useActionState } from "react";
import { toggleWishlistAction, type WishlistState } from "@/app/actions/wishlist";

const initial: WishlistState = {};

export function WishlistButton({
  productId,
  initiallyAdded,
}: {
  productId: string;
  initiallyAdded: boolean;
}) {
  const [state, action] = useActionState(toggleWishlistAction, initial);
  const added = state.added ?? initiallyAdded;

  return (
    <form action={action}>
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        className={`btn-outline w-full ${added ? "!border-red-200 !bg-red-50 !text-red-600" : ""}`}
        title={added ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      >
        {added ? "♥ در علاقه‌مندی‌ها" : "♡ علاقه‌مندی"}
      </button>
      {state.error && (
        <a href="/login" className="mt-1 block text-center text-[11px] text-orange-600 hover:underline">
          {state.error}
        </a>
      )}
    </form>
  );
}
