import Link from "next/link";
import Image from "next/image";
import { getCartWithItems, computeCartTotals } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { resolvePrice } from "@/lib/price";
import { toFaDigits, formatToman } from "@/lib/format";
import { updateCartQtyAction, removeCartItemAction, clearCartAction } from "@/app/actions/cart";
import { CouponForm } from "./coupon-form";

export const metadata = { title: "سبد خرید" };

export default async function CartPage() {
  const cart = await getCartWithItems();
  if (!cart) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="card mx-auto flex max-w-md flex-col items-center gap-4 p-12 text-center">
          <span className="text-6xl">🛒</span>
          <h1 className="text-xl font-black">سبد خرید شما خالی است</h1>
          <p className="text-sm text-slate-500">
            از میان هزاران قطعه یدکی، قطعه سازگار با خودروی خود را پیدا کنید.
          </p>
          <Link href="/search" className="btn-primary">شروع خرید</Link>
        </div>
      </div>
    );
  }

  const user = await getCurrentUser();
  const totals = await computeCartTotals(
    cart.items.map((i) => ({ product: i.product, qty: i.qty })),
    user?.role ?? null,
    cart.couponCode
  );

  const hasIssue = totals.lines.some((l) => l.stock < l.qty);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-black">سبد خرید ({toFaDigits(cart.items.length)} کالا)</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {cart.items.map((item) => {
            const rp = resolvePrice(item.product, user?.role ?? null);
            const img = item.product.images[0]?.url ?? "/part-placeholder.svg";
            return (
              <div key={item.id} className="card flex gap-4 p-4">
                <Link href={`/p/${item.product.slug}`} className="relative h-20 w-20 shrink-0 rounded-xl bg-slate-50">
                  <Image src={img} alt={item.product.name} fill unoptimized className="object-contain p-1" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/p/${item.product.slug}`} className="line-clamp-1 text-sm font-bold hover:text-orange-600">
                    {item.product.name}
                  </Link>
                  <div className="mt-1 text-xs text-slate-400">برند {item.product.brand.name}</div>
                  {item.product.stock < item.qty && (
                    <p className="mt-1 text-xs font-bold text-red-600">
                      موجودی انبار فقط {toFaDigits(item.product.stock)} عدد است
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <form action={updateCartQtyAction}>
                        <input type="hidden" name="productId" value={item.productId} />
                        <input type="hidden" name="qty" value={item.qty - 1} />
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:border-orange-400">
                          −
                        </button>
                      </form>
                      <span className="w-8 text-center text-sm font-bold">{toFaDigits(item.qty)}</span>
                      <form action={updateCartQtyAction}>
                        <input type="hidden" name="productId" value={item.productId} />
                        <input type="hidden" name="qty" value={item.qty + 1} />
                        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:border-orange-400">
                          +
                        </button>
                      </form>
                      <form action={removeCartItemAction} className="ms-2">
                        <input type="hidden" name="productId" value={item.productId} />
                        <button className="text-xs text-slate-400 hover:text-red-600">حذف</button>
                      </form>
                    </div>
                    <div className="text-sm font-black">
                      {formatToman(rp.final * item.qty)}
                      <span className="mr-1 text-[10px] font-normal text-slate-400">تومان</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <form action={clearCartAction}>
            <button className="text-xs text-slate-400 hover:text-red-600">خالی کردن سبد</button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 font-black">خلاصه سفارش</h3>
            <CouponForm appliedCode={cart.couponCode} />
            <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
              <Row label="جمع کالاها" value={`${formatToman(totals.subtotal)} تومان`} />
              {totals.discount > 0 && (
                <Row label="تخفیف" value={`${formatToman(totals.discount)} تومان`} accent="text-emerald-600" />
              )}
              <Row
                label="هزینه ارسال"
                value="در مرحله بعد محاسبه می‌شود"
                accent="text-slate-400 text-xs"
              />
            </div>
            <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-base font-black">
              <span>مبلغ قابل پرداخت</span>
              <span>
                {formatToman(totals.subtotal - totals.discount)}
                <span className="mr-1 text-xs font-normal text-slate-500">تومان</span>
              </span>
            </div>
            {hasIssue && (
              <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs font-bold text-amber-700">
                برای ادامه خرید، تعداد کالاهای دارای محدودیت موجودی را اصلاح کنید.
              </p>
            )}
            <Link href="/checkout" className={`btn-primary mt-4 w-full !py-3 ${hasIssue ? "pointer-events-none opacity-50" : ""}`}>
              ادامه فرآیند خرید
            </Link>
          </div>
          <div className="card p-4 text-xs leading-6 text-slate-500">
            🛡️ پرداخت امن از طریق درگاه بانکی
            <br />
            📦 ارسال به سراسر ایران با پست پیشتاز و تیپاکس
            <br />
            🧾 امکان درخواست فاکتور رسمی
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent = "" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${accent}`}>{value}</span>
    </div>
  );
}
