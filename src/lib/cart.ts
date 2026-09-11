import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { resolvePrice } from "./price";
import type { Prisma, Product, UserRole } from "@prisma/client";

const CART_COOKIE = "yadaki_cart";

function genToken(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export async function readCartToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

export async function ensureCart(userId: string | null): Promise<string> {
  const store = await cookies();
  let token = store.get(CART_COOKIE)?.value;
  let cart = token ? await prisma.cart.findUnique({ where: { token } }) : null;
  if (!cart) {
    token = genToken();
    cart = await prisma.cart.create({ data: { token, userId } });
    store.set(CART_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 60,
      path: "/",
    });
  }
  if (userId && cart.userId !== userId) {
    const old = await prisma.cart.findFirst({ where: { userId }, include: { items: true } });
    if (old && old.token !== cart.token) {
      for (const item of old.items) {
        await prisma.cartItem.upsert({
          where: { cartId_productId: { cartId: cart.id, productId: item.productId } },
          create: { cartId: cart.id, productId: item.productId, qty: item.qty, unitPrice: item.unitPrice },
          update: { qty: { increment: item.qty } },
        });
      }
      await prisma.cart.delete({ where: { id: old.id } }).catch(() => {});
    }
    cart = await prisma.cart.update({ where: { id: cart.id }, data: { userId } });
  }
  return cart.id;
}

export async function getCartWithItems() {
  const token = await readCartToken();
  if (!token) return null;
  const cart = await prisma.cart.findUnique({
    where: { token },
    include: {
      items: {
        include: {
          product: {
            include: { brand: true, category: true, images: true, tiers: { orderBy: { minQty: "asc" } } },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!cart || cart.items.length === 0) return null;
  return cart;
}

export async function computeCartTotals(
  items: Array<{ product: Product & { tiers?: Array<{ minQty: number; price: number }> }; qty: number }>,
  role: UserRole | null,
  couponCode?: string | null
) {
  const lines = items.map((it) => {
    const rp = resolvePrice(it.product, role);
    let unitPrice = rp.final;
    if (it.product.tiers?.length) {
      const eligible = it.product.tiers
        .filter((t) => it.qty >= t.minQty)
        .sort((a, b) => b.minQty - a.minQty)[0];
      if (eligible && eligible.price < unitPrice) unitPrice = eligible.price;
    }
    return {
      productId: it.product.id,
      qty: it.qty,
      unitPrice,
      lineTotal: unitPrice * it.qty,
      stock: it.product.stock,
    };
  });
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  let discount = 0;
  let appliedCoupon: string | null = null;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    const valid =
      coupon &&
      coupon.isActive &&
      (!coupon.startsAt || coupon.startsAt <= new Date()) &&
      (!coupon.endsAt || coupon.endsAt >= new Date()) &&
      (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
      (!coupon.minSubtotal || subtotal >= coupon.minSubtotal);
    if (valid) {
      discount =
        coupon.type === "PERCENT"
          ? Math.min(Math.floor((subtotal * coupon.value) / 100), coupon.maxDiscount ?? Number.MAX_SAFE_INTEGER)
          : coupon.value;
      discount = Math.min(discount, subtotal);
      appliedCoupon = coupon.code;
    }
  }

  return { lines, subtotal, discount, couponCode: appliedCoupon };
}

export async function addToCart(productId: string, qty: number) {
  const cartId = await ensureCart(null);
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE") throw new Error("محصول یافت نشد");
  if (product.stock < qty) throw new Error("موجودی کافی نیست");
  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
  });
  const newQty = (existing?.qty ?? 0) + qty;
  if (product.maxOrderQty && newQty > product.maxOrderQty) throw new Error("حداکثر تعداد مجاز");
  if (product.stock < newQty) throw new Error("موجودی کافی نیست");
  const rp = resolvePrice(product, null);
  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId, productId } },
    create: { cartId, productId, qty: newQty, unitPrice: rp.final },
    update: { qty: newQty, unitPrice: rp.final },
  });
}

export async function updateCartItem(productId: string, qty: number) {
  const token = await readCartToken();
  if (!token) return;
  const cart = await prisma.cart.findUnique({ where: { token } });
  if (!cart) return;
  if (qty <= 0) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
  } else {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return;
    if (product.maxOrderQty && qty > product.maxOrderQty) throw new Error("حداکثر تعداد مجاز");
    if (product.stock < qty) throw new Error("موجودی کافی نیست");
    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { qty },
    });
  }
}

export async function clearCartItems(cartId: string) {
  await prisma.cartItem.deleteMany({ where: { cartId } });
}

export async function cartItemsCount(): Promise<number> {
  const token = await readCartToken();
  if (!token) return 0;
  const cart = await prisma.cart.findUnique({
    where: { token },
    include: { items: { select: { qty: true } } },
  });
  return cart ? cart.items.reduce((s, i) => s + i.qty, 0) : 0;
}

export type { Prisma };
