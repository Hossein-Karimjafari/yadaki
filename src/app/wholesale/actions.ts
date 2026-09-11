"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface PartnerState {
  error?: string;
  success?: string;
}

export async function submitPartnerAction(
  _prev: PartnerState,
  formData: FormData
): Promise<PartnerState> {
  const user = await getCurrentUser();
  if (!user) return { error: "برای ثبت درخواست همکاری ابتدا وارد حساب شوید" };

  const type = String(formData.get("type") ?? "MECHANIC") === "WHOLESALE" ? "WHOLESALE" : "MECHANIC";
  const shopName = String(formData.get("shopName") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (shopName.length < 3) return { error: "نام فروشگاه / تعمیرگاه را وارد کنید" };
  if (city.length < 2) return { error: "نام شهر را وارد کنید" };

  const existing = await prisma.partnerRequest.findFirst({
    where: { userId: user.id, status: "PENDING" },
  });
  if (existing) {
    return { error: "شما یک درخواست در حال بررسی دارید. لطفاً منتظر تماس کارشناسان بمانید." };
  }

  await prisma.partnerRequest.create({
    data: { userId: user.id, type, shopName, city, message: message || null },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { status: "PENDING_PARTNER" },
  });

  revalidatePath("/wholesale");
  return {
    success:
      "درخواست همکاری شما ثبت شد. پس از بررسی مدارک و تماس کارشناسان، حساب شما به همکار ارتقا می‌یابد.",
  };
}
