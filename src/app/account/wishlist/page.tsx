import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { removeWishlistAction } from "@/app/actions/wishlist";
import { Price } from "@/components/price";
import { resolvePrice } from "@/lib/price";
import { toFaDigits } from "@/lib/format";

export const metadata = { title: "علاقه‌مندی‌های من" };

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { brand: true, images: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">علاقه‌مندی‌های من ({toFaDigits(items.length)})</h1>
      {items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <Heart className="size-12 text-slate-300" />
          <p className="text-sm text-slate-500">لیست علاقه‌مندی شما خالی است.</p>
          <Link href="/search" className="btn-primary">مشاهده محصولات</Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((it) => {
            const rp = resolvePrice(it.product, user.role);
            return (
              <div key={it.id} className="card flex gap-4 p-4">
                <Link href={`/p/${it.product.slug}`} className="relative h-20 w-20 shrink-0 rounded-xl bg-slate-50">
                  <Image
                    src={it.product.images[0]?.url ?? "/part-placeholder.svg"}
                    alt={it.product.name}
                    fill
                    unoptimized
                    className="object-contain p-1"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/p/${it.product.slug}`} className="line-clamp-1 text-sm font-bold hover:text-orange-600">
                    {it.product.name}
                  </Link>
                  <span className="text-xs text-slate-400">{it.product.brand.name}</span>
                  <div className="mt-2 flex items-center justify-between">
                    <Price p={rp} size="sm" />
                    <form action={removeWishlistAction}>
                      <input type="hidden" name="productId" value={it.productId} />
                      <button className="text-xs text-red-500 hover:underline">حذف</button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
