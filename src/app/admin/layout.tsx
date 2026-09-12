import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CircleHelp,
  FileText,
  FolderOpen,
  Handshake,
  LayoutDashboard,
  Lock,
  MessageCircle,
  Package,
  ReceiptText,
  Star,
  Tag,
  Undo2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const NAV: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/orders", label: "سفارش‌ها", icon: ReceiptText },
  { href: "/admin/quotes", label: "استعلام‌ها", icon: MessageCircle },
  { href: "/admin/partners", label: "همکاری‌ها", icon: Handshake },
  { href: "/admin/returns", label: "مرجوعی/گارانتی", icon: Undo2 },
  { href: "/admin/reviews", label: "نظرات", icon: Star },
  { href: "/admin/questions", label: "پرسش‌وپاسخ", icon: CircleHelp },
  { href: "/admin/coupons", label: "کد تخفیف", icon: Tag },
  { href: "/admin/catalog", label: "دسته/برند", icon: FolderOpen },
  { href: "/admin/blog", label: "وبلاگ", icon: FileText },
  { href: "/admin/users", label: "کاربران", icon: Users },
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
        <span className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
          <Lock className="size-8" />
        </span>
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
        <Link href="/" className="flex items-center gap-1 text-sm text-slate-400 hover:text-orange-600">
          مشاهده فروشگاه <ArrowLeft className="size-4" />
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
              <n.icon className="size-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
