"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { normalizePhone, isValidIranMobile } from "@/lib/normalize";

export interface SimpleState {
  error?: string;
  success?: string;
}

export async function updateProfileAction(
  _prev: SimpleState,
  formData: FormData
): Promise<SimpleState> {
  try {
    const user = await requireUser();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const nationalCode = String(formData.get("nationalCode") ?? "").replace(/\D/g, "");
    if (name && name.length < 3) return { error: "نام نامعتبر است" };
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return { error: "ایمیل نامعتبر است" };
    if (nationalCode && !/^\d{10}$/.test(nationalCode)) return { error: "کد ملی باید ۱۰ رقم باشد" };
    await prisma.user.update({
      where: { id: user.id },
      data: { name: name || null, email: email || null, nationalCode: nationalCode || null },
    });
    revalidatePath("/account");
    return { success: "پروفایل به‌روزرسانی شد" };
  } catch {
    return { error: "خطا در ذخیره" };
  }
}

export async function saveAddressAction(
  _prev: SimpleState,
  formData: FormData
): Promise<SimpleState> {
  try {
    const user = await requireUser();
    const receiverName = String(formData.get("receiverName") ?? "").trim();
    const receiverPhone = normalizePhone(String(formData.get("receiverPhone") ?? ""));
    const province = String(formData.get("province") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const addressLine = String(formData.get("addressLine") ?? "").trim();
    const postalCode = String(formData.get("postalCode") ?? "").replace(/\D/g, "");
    if (receiverName.length < 3) return { error: "نام گیرنده نامعتبر" };
    if (!isValidIranMobile(receiverPhone)) return { error: "موبایل گیرنده نامعتبر" };
    if (!province || !city || addressLine.length < 10) return { error: "آدرس را کامل وارد کنید" };
    if (postalCode && postalCode.length !== 10) return { error: "کد پستی باید ۱۰ رقم باشد" };
    const count = await prisma.address.count({ where: { userId: user.id } });
    await prisma.address.create({
      data: {
        userId: user.id,
        receiverName,
        receiverPhone,
        province,
        city,
        addressLine,
        postalCode: postalCode || null,
        isDefault: count === 0,
      },
    });
    revalidatePath("/account/addresses");
    return { success: "آدرس ذخیره شد" };
  } catch {
    return { error: "خطا در ذخیره آدرس" };
  }
}

export async function deleteAddressAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.address.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  await prisma.address.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } });
  revalidatePath("/account/addresses");
}

export async function saveVehicleAction(
  _prev: SimpleState,
  formData: FormData
): Promise<SimpleState> {
  try {
    const user = await requireUser();
    const trimId = String(formData.get("trimId") ?? "");
    const yearStr = String(formData.get("year") ?? "").replace(/\D/g, "");
    const plate = String(formData.get("plate") ?? "").trim();
    const trim = await prisma.vehicleTrim.findUnique({
      where: { id: trimId },
      include: { model: true },
    });
    if (!trim) return { error: "خودرو نامعتبر است" };
    const year = yearStr ? parseInt(yearStr, 10) : null;
    if (year && (year < 1340 || year > 1420)) return { error: "سال ساخت نامعتبر است" };
    const count = await prisma.userVehicle.count({ where: { userId: user.id } });
    await prisma.userVehicle.create({
      data: {
        userId: user.id,
        makeId: trim.model.makeId,
        modelId: trim.modelId,
        trimId: trim.id,
        year,
        plate: plate || null,
        isDefault: count === 0,
      },
    });
    revalidatePath("/account/garage");
    return { success: "خودرو به گاراژ اضافه شد" };
  } catch {
    return { error: "خطا در ذخیره خودرو" };
  }
}

export async function deleteVehicleAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.userVehicle.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/account/garage");
}

export async function setDefaultVehicleAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await prisma.userVehicle.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  await prisma.userVehicle.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } });
  revalidatePath("/account/garage");
}
