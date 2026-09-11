import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSelectedTrim } from "@/lib/vehicles";
import { ROLE_FA, toFaDigits } from "@/lib/format";

const NAV = [
  { href: "/account", label: "پروفایل", icon: "👤" },
  { href: "/account/orders", label: "سفارش‌های من", icon: "📦" },
  { href: "/account/addresses", label: "آدرس‌ها", icon: "📍" },
  { href: "/account/garage", label: "گاراژ من", icon: "🚗" },
  { href: "/account/wishlist", label: "علاقه‌مندی‌ها", icon: "♥" },
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
            <span className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-2xl">
              👤
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
                <span>{n.icon}</span>
                {n.label}
              </Link>
            ))}
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-3 border-b border-slate-50 px-5 py-3.5 text-sm hover:bg-orange-50 hover:text-orange-700"
              >
                <span>⚙️</span> پنل مدیریت
              </Link>
            )}
            <form action="/api/auth/logout" method="post">
              <button className="flex w-full items-center gap-3 px-5 py-3.5 text-sm text-red-500 hover:bg-red-50">
                <span>🚪</span> خروج از حساب
              </button>
            </form>
          </nav>

          {trim && (
            <div className="card p-4 text-xs text-slate-500">
              🚗 خودروی فعال:
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
