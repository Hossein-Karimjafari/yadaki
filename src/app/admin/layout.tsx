import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "داشبورد", icon: "📊" },
  { href: "/admin/products", label: "محصولات", icon: "📦" },
  { href: "/admin/orders", label: "سفارش‌ها", icon: "🧾" },
  { href: "/admin/quotes", label: "استعلام‌ها", icon: "💬" },
  { href: "/admin/partners", label: "همکاری‌ها", icon: "🤝" },
  { href: "/admin/returns", label: "مرجوعی/گارانتی", icon: "↩️" },
  { href: "/admin/reviews", label: "نظرات", icon: "⭐" },
  { href: "/admin/questions", label: "پرسش‌وپاسخ", icon: "❓" },
  { href: "/admin/coupons", label: "کد تخفیف", icon: "🏷️" },
  { href: "/admin/catalog", label: "دسته/برند", icon: "🗂️" },
  { href: "/admin/blog", label: "وبلاگ", icon: "📝" },
  { href: "/admin/users", label: "کاربران", icon: "👥" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <span className="text-5xl">🔒</span>
        <h1 className="mt-3 text-xl font-black">دسترسی غیرمجاز</h1>
        <p className="mt-2 text-sm text-slate-500">
          این بخش فقط برای مدیران سیستم است. اگر مدیر هستید با حساب مدیریت وارد شوید.
        </p>
        <Link href="/" className="btn-primary mt-4">بازگشت به فروشگاه</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-black">پنل مدیریت یدکی</h1>
        <Link href="/" className="text-sm text-slate-400 hover:text-orange-600">
          مشاهده فروشگاه ←
        </Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="card h-fit overflow-hidden lg:sticky lg:top-32">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 border-b border-slate-50 px-4 py-2.5 text-sm last:border-0 hover:bg-orange-50 hover:text-orange-700"
            >
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
