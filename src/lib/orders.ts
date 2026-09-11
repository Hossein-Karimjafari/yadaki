import { prisma } from "./prisma";
import { computeCartTotals, clearCartItems } from "./cart";
import { sendSms } from "./sms";
import { toFaDigits } from "./format";
import type { UserRole } from "@prisma/client";

export interface CheckoutInput {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode?: string;
  note?: string;
  shippingMethodId: string;
}

function orderCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `YD-${new Date().getFullYear()}${n}`;
}

export async function createOrderFromCart(opts: {
  cartId: string;
  userId: string | null;
  role: UserRole | null;
  input: CheckoutInput;
}) {
  const cart = await prisma.cart.findUnique({
    where: { id: opts.cartId },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) throw new Error("سبد خرید خالی است");

  for (const item of cart.items) {
    if (item.product.stock < item.qty) {
      throw new Error(`موجودی «${item.product.name}» کافی نیست`);
    }
  }

  const method = await prisma.shippingMethod.findFirst({
    where: { id: opts.input.shippingMethodId, isActive: true },
  });
  if (!method) throw new Error("روش ارسال نامعتبر است");

  const totals = await computeCartTotals(
    cart.items.map((i) => ({ product: i.product, qty: i.qty })),
    opts.role,
    cart.couponCode
  );

  const order = await prisma.order.create({
    data: {
      code: orderCode(),
      userId: opts.userId,
      status: "PENDING_PAYMENT",
      subtotal: totals.subtotal,
      discount: totals.discount,
      shippingCost: method.cost,
      tax: 0,
      total: totals.subtotal - totals.discount + method.cost,
      couponCode: totals.couponCode,
      shippingMethod: method.name,
      province: opts.input.province,
      city: opts.input.city,
      addressLine: opts.input.addressLine,
      postalCode: opts.input.postalCode,
      receiverName: opts.input.receiverName,
      receiverPhone: opts.input.receiverPhone,
      note: opts.input.note,
      items: {
        create: cart.items.map((i) => {
          const line = totals.lines.find((l) => l.productId === i.productId)!;
          return {
            productId: i.productId,
            name: i.product.name,
            qty: i.qty,
            unitPrice: line.unitPrice,
            total: line.lineTotal,
          };
        }),
      },
      statusHistory: { create: { status: "PENDING_PAYMENT", note: "سفارش ثبت شد" } },
    },
  });

  if (totals.couponCode) {
    await prisma.coupon.update({
      where: { code: totals.couponCode },
      data: { usedCount: { increment: 1 } },
    });
  }

  return order;
}

export async function finalizePaidOrder(orderId: string, gateway: string, refId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });
  if (!order) throw new Error("سفارش یافت نشد");
  if (order.status !== "PENDING_PAYMENT") return order;

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty }, salesCount: { increment: item.qty } },
      });
      await tx.stockMovement.create({
        data: { productId: item.productId, type: "OUT", qty: item.qty, note: `سفارش ${order.code}` },
      });
    }
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PROCESSING",
        statusHistory: { create: { status: "PROCESSING", note: "پرداخت تأیید شد" } },
      },
    });
    await tx.payment.updateMany({
      where: { orderId: order.id, status: "PENDING" },
      data: { status: "SUCCESS", refId },
    });
  });

  const cart = order.userId
    ? await prisma.cart.findFirst({ where: { userId: order.userId }, orderBy: { updatedAt: "desc" } })
    : null;
  if (cart) await clearCartItems(cart.id);

  await sendSms(
    order.receiverPhone,
    "ORDER_CONFIRM",
    `سفارش ${toFaDigits(order.code)} در یدکی ثبت و پرداخت شد. یدکی`
  );

  return prisma.order.findUnique({ where: { id: order.id } });
}

export async function failOrderPayment(orderId: string) {
  await prisma.payment.updateMany({
    where: { orderId, status: "PENDING" },
    data: { status: "FAILED" },
  });
  await prisma.orderStatusHistory.create({
    data: { orderId, status: "PENDING_PAYMENT", note: "پرداخت ناموفق" },
  });
}
