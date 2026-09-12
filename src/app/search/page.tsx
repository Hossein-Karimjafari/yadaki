import type { Metadata } from "next";
import Link from "next/link";
import { listProducts, getFilterFacets } from "@/lib/products";
import { Search } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Filters, SortBar } from "@/components/filters";
import { Pagination } from "@/components/pagination";

interface SP {
  [k: string]: string | string[] | undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  return {
    title: q ? `جستجوی «${q}»` : "جستجوی محصولات",
    robots: { index: !q },
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const q = str(sp, "q");

  const result = await listProducts({
    q,
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

  const makeHref = (page: number) => {
    const usp = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (typeof v === "string" && v && k !== "page") usp.set(k, v);
    }
    if (page > 1) usp.set("page", String(page));
    const s = usp.toString();
    return s ? `/search?${s}` : "/search";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-4 text-xs text-slate-400">
        <Link href="/" className="hover:text-orange-600">خانه</Link>
        <span className="mx-1">/</span>
        <span>جستجو{q ? `: ${q}` : ""}</span>
      </nav>

      <div className="flex gap-6">
        <Filters brands={facets.brands} params={sp} basePath="/search" />
        <div className="min-w-0 flex-1">
          <SortBar total={result.total} params={sp} basePath="/search" />
          {result.items.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-16 text-center">
              <Search className="size-12 text-slate-300" />
              <h2 className="text-lg font-black">نتیجه‌ای یافت نشد</h2>
              <p className="text-sm text-slate-500">
                عبارت دیگری را امتحان کنید؛ می‌توانید با کد فنی یا شماره قطعه (OEM) جستجو کنید.
              </p>
              <a href="/quote" className="btn-outline mt-2">درخواست استعلام قطعه</a>
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
