import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listProducts, getFilterFacets } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Filters, SortBar } from "@/components/filters";
import { Pagination } from "@/components/pagination";

interface SP {
  [k: string]: string | string[] | undefined;
}

async function resolveCategory(segments: string[]) {
  const slug = segments[segments.length - 1];
  return prisma.category.findUnique({
    where: { slug },
    include: { parent: true, children: { where: { isActive: true }, orderBy: { order: "asc" } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await resolveCategory(slug);
  if (!category) return { title: "دسته‌بندی یافت نشد" };
  return {
    title: category.name,
    description: `خرید ${category.name} با بهترین قیمت و گارانتی اصالت از فروشگاه یدکی`,
    alternates: { canonical: `/c/${slug.join("/")}` },
  };
}

function str(sp: SP, key: string): string | undefined {
  const v = sp[key];
  return typeof v === "string" && v !== "" ? v : undefined;
}
function strs(sp: SP, key: string): string[] | undefined {
  const v = sp[key];
  if (!v) return undefined;
  return Array.isArray(v) ? v : [v];
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await resolveCategory(slug);
  if (!category || !category.isActive) notFound();

  const result = await listProducts({
    categorySlug: category.slug,
    q: str(sp, "q"),
    brandSlugs: strs(sp, "brand"),
    conditions: strs(sp, "condition"),
    min: str(sp, "min") ? Number(str(sp, "min")) : undefined,
    max: str(sp, "max") ? Number(str(sp, "max")) : undefined,
    inStock: sp.inStock === "1",
    hasWarranty: sp.hasWarranty === "1",
    freeShipping: sp.freeShipping === "1",
    discountOnly: sp.discount === "1",
    sort: str(sp, "sort"),
    page: str(sp, "page") ? Number(str(sp, "page")) : 1,
  });
  const facets = await getFilterFacets();

  const basePath = `/c/${slug.join("/")}`;
  const makeHref = (page: number) => {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && v && k !== "page") usp.set(k, v);
    }
    if (page > 1) usp.set("page", String(page));
    const s = usp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-4 text-xs text-slate-400">
        <Link href="/" className="hover:text-orange-600">خانه</Link>
        {category.parent && (
          <>
            <span className="mx-1">/</span>
            <Link href={`/c/${category.parent.slug}`} className="hover:text-orange-600">
              {category.parent.name}
            </Link>
          </>
        )}
        <span className="mx-1">/</span>
        <span className="text-slate-600">{category.name}</span>
      </nav>

      <h1 className="mb-2 text-2xl font-black">{category.name}</h1>
      {category.children.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {category.children.map((c) => (
            <Link
              key={c.id}
              href={`/c/${c.slug}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm hover:border-orange-300 hover:text-orange-700"
            >
              {c.icon ?? "🔧"} {c.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        <Filters brands={facets.brands} params={sp} basePath={basePath} />
        <div className="min-w-0 flex-1">
          <SortBar total={result.total} params={sp} basePath={basePath} />
          {result.items.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-16 text-center">
              <span className="text-5xl">📦</span>
              <h2 className="text-lg font-black">فعلاً کالایی در این دسته نیست</h2>
              <a href="/quote" className="btn-outline mt-2">درخواست استعلام قیمت</a>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {result.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          <Pagination page={result.page} pages={result.pages} makeHref={makeHref} />
        </div>
      </div>
    </div>
  );
}
