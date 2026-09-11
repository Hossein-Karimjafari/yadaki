"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { normalizePhone, isValidIranMobile } from "@/lib/normalize";
import { rateLimitAction } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

export interface QuoteState {
  error?: string;
  success?: string;
}

export async function submitQuoteAction(
  _prev: QuoteState,
  formData: FormData
): Promise<QuoteState> {
  const user = await getCurrentUser();

  if (!rateLimitAction(`quote:${user?.id ?? "guest"}`, 3, 10 * 60_000)) {
    return { error: "تعداد درخواست‌های شما زیاد است. بعداً تلاش کنید." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const message = String(formData.get("message") ?? "").trim();
  const itemsRaw = String(formData.get("items") ?? "").trim();

  if (name.length < 3) return { error: "نام خود را کامل وارد کنید" };
  if (!isValidIranMobile(phone)) return { error: "شماره موبایل معتبر نیست" };
  if (itemsRaw.length < 5) {
    return { error: "حداقل یک قطعه را در لیست بنویسید (نام قطعه + تعداد در هر خط)" };
  }

  const lines = itemsRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 20);

  await prisma.quoteRequest.create({
    data: {
      userId: user?.id ?? null,
      name,
      phone,
      message: message || null,
      items: {
        create: lines.map((l) => {
          const match = l.match(/(.+?)[\s×xX\*]+\s*(\d+)\s*$/);
          return match
            ? { name: match[1].trim(), qty: Math.max(1, parseInt(match[2], 10) || 1) }
            : { name: l, qty: 1 };
        }),
      },
    },
  });

  revalidatePath("/admin");
  return {
    success:
      "درخواست استعلام شما ثبت شد. کارشناسان یدکی حداکثر تا یک روز کاری با شما تماس می‌گیرند.",
  };
}
