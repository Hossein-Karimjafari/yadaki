"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ReviewState {
  error?: string;
  success?: string;
}

export async function submitReviewAction(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) return { error: "برای ثبت نظر ابتدا وارد شوید" };
  const productId = String(formData.get("productId") ?? "");
  const rating = parseInt(String(formData.get("rating") ?? "5"), 10);
  const body = String(formData.get("body") ?? "").trim();
  if (!productId || body.length < 5) return { error: "متن نظر بسیار کوتاه است" };
  const ratingClamped = Math.min(5, Math.max(1, rating || 5));

  await prisma.review.create({
    data: { productId, userId: user.id, rating: ratingClamped, body, isApproved: false },
  });

  const agg = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      ratingCount: agg._count.rating,
    },
  });

  revalidatePath(`/p/${(await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } }))?.slug}`);
  return { success: "نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود." };
}

export async function submitQuestionAction(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) return { error: "برای پرسش ابتدا وارد شوید" };
  const productId = String(formData.get("productId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!productId || body.length < 5) return { error: "متن سوال بسیار کوتاه است" };
  await prisma.question.create({ data: { productId, userId: user.id, body } });
  return { success: "سوال شما ثبت شد و به‌زودی پاسخ داده می‌شود." };
}
