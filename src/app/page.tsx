import Link from "next/link";
import { ArrowLeft, BadgeCheck, Truck, Undo2, Wrench } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import { CategoryIcon } from "@/components/category-icon";
import { toFaDigits } from "@/lib/format";

export default async function HomePage() {
  const [categories, featured, newest, bestSellers] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { order: "asc" },
      take: 10,
      include: { _count: { select: { products: true } } },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      include: { brand: true, category: true, images: { orderBy: { order: "asc" }, take: 1 } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", isNew: true },
      include: { brand: true, category: true, images: { orderBy: { order: "asc" }, take: 1 } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE", isBestSeller: true },
      include: { brand: true, category: true, images: { orderBy: { order: "asc" }, take: 1 } },
      take: 8,
      orderBy: { salesCount: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 px-6 py-12 text-white md:px-12">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-black leading-relaxed md:text-4xl md:leading-relaxed">
            هر قطعه‌ای که خودروی شما نیاز دارد،
            <span className="text-orange-400"> با اطمینان </span>
            بخرید.
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
            جستجو بر اساس کد فنی، شماره قطعه یا OEM؛ فیلتر دقیق بر اساس خودرو؛
            گارانتی معتبر و قیمت ویژه همکاران.
          </p>
          <form action="/search" className="mt-6 flex gap-2">
            <input
              name="q"
              className="input flex-1 !border-transparent"
              placeholder="مثلاً: لنت ترمز جلو ۲۰۶ یا 5420..."
              autoComplete="off"
            />
            <button className="btn-primary shrink-0">جستجو</button>
          </form>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-300 md:text-sm">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-orange-400" /> تضمین اصالت کالا
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 text-orange-400" /> ارسال سریع سراسر کشور
            </span>
            <span className="flex items-center gap-1.5">
              <Wrench className="size-4 text-orange-400" /> قیمت همکار تعمیرگاه‌ها
            </span>
            <span className="flex items-center gap-1.5">
              <Undo2 className="size-4 text-orange-400" /> ۷ روز مهلت مرجوعی
            </span>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle title="دسته‌بندی قطعات" href="/search" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/c/${c.slug}`}
              className="card flex flex-col items-center gap-2 p-5 text-center transition hover:border-orange-300 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <CategoryIcon name={c.icon} className="size-6" />
              </span>
              <span className="text-sm font-bold">{c.name}</span>
              <span className="text-xs text-slate-400">
                {toFaDigits(c._count.products)} کالا
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mt-12">
          <SectionTitle title="پیشنهاد ویژه یدکی" href="/search?sort=best" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {bestSellers.length > 0 && (
        <section className="mt-12">
          <SectionTitle title="پرفروش‌ترین‌ها" href="/search?sort=best" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section className="mt-12">
          <SectionTitle title="جدیدترین محصولات" href="/search?sort=newest" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionTitle({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-black md:text-xl">{title}</h2>
      <Link href={href} className="flex items-center gap-1 text-sm text-orange-600 hover:underline">
        مشاهده همه <ArrowLeft className="size-4" />
      </Link>
    </div>
  );
}
