"use server";

import { prisma } from "@/lib/prisma";
import { issueOtp, verifyOtp } from "@/lib/otp";
import { createSession } from "@/lib/auth";
import { ensureCart } from "@/lib/cart";
import { normalizePhone, isValidIranMobile } from "@/lib/normalize";
import { redirect } from "next/navigation";

export interface LoginState {
  step: "phone" | "code";
  phone?: string;
  error?: string;
  success?: string;
}

export async function requestOtpAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (!isValidIranMobile(phone)) {
    return { step: "phone", error: "شماره موبایل معتبر نیست. مثال: 09121234567" };
  }
  const result = await issueOtp(phone);
  if (!result.ok) return { step: "phone", phone, error: result.message };
  return { step: "code", phone, success: result.message };
}

export async function verifyOtpAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  const next = String(formData.get("next") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (code.length !== 6) return { step: "code", phone, error: "کد ۶ رقمی را وارد کنید" };

  const result = await verifyOtp(phone, code);
  if (!result.ok) return { step: "code", phone, error: result.message };

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone, name: name || null, role: "CUSTOMER" },
    });
  } else if (name && !user.name) {
    user = await prisma.user.update({ where: { id: user.id }, data: { name } });
  }
  if (user.status === "BLOCKED") {
    return { step: "phone", error: "حساب شما مسدود شده است. با پشتیبانی تماس بگیرید." };
  }

  await createSession(user.id, user.role);
  await ensureCart(user.id);

  redirect(next && next.startsWith("/") ? next : "/account");
}
