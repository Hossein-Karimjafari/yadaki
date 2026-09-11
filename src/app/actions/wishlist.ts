"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface WishlistState {
  added?: boolean;
  error?: string;
}

export async function toggleWishlistAction(
  _prev: WishlistState,
  formData: FormData
): Promise<WishlistState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { error: "برای ذخیره در علاقه‌مندی‌ها وارد شوید" };
  }
  const productId = String(formData.get("productId") ?? "");
  if (!productId) return { error: "محصول نامعتبر" };

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    return { added: false };
  }
  await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidatePath("/account/wishlist");
  return { added: true };
}

export async function removeWishlistAction(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId") ?? "");
  await prisma.wishlistItem.deleteMany({
    where: { userId: user.id, productId },
  });
  revalidatePath("/account/wishlist");
}
