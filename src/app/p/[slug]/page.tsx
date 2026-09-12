import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CircleCheck, ShieldCheck, TriangleAlert, Truck, Undo2 } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { getSelectedTrim } from "@/lib/vehicles";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolvePrice, stockStatus } from "@/lib/price";
import { Price } from "@/components/price";
import { AddToCartDetail } from "@/components/add-to-cart-detail";
import { ProductCard } from "@/components/product-card";
import { ReviewForms } from "./review-forms";
import { WishlistButton } from "@/components/wishlist-button";
import {
  CONDITION_FA,
  formatJalali,
  formatToman,
  toFaDigits,
} from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "محصول یافت نشد" };
  return {
    title: product.name,
    description: product.shortDesc ?? `خرید ${product.name} برند ${product.brand.name} از فروشگاه یدکی`,
    alternates: { canonical: `/p/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDesc ?? undefined,
      type: "website",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status === "ARCHIVED") notFound();

  const [user, selectedTrim] = await Promise.all([getCurrentUser(), getSelectedTrim()]);
  const rp = resolvePrice(product, user?.role ?? null);
  const stock = stockStatus(product);
  const compat = product.compat;
  const isPartner = !!user && ["MECHANIC", "WHOLESALE", "ADMIN"].includes(user.role);
  const isCompatible = selectedTrim
    ? compat.some((c) => c.trimId === selectedTrim.id || c.modelId === selectedTrim.modelId)
    : null;

  const specs: Array<[string, string]> = [];
  if (product.specs) {
    for (const line of product.specs.split("\n")) {
      const idx = line.indexOf(":");
      if (idx > 0) specs.push([line.slice(0, idx).trim(), line.slice(idx + 1).trim()]);
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.partNumber ?? product.id,
    description: product.shortDesc ?? product.name,
    brand: { "@type": "Brand", name: product.brand.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "IRR",
      price: rp.final * 10,
      availability:
        stock === "OUT"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
    ...(product.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg,
            reviewCount: product.ratingCount,
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: "/" },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category.name,
        item: `/c/${product.category.slug}`,
      },
      { "@type": "ListItem", position: 3, name: product.name, item: `/p/${product.slug}` },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav className="mb-4 text-xs text-slate-400">
        <Link href="/" className="hover:text-orange-600">خانه</Link>
        <span className="mx-1">/</span>
        <Link href={`/c/${product.category.slug}`} className="hover:text-orange-600">
          {product.category.name}
        </Link>
        <span className="mx-1">/</span>
        <span className="text-slate-600">{product.name}</span>
      </nav>

      {selectedTrim && isCompatible === false && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          <TriangleAlert className="size-5 shrink-0" />
          <span>
            هشدار سازگاری: این قطعه با خودروی انتخابی شما ({selectedTrim.model.make.name}{" "}
            {selectedTrim.model.name} {selectedTrim.name}) سازگار نیست!
          </span>
        </div>
      )}
      {selectedTrim && isCompatible && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          <CircleCheck className="size-5 shrink-0" />
          <span>
            این قطعه با خودروی انتخابی شما ({selectedTrim.model.make.name}{" "}
            {selectedTrim.model.name} {selectedTrim.name}) سازگار است.
          </span>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[380px_1fr_320px]">
        <div className="card overflow-hidden p-4">
          <div className="relative aspect-square">
            <Image
              src={product.images[0]?.url ?? "/part-placeholder.svg"}
              alt={product.name}
              fill
              unoptimized
              className="object-contain"
              priority
            />
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.slice(0, 4).map((img) => (
                <div key={img.id} className="relative h-16 w-16 rounded-lg bg-slate-50">
                  <Image src={img.url} alt={img.alt ?? product.name} fill unoptimized className="object-contain p-1" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <Link href={`/search?brand=${product.brand.slug}`} className="badge bg-slate-100 text-slate-700 hover:bg-orange-100">
                برند: {product.brand.name}
              </Link>
              <span className="badge bg-blue-50 text-blue-700">{CONDITION_FA[product.condition]}</span>
              {product.warrantyMonths > 0 && (
                <span className="badge bg-emerald-50 text-emerald-700">
                  {toFaDigits(product.warrantyMonths)} ماه گارانتی
                </span>
              )}
              {product.country && (
                <span className="badge bg-slate-100 text-slate-600">ساخت {product.country}</span>
              )}
            </div>
            <h1 className="text-xl font-black leading-relaxed md:text-2xl">{product.name}</h1>
          </div>

          <div className="card p-4">
            <h3 className="mb-2 text-sm font-black">کدهای فنی</h3>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
              <CodeRow label="کد فنی" value={product.technicalCode} />
              <CodeRow label="شماره قطعه" value={product.partNumber} />
              <CodeRow label="OEM" value={product.oemNumber} />
            </dl>
            {product.crossRefs.length > 0 && (
              <p className="mt-3 text-xs text-slate-500">
                کدهای جایگزین: {product.crossRefs.map((c) => c.code).join(" ، ")}
              </p>
            )}
          </div>

          {product.tiers.length > 0 && (
            <div className="card p-4">
              <h3 className="mb-2 text-sm font-black">قیمت پلکانی (خرید تعدادی)</h3>
              {isPartner ? (
                <table className="w-full max-w-sm text-right text-sm">
                  <thead className="text-xs text-slate-400">
                    <tr>
                      <th className="p-2">تعداد</th>
                      <th className="p-2">قیمت واحد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.tiers.map((t) => (
                      <tr key={t.id} className="border-t border-slate-100">
                        <td className="p-2 font-bold">{toFaDigits(t.minQty)} عدد به بالا</td>
                        <td className="p-2 font-black text-emerald-700">{formatToman(t.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-xs text-slate-500">
                  قیمت‌های عمده فقط برای همکاران، تعمیرگاه‌ها و عمده‌فروشان فعال است.{" "}
                  <a href="/wholesale" className="font-bold text-orange-600 hover:underline">
                    درخواست همکاری
                  </a>
                </p>
              )}
            </div>
          )}

          <div className="card p-4">
            <h3 className="mb-3 text-sm font-black">سازگاری با خودروها</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="rounded-r-lg p-2">برند خودرو</th>
                    <th className="p-2">مدل</th>
                    <th className="p-2">تیپ / موتور</th>
                    <th className="rounded-l-lg p-2">سال سازگاری</th>
                  </tr>
                </thead>
                <tbody>
                  {compat.slice(0, 12).map((c) => (
                    <tr key={c.id} className="border-t border-slate-100">
                      <td className="p-2">{c.make.name}</td>
                      <td className="p-2">{c.model.name}</td>
                      <td className="p-2">{c.trim?.name ?? "همه تیپ‌ها"}</td>
                      <td className="p-2">
                        {toFaDigits(c.yearFrom ?? c.trim?.yearFrom ?? "-")}
                        {c.yearTo || c.trim?.yearTo
                          ? ` تا ${toFaDigits(c.yearTo ?? c.trim?.yearTo ?? "-")}`
                          : " به بعد"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {product.longDesc && (
            <div className="card p-4">
              <h3 className="mb-2 text-sm font-black">توضیحات محصول</h3>
              <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{product.longDesc}</p>
            </div>
          )}

          {specs.length > 0 && (
            <div className="card p-4">
              <h3 className="mb-2 text-sm font-black">مشخصات فنی</h3>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
                {specs.map(([k, v], i) => (
                  <div key={i} className="flex justify-between border-b border-slate-50 py-1.5">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <ReviewForms
            productId={product.id}
            isLoggedIn={!!user}
            reviews={product.reviews.map((r) => ({
              id: r.id,
              rating: r.rating,
              body: r.body,
              date: formatJalali(r.createdAt),
              userName: r.user.name ?? "کاربر یدکی",
            }))}
            questions={product.questions.map((q) => ({
              id: q.id,
              body: q.body,
              answer: q.answer!,
              date: formatJalali(q.answeredAt ?? q.createdAt),
            }))}
          />
        </div>

        <div className="space-y-4">
          <div className="card sticky top-32 p-5">
            <Price p={rp} size="lg" />
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">موجودی</span>
                {stock === "OUT" ? (
                  <span className="font-bold text-red-600">ناموجود</span>
                ) : stock === "LOW" ? (
                  <span className="font-bold text-amber-600">
                    کم‌موجود ({toFaDigits(product.stock)} عدد)
                  </span>
                ) : (
                  <span className="font-bold text-emerald-600">موجود در انبار</span>
                )}
              </div>
              {product.warrantyMonths > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">گارانتی</span>
                  <span className="font-bold">{toFaDigits(product.warrantyMonths)} ماه</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500">ارسال</span>
                <span className="font-bold">
                  {product.hasFreeShipping ? "رایگان" : "از ۴۵,۰۰۰ تومان"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">پرفروش</span>
                <span className="font-bold">{toFaDigits(product.salesCount)} فروش</span>
              </div>
            </div>
            <div className="mt-4">
              <AddToCartDetail
                productId={product.id}
                maxQty={product.maxOrderQty ?? 10}
                disabled={product.stock <= 0}
              />
            </div>
            <div className="mt-2">
              <WishlistButton
                productId={product.id}
                initiallyAdded={
                  !!user &&
                  (await prisma.wishlistItem.findUnique({
                    where: {
                      userId_productId: { userId: user.id, productId: product.id },
                    },
                  })) !== null
                }
              />
            </div>
            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-500">
              <span className="flex items-center gap-2">
                <ShieldCheck className="size-4 shrink-0 text-orange-500" />
                ضمانت اصالت و سلامت فیزیکی کالا
              </span>
              <span className="flex items-center gap-2">
                <Undo2 className="size-4 shrink-0 text-orange-500" />
                ۷ روز مهلت مرجوعی بدون قید و شرط
              </span>
              <span className="flex items-center gap-2">
                <Truck className="size-4 shrink-0 text-orange-500" />
                ارسال از انبار مرکزی در کمتر از ۲۴ ساعت
              </span>
            </div>
          </div>
        </div>
      </div>

      <RelatedSection categoryId={product.category.id} excludeId={product.id} />
    </div>
  );
}

function CodeRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <dt className="text-[11px] text-slate-400">{label}</dt>
      <dd className="font-mono text-sm font-bold" dir="ltr">
        {value ?? "—"}
      </dd>
    </div>
  );
}

async function RelatedSection({ categoryId, excludeId }: { categoryId: string; excludeId: string }) {
  const related = await getRelatedProducts(categoryId, excludeId, 4);
  if (related.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-black">محصولات مرتبط</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {related.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
