"use server";

import { prisma } from "@/lib/prisma";
import { setVehicleCookie } from "@/lib/vehicles";
import { revalidatePath } from "next/cache";

export async function setVehicleAction(trimId: string | null) {
  if (trimId) {
    const exists = await prisma.vehicleTrim.findUnique({ where: { id: trimId } });
    if (!exists) return;
    await setVehicleCookie(trimId);
  } else {
    await setVehicleCookie(null);
  }
  revalidatePath("/", "layout");
}
