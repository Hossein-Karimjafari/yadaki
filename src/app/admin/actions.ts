"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function toggleProductStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return;
  const next = product.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
  await prisma.product.update({ where: { id }, data: { status: next } });
  revalidatePath("/admin/products");
}

export async function adjustStockAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const delta = parseInt(String(formData.get("delta") ?? "0"), 10);
  const note = String(formData.get("note") ?? "") || undefined;
  if (!id || !delta) return;
  await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: { stock: { increment: delta } } });
    await tx.stockMovement.create({
      data: {
        productId: id,
        type: delta > 0 ? "IN" : "OUT",
        qty: Math.abs(delta),
        note: note ?? "اصلاح دستی مدیر",
      },
    });
  });
  revalidatePath("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export interface ProductFormState {
  error?: string;
  success?: string;
}

function slugify(text: string): string {
  return (
    text
      .trim()
      .replace(/[\s\u200c]+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .toLowerCase() || `p-${Date.now()}`
  );
}

function parseTiers(raw: string): Array<{ minQty: number; price: number }> {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [qty, price] = l.split(":");
      return { minQty: parseInt(qty?.trim(), 10) || 0, price: parseInt(price?.trim(), 10) || 0 };
    })
    .filter((t) => t.minQty > 0 && t.price > 0);
}

function productData(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = parseInt(String(formData.get("price") ?? "0").replace(/\D/g, ""), 10) || 0;
  const partnerPrice = String(formData.get("partnerPrice") ?? "").replace(/\D/g, "");
  const discountPrice = String(formData.get("discountPrice") ?? "").replace(/\D/g, "");
  const stock = parseInt(String(formData.get("stock") ?? "0").replace(/\D/g, ""), 10) || 0;
  const warrantyMonths = parseInt(String(formData.get("warrantyMonths") ?? "0"), 10) || 0;
  const minOrderQty = parseInt(String(formData.get("minOrderQty") ?? "1"), 10) || 1;
  const maxOrderQty = String(formData.get("maxOrderQty") ?? "").trim();
  const lowStockAt = parseInt(String(formData.get("lowStockAt") ?? "3"), 10) || 3;

  if (name.length < 3) return { error: "نام محصول را وارد کنید" } as const;
  if (price <= 0) return { error: "قیمت نامعتبر است" } as const;

  return {
    error: null,
    data: {
      name,
      slug: String(formData.get("slug") ?? "").trim() || slugify(name),
      categoryId: String(formData.get("categoryId") ?? ""),
      brandId: String(formData.get("brandId") ?? ""),
      condition: (String(formData.get("condition") ?? "NEW") as "NEW"),
      price,
      partnerPrice: partnerPrice ? parseInt(partnerPrice, 10) : null,
      discountPrice: discountPrice ? parseInt(discountPrice, 10) : null,
      stock,
      lowStockAt,
      warrantyMonths,
      minOrderQty,
      maxOrderQty: maxOrderQty ? parseInt(maxOrderQty, 10) : null,
      country: String(formData.get("country") ?? "").trim() || null,
      partNumber: String(formData.get("partNumber") ?? "").trim() || null,
      oemNumber: String(formData.get("oemNumber") ?? "").trim() || null,
      technicalCode: String(formData.get("technicalCode") ?? "").trim() || null,
      shortDesc: String(formData.get("shortDesc") ?? "").trim() || null,
      longDesc: String(formData.get("longDesc") ?? "").trim() || null,
      specs: String(formData.get("specs") ?? "").trim() || null,
      isFeatured: formData.get("isFeatured") === "1",
      isNew: formData.get("isNew") === "1",
      isBestSeller: formData.get("isBestSeller") === "1",
      hasFreeShipping: formData.get("hasFreeShipping") === "1",
    },
  };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = productData(formData);
  if (parsed.error) return { error: parsed.error };

  const { data } = parsed;
  const exists = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (exists) return { error: "این slug قبلاً استفاده شده است" };

  const tiers = parseTiers(String(formData.get("tiers") ?? ""));
  await prisma.product.create({
    data: {
      ...data,
      condition: data.condition,
      tiers: { create: tiers },
      images: { create: { url: "/part-placeholder.svg", alt: data.name, order: 0 } },
    },
  });
  revalidatePath("/admin/products");
  redirect(`/admin/products`);
}

export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = productData(formData);
  if (parsed.error) return { error: parsed.error };

  const { data } = parsed;
  const tiers = parseTiers(String(formData.get("tiers") ?? ""));
  await prisma.$transaction([
    prisma.priceTier.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        ...data,
        condition: data.condition,
        tiers: { create: tiers },
      },
    }),
  ]);
  revalidatePath("/admin/products");
  return { success: "تغییرات ذخیره شد" };
}

const ORDER_TRANSITIONS: Record<string, string[]> = {
  PAID: ["PROCESSING", "PACKAGING", "CANCELED"],
  PROCESSING: ["PACKAGING", "INCOMPLETE", "CANCELED"],
  PACKAGING: ["SHIPPED", "CANCELED"],
  SHIPPED: ["DELIVERED", "AWAITING_RETURN"],
  DELIVERED: ["AWAITING_RETURN"],
};

export async function setOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");
  const code = String(formData.get("code") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!orderId || !status) return;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  const allowed = ORDER_TRANSITIONS[order.status];
  if (order.status !== "PENDING_PAYMENT" && allowed && !allowed.includes(status)) return;
  if (order.status === "PENDING_PAYMENT") return;

  if (status === "CANCELED") {
    await prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.qty } },
        });
        await tx.stockMovement.create({
          data: { productId: item.productId, type: "RETURN", qty: item.qty, note: `لغو سفارش ${code}` },
        });
      }
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELED", statusHistory: { create: { status: "CANCELED", note: "لغو توسط مدیر" } } },
      });
    });
  } else {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: status as never,
        statusHistory: { create: { status: status as never, note: "تغییر توسط مدیر" } },
      },
    });
  }
  revalidatePath(`/admin/orders/${code}`);
  revalidatePath("/admin/orders");
}

