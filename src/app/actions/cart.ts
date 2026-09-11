"use server";

import { prisma } from "@/lib/prisma";
import {
  addToCart,
  updateCartItem,
  clearCartItems,
  readCartToken,
} from "@/lib/cart";
import { rateLimitAction } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

export interface ActionState {
  error?: string;
  success?: string;
}

export async function addToCartAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const productId = String(formData.get("productId") ?? "");
  const qty = Math.max(1, parseInt(String(formData.get("qty") ?? "1"), 10) || 1);
  if (!productId) return { error: "محصول نامعتبر است" };
  try {
    await addToCart(productId, qty);
    revalidatePath("/cart");
    return { success: "به سبد خرید اضافه شد" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "خطای نامشخص" };
  }
}

export async function updateCartQtyAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const qty = parseInt(String(formData.get("qty") ?? "0"), 10) || 0;
  try {
    await updateCartItem(productId, qty);
  } catch {
    revalidatePath("/cart");
  }
  revalidatePath("/cart");
}

export async function removeCartItemAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const t = await readCartToken();
  if (t) {
    const cart = await prisma.cart.findUnique({ where: { token: t } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    }
  }
  revalidatePath("/cart");
}

export async function clearCartAction() {
  const t = await readCartToken();
  if (!t) return;
  const cart = await prisma.cart.findUnique({ where: { token: t } });
  if (cart) await clearCartItems(cart.id);
  revalidatePath("/cart");
}

export async function applyCouponAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const remove = formData.get("remove") === "1";
  const t = await readCartToken();
  if (!t) return { error: "سبد خرید یافت نشد" };
  const cart = await prisma.cart.findUnique({ where: { token: t } });
  if (!cart) return { error: "سبد خرید یافت نشد" };
  if (!rateLimitAction(`coupon:${cart.id}`, 10, 60_000)) {
    return { error: "تلاش بیش از حد. لطفاً کمی صبر کنید" };
  }
  if (remove) {
    await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } });
    revalidatePath("/cart");
    return { success: "کد تخفیف حذف شد" };
  }
  if (!code) return { error: "کد تخفیف را وارد کنید" };
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) return { error: "کد تخفیف نامعتبر است" };
  await prisma.cart.update({ where: { id: cart.id }, data: { couponCode: code } });
  revalidatePath("/cart");
  return { success: "کد تخفیف اعمال شد" };
}
