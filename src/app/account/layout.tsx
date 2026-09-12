import Link from "next/link";
import { redirect } from "next/navigation";
import { Car, Heart, LogOut, MapPin, Package, Settings, User, type LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getSelectedTrim } from "@/lib/vehicles";
import { ROLE_FA, toFaDigits } from "@/lib/format";

const NAV: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/account", label: "پروفایل", icon: User },
  { href: "/account/orders", label: "سفارش‌های من", icon: Package },
  { href: "/account/addresses", label: "آدرس‌ها", icon: MapPin },
  { href: "/account/garage", label: "گاراژ من", icon: Car },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: Heart },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const trim = await getSelectedTrim();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-3">
          <div className="card p-5 text-center">
            <span className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
              <User className="size-7" />
            </span>
            <p className="font-black">{user.name ?? "کاربر یدکی"}</p>
            <p className="text-xs text-slate-400" dir="ltr">{toFaDigits(user.phone)}</p>
            <div className="mt-2 flex justify-center gap-1">
              <span className="badge bg-orange-100 text-orange-700">{ROLE_FA[user.role]}</span>
              {user.role !== "CUSTOMER" && user.role !== "ADMIN" && (
                <span className="badge bg-emerald-100 text-emerald-700">تأییدشده</span>
              )}
            </div>
          </div>

          <nav className="card overflow-hidden">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-3 border-b border-slate-50 px-5 py-3.5 text-sm last:border-0 hover:bg-orange-50 hover:text-orange-700"
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            ))}
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-3 border-b border-slate-50 px-5 py-3.5 text-sm hover:bg-orange-50 hover:text-orange-700"
              >
                <Settings className="size-4" /> پنل مدیریت
              </Link>
            )}
            <form action="/api/auth/logout" method="post">
              <button className="flex w-full items-center gap-3 px-5 py-3.5 text-sm text-red-500 hover:bg-red-50">
                <LogOut className="size-4" /> خروج از حساب
              </button>
            </form>
          </nav>

          {trim && (
            <div className="card flex items-center gap-2 p-4 text-xs text-slate-500">
              <Car className="size-4 shrink-0 text-orange-600" />
              خودروی فعال:
              <b className="text-slate-700">
                {" "}{trim.model.make.name} {trim.model.name} {trim.name}
              </b>
            </div>
          )}
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
