import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cartItemsCount } from "@/lib/cart";
import { getSelectedTrim, getVehicleTree } from "@/lib/vehicles";
import { VehicleSelector } from "./vehicle-selector";
import { ROLE_FA, toFaDigits } from "@/lib/format";

export async function Header() {
  const [user, cartCount, trim, categories, tree] = await Promise.all([
    getCurrentUser(),
    cartItemsCount(),
    getSelectedTrim(),
    prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { order: "asc" },
      take: 10,
      select: { id: true, name: true, slug: true },
    }),
    getVehicleTree(),
  ]);

  const selected = trim
    ? {
        make: trim.model.make.name,
        model: trim.model.name,
        trim: trim.name,
      }
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-lg font-black text-white">
              ید
            </span>
            <span className="text-xl font-black text-slate-900">یدکی</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl">
            <form action="/search" className="relative w-full">
              <input
                name="q"
                className="input pl-10 bg-slate-50"
                placeholder="جستجوی نام قطعه، کد فنی یا شماره قطعه..."
                autoComplete="off"
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-600"
                aria-label="جستجو"
              >
                🔍
              </button>
            </form>
          </div>

          <div className="flex-1 md:hidden" />

          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:border-orange-400"
              aria-label="سبد خرید"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white">
                  {toFaDigits(cartCount)}
                </span>
              )}
            </Link>

            {user ? (
              <Link href="/account" className="btn-outline !py-2">
                <span>👤</span>
                <span className="hidden sm:inline">
                  {user.name || ROLE_FA[user.role]}
                </span>
                {user.role !== "CUSTOMER" && (
                  <span className="badge bg-orange-100 text-orange-700">
                    {user.role === "ADMIN" ? "مدیر" : "همکار"}
                  </span>
                )}
              </Link>
            ) : (
              <Link href="/login" className="btn-primary !py-2">
                ورود / ثبت‌نام
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pb-2">
          <VehicleSelector tree={tree} selected={selected} />
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-orange-50 hover:text-orange-700"
              >
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
