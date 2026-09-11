import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { AddressForm } from "./address-form";
import { deleteAddressAction, setDefaultAddressAction } from "../actions";
import { toFaDigits } from "@/lib/format";

export const metadata = { title: "آدرس‌های من" };

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { id: "desc" }],
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">آدرس‌های من</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a.id} className="card p-4 text-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-black">{a.title ?? a.receiverName}</span>
              {a.isDefault && <span className="badge bg-emerald-100 text-emerald-700">پیش‌فرض</span>}
            </div>
            <p className="leading-6 text-slate-500">
              {a.province}، {a.city}، {a.addressLine}
              {a.postalCode ? ` — کدپستی: ${toFaDigits(a.postalCode)}` : ""}
              <br />
              گیرنده: {a.receiverName} ({toFaDigits(a.receiverPhone)})
            </p>
            <div className="mt-2 flex gap-3 text-xs">
              {!a.isDefault && (
                <form action={setDefaultAddressAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="text-orange-600 hover:underline">تنظیم به‌عنوان پیش‌فرض</button>
                </form>
              )}
              <form action={deleteAddressAction}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-red-500 hover:underline">حذف</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-black">افزودن آدرس جدید</h2>
        <AddressForm />
      </div>
    </div>
  );
}
