"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { rateLimitAction } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

export interface ReturnState {
  error?: string;
  success?: string;
}

const ELIGIBLE = ["PAID", "PROCESSING", "PACKAGING", "SHIPPED", "DELIVERED"];

export async function createReturnAction(
  _prev: ReturnState,
  formData: FormData
): Promise<ReturnState> {
  try {
    const user = await requireUser();
    if (!rateLimitAction(`return:${user.id}`, 3, 60 * 60_000)) {
      return { error: "تعداد درخواست‌های شما زیاد است. بعداً تلاش کنید." };
    }
    const orderId = String(formData.get("orderId") ?? "");
    const type = String(formData.get("type") ?? "RETURN") === "WARRANTY" ? "WARRANTY" : "RETURN";
    const reason = String(formData.get("reason") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (reason.length < 3) return { error: "دلیل درخواست را وارد کنید" };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order || order.userId !== user.id) return { error: "سفارش یافت نشد" };
    if (!ELIGIBLE.includes(order.status)) {
      return { error: "این سفارش در وضعیت فعلی امکان درخواست ندارد" };
    }

    await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        userId: user.id,
        reason: type === "WARRANTY" ? `گارانتی: ${reason}` : reason,
        description: description || null,
        status: "PENDING",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: type === "WARRANTY" ? "AWAITING_WARRANTY" : "AWAITING_RETURN" },
    });

    revalidatePath(`/order/${order.code}`);
    revalidatePath("/account/orders");
    return {
      success: "درخواست شما ثبت شد. کارشناسان یدکی بررسی و نتیجه را اطلاع می‌دهند.",
    };
  } catch {
    return { error: "برای ثبت درخواست باید وارد حساب شوید" };
  }
}
