import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getVehicleTree } from "@/lib/vehicles";
import { Car } from "lucide-react";
import { GarageForm } from "./garage-form";
import { deleteVehicleAction, setDefaultVehicleAction } from "../actions";
import { toFaDigits } from "@/lib/format";

export const metadata = { title: "گاراژ من" };

export default async function GaragePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const [vehicles, tree] = await Promise.all([
    prisma.userVehicle.findMany({
      where: { userId: user.id },
      include: { make: true, model: true, trim: true },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    }),
    getVehicleTree(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">گاراژ من</h1>
      <p className="text-sm text-slate-500">
        خودروهای خود را ثبت کنید تا همیشه قطعات سازگار را سریع‌تر پیدا کنید.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {vehicles.map((v) => (
          <div key={v.id} className="card p-4 text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-black">
                <Car className="size-4 text-orange-600" />
                {v.make.name} {v.model.name}
              </span>
              {v.isDefault && <span className="badge bg-emerald-100 text-emerald-700">پیش‌فرض</span>}
            </div>
            <p className="text-slate-500">
              {v.trim.name}
              {v.year ? ` — مدل ${toFaDigits(v.year)}` : ""}
              {v.plate ? ` — پلاک: ${toFaDigits(v.plate)}` : ""}
            </p>
            <div className="mt-2 flex gap-3 text-xs">
              <a href={`/search?vehicle=${v.trimId}`} className="text-orange-600 hover:underline">
                مشاهده قطعات سازگار
              </a>
              {!v.isDefault && (
                <form action={setDefaultVehicleAction}>
                  <input type="hidden" name="id" value={v.id} />
                  <button className="text-orange-600 hover:underline">پیش‌فرض کردن</button>
                </form>
              )}
              <form action={deleteVehicleAction}>
                <input type="hidden" name="id" value={v.id} />
                <button className="text-red-500 hover:underline">حذف</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-black">افزودن خودرو به گاراژ</h2>
        <GarageForm tree={tree} />
      </div>
    </div>
  );
}
