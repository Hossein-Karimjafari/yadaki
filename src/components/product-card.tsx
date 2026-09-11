import Link from "next/link";
import Image from "next/image";
import { Price } from "./price";
import { AddToCartButton } from "./add-to-cart";
import { resolvePrice } from "@/lib/price";
import { getCurrentUser } from "@/lib/auth";
import { CONDITION_FA, toFaDigits } from "@/lib/format";
import type { Product, Brand, Category, ProductImage } from "@prisma/client";

type P = Product & { brand: Brand; category: Category; images: ProductImage[] };

export async function ProductCard({ product }: { product: P }) {
  const user = await getCurrentUser();
  const rp = resolvePrice(product, user?.role ?? null);
  const img = product.images[0]?.url ?? "/part-placeholder.svg";

  return (
    <div className="card group relative flex flex-col overflow-hidden transition hover:shadow-lg">
      {product.discountPrice && (
        <span className="badge absolute left-3 top-3 z-10 bg-red-500 text-white">
          تخفیف
        </span>
      )}
      <Link href={`/p/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        <Image
          src={img}
          alt={product.name}
          fill
          unoptimized
          className="object-contain p-4 transition group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{product.brand.name}</span>
          <span>•</span>
          <span>{product.category.name}</span>
        </div>
        <Link
          href={`/p/${product.slug}`}
          className="line-clamp-2 text-sm font-bold leading-6 text-slate-800 hover:text-orange-600"
        >
          {product.name}
        </Link>
        <div className="flex flex-wrap gap-1">
          {product.warrantyMonths > 0 && (
            <span className="badge bg-emerald-50 text-emerald-700">
              {toFaDigits(product.warrantyMonths)} ماه گارانتی
            </span>
          )}
          <span className="badge bg-slate-100 text-slate-600">
            {CONDITION_FA[product.condition]}
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <Price p={rp} />
          <AddToCartButton
            productId={product.id}
            disabled={product.stock <= 0}
            compact
          />
        </div>
        {product.stock <= 0 && (
          <span className="text-xs font-bold text-red-500">ناموجود</span>
        )}
        {product.stock > 0 && product.stock <= product.lowStockAt && (
          <span className="text-xs font-bold text-amber-600">
            فقط {toFaDigits(product.stock)} عدد باقی مانده
          </span>
        )}
      </div>
    </div>
  );
}
