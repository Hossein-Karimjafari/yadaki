"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ensureCart } from "@/lib/cart";
import { createOrderFromCart, type CheckoutInput } from "@/lib/orders";
import { getGateway } from "@/lib/gateway";
import { isValidIranMobile } from "@/lib/normalize";
import { rateLimitAction } from "@/lib/rate-limit";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export interface CheckoutState {
  error?: string;
}

export async function submitCheckoutAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const user = await getCurrentUser();

  if (!rateLimitAction(`checkout:${user?.id ?? "guest"}`, 5, 60_000)) {
    return { error: "تلاش بیش از حد. لطفاً کمی صبر کنید." };
  }

  const input: CheckoutInput = {
    receiverName: String(formData.get("receiverName") ?? "").trim(),
    receiverPhone: String(formData.get("receiverPhone") ?? "").trim(),
    province: String(formData.get("province") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    addressLine: String(formData.get("addressLine") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim() || undefined,
    note: String(formData.get("note") ?? "").trim() || undefined,
    shippingMethodId: String(formData.get("shippingMethodId") ?? ""),
  };

  if (input.receiverName.length < 3) return { error: "نام گیرنده را کامل وارد کنید" };
  if (!isValidIranMobile(input.receiverPhone))
    return { error: "شماره موبایل معتبر نیست (مثال: 09121234567)" };
  if (!input.province || !input.city || input.addressLine.length < 10)
    return { error: "آدرس را کامل وارد کنید" };
  if (input.postalCode && !/^\d{10}$/.test(input.postalCode.replace(/\D/g, "")))
    return { error: "کد پستی باید ۱۰ رقم باشد" };
  if (!input.shippingMethodId) return { error: "روش ارسال را انتخاب کنید" };

  let cartId: string;
  try {
    cartId = await ensureCart(user?.id ?? null);
  } catch {
    return { error: "سبد خرید یافت نشد" };
  }

  try {
    const order = await createOrderFromCart({
      cartId,
      userId: user?.id ?? null,
      role: user?.role ?? null,
      input,
    });

    const h = await headers();
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `http://${h.get("host") ?? "localhost:3000"}`;
    const gateway = getGateway(process.env.PAYMENT_GATEWAY ?? "sandbox");
    const redirectRes = await gateway.request({
      orderCode: order.code,
      amount: order.total,
      description: `پرداخت سفارش ${order.code} - فروشگاه یدکی`,
      callbackUrl: `${origin}/api/payment/callback?order=${order.code}`,
      mobile: input.receiverPhone,
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        gateway: gateway.id,
        amount: order.total,
        status: "PENDING",
        authority: order.code,
      },
    });

    redirect(redirectRes.url);
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    return { error: e instanceof Error ? e.message : "خطا در ثبت سفارش" };
  }
}