export async function answerQuoteAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const answer = String(formData.get("answer") ?? "").trim();
  if (!id || answer.length < 3) return;
  await prisma.quoteRequest.update({
    where: { id },
    data: { answer, status: "ANSWERED" },
  });
  revalidatePath("/admin/quotes");
}

export async function closeQuoteAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.quoteRequest.update({ where: { id }, data: { status: "CLOSED" } });
  revalidatePath("/admin/quotes");
}

export async function resolvePartnerAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const req = await prisma.partnerRequest.findUnique({ where: { id } });
  if (!req) return;
  if (decision === "APPROVE") {
    const role = req.type === "WHOLESALE" ? "WHOLESALE" : "MECHANIC";
    await prisma.$transaction([
      prisma.partnerRequest.update({ where: { id }, data: { status: "APPROVED" } }),
      prisma.user.update({ where: { id: req.userId }, data: { role, status: "ACTIVE" } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.partnerRequest.update({ where: { id }, data: { status: "REJECTED" } }),
      prisma.user.update({ where: { id: req.userId }, data: { status: "ACTIVE" } }),
    ]);
  }
  revalidatePath("/admin/partners");
}

export async function moderateReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return;
  if (decision === "APPROVE") {
    await prisma.review.update({ where: { id }, data: { isApproved: true } });
  } else if (decision === "DELETE") {
    await prisma.review.delete({ where: { id } });
  }
  const agg = await prisma.review.aggregate({
    where: { productId: review.productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: review.productId },
    data: {
      ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      ratingCount: agg._count.rating,
    },
  });
  revalidatePath("/admin/reviews");
}

export async function answerQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const answer = String(formData.get("answer") ?? "").trim();
  if (!id || answer.length < 3) return;
  await prisma.question.update({
    where: { id },
    data: { answer, answeredAt: new Date() },
  });
  revalidatePath("/admin/questions");
}

export async function deleteQuestionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await prisma.question.delete({ where: { id } });
  revalidatePath("/admin/questions");
}

export async function setReturnStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = ["PENDING", "APPROVED", "REJECTED", "RECEIVED", "REPAIRING", "REPLACED", "REFUNDED"];
  if (!allowed.includes(status)) return;
  await prisma.returnRequest.update({
    where: { id },
    data: { status: status as never },
  });
  revalidatePath("/admin/returns");
}

export async function createCouponAction(formData: FormData) {
  await requireAdmin();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "PERCENT") === "FIXED" ? "FIXED" : "PERCENT";
  const value = parseInt(String(formData.get("value") ?? "0").replace(/\D/g, ""), 10) || 0;
  const minSubtotal = String(formData.get("minSubtotal") ?? "").replace(/\D/g, "");
  const maxDiscount = String(formData.get("maxDiscount") ?? "").replace(/\D/g, "");
  const usageLimit = String(formData.get("usageLimit") ?? "").replace(/\D/g, "");
  const endsAt = String(formData.get("endsAt") ?? "").trim();
  if (!code || value <= 0) return;
  try {
    await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        minSubtotal: minSubtotal ? parseInt(minSubtotal, 10) : null,
        maxDiscount: maxDiscount ? parseInt(maxDiscount, 10) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });
  } catch {}
  revalidatePath("/admin/coupons");
}

export async function toggleCouponAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) return;
  await prisma.coupon.update({ where: { id }, data: { isActive: !coupon.isActive } });
  revalidatePath("/admin/coupons");
}

export async function updateUserRoleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "CUSTOMER");
  const allowed = ["CUSTOMER", "MECHANIC", "WHOLESALE", "ADMIN"];
  if (!allowed.includes(role)) return;
  await prisma.user.update({
    where: { id },
    data: { role: role as never, status: "ACTIVE" },
  });
  revalidatePath("/admin/users");
}

export async function toggleUserBlockAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return;
  await prisma.user.update({
    where: { id },
    data: { status: user.status === "BLOCKED" ? "ACTIVE" : "BLOCKED" },
  });
  revalidatePath("/admin/users");
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const parentId = String(formData.get("parentId") ?? "").trim();
  if (name.length < 2) return;
  try {
    await prisma.category.create({
      data: { name, slug: slug || slugify(name), icon: icon || null, parentId: parentId || null },
    });
  } catch {}
  revalidatePath("/admin/catalog");
}

export async function createBrandAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const isOriginal = formData.get("isOriginal") === "1";
  if (name.length < 2) return;
  try {
    await prisma.brand.create({
      data: { name, slug: slug || slugify(name), country: country || null, isOriginal },
    });
  } catch {}
  revalidatePath("/admin/catalog");
}

export async function createPostAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const publish = formData.get("publish") === "1";
  if (title.length < 5) return { error: "عنوان مقاله را وارد کنید" };
  if (body.length < 50) return { error: "متن مقاله بسیار کوتاه است" };
  try {
    await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        body,
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });
  } catch {
    return { error: "slug تکراری است" };
  }
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  return { success: "مقاله ذخیره شد" };
}

export async function togglePostPublishAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;
  await prisma.post.update({
    where: { id },
    data: {
      isPublished: !post.isPublished,
      publishedAt: !post.isPublished ? new Date() : post.publishedAt,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}
