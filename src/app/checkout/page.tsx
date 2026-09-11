import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCartWithItems, computeCartTotals } from "@/lib/cart";
import { prisma as db } from "@/lib/prisma";
import { CheckoutForm } from "./checkout-form";
import { redirect } from "next/navigation";
import { formatToman } from "@/lib/format";

export const metadata = { title: "تسویه حساب" };

export default async function CheckoutPage() {
  const cart = await getCartWithItems();
  if (!cart) redirect("/cart");

  const user = await getCurrentUser();
  const totals = await computeCartTotals(
    cart.items.map((i) => ({ product: i.product, qty: i.qty })),
    user?.role ?? null,
    cart.couponCode
  );
  const shippingMethods = await db.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
  const addresses = user
    ? await prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } })
    : [];

  const payable = totals.subtotal - totals.discount;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-black">تسویه حساب</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <CheckoutForm
          shippingMethods={shippingMethods.map((m) => ({
            id: m.id,
            name: m.name,
            cost: m.cost,
            etaDays: m.etaDays,
          }))}
          addresses={addresses.map((a) => ({
            id: a.id,
            title: a.title,
            province: a.province,
            city: a.city,
            addressLine: a.addressLine,
            postalCode: a.postalCode,
            receiverName: a.receiverName,
            receiverPhone: a.receiverPhone,
          }))}
          defaultName={user?.name ?? ""}
          defaultPhone={user?.phone ?? ""}
        />
        <div className="card h-fit p-5">
          <h3 className="mb-3 font-black">خلاصه سفارش</h3>
          <ul className="mb-3 max-h-64 space-y-2 overflow-y-auto text-sm">
            {cart.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span className="line-clamp-1 text-slate-600">
                  {i.product.name} × {i.qty}
                </span>
                <span className="shrink-0 font-bold">
                  {formatToman(
                    (totals.lines.find((l) => l.productId === i.productId)?.unitPrice ?? 0) * i.qty
                  )}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">جمع کالاها</span>
              <span className="font-bold">{formatToman(totals.subtotal)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>تخفیف</span>
                <span className="font-bold">{formatToman(totals.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">هزینه ارسال</span>
              <span className="font-bold">مطابق روش انتخابی</span>
            </div>
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 font-black">
            <span>مبلغ کالاها</span>
            <span>
              {formatToman(payable)}
              <span className="mr-1 text-xs font-normal text-slate-500">تومان</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
