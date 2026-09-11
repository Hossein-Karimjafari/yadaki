import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const VEHICLE_COOKIE = "yadaki_vehicle";

export interface VehicleTree {
  id: string;
  name: string;
  models: Array<{
    id: string;
    name: string;
    trims: Array<{ id: string; name: string; yearFrom: number; yearTo: number | null; engine: string | null }>;
  }>;
}

export async function getVehicleTree(): Promise<VehicleTree[]> {
  const makes = await prisma.vehicleMake.findMany({
    orderBy: { order: "asc" },
    include: {
      models: {
        orderBy: { name: "asc" },
        include: { trims: { orderBy: { name: "asc" } } },
      },
    },
  });
  return makes.map((m) => ({
    id: m.id,
    name: m.name,
    models: m.models.map((md) => ({
      id: md.id,
      name: md.name,
      trims: md.trims.map((t) => ({
        id: t.id,
        name: t.name,
        yearFrom: t.yearFrom,
        yearTo: t.yearTo,
        engine: t.engine,
      })),
    })),
  }));
}

export async function getSelectedTrim() {
  const store = await cookies();
  const trimId = store.get(VEHICLE_COOKIE)?.value;
  if (!trimId) return null;
  return prisma.vehicleTrim.findUnique({
    where: { id: trimId },
    include: { model: { include: { make: true } } },
  });
}

export async function setVehicleCookie(trimId: string | null) {
  const store = await cookies();
  if (trimId) {
    store.set(VEHICLE_COOKIE, trimId, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  } else {
    store.delete(VEHICLE_COOKIE);
  }
}
