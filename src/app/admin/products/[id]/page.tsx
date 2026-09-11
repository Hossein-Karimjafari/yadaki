import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "../product-form";

export const metadata = { title: "ویرایش محصول" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { tiers: { orderBy: { minQty: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
      include: { parent: { select: { name: true } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">ویرایش: {product.name}</h2>
      <ProductForm
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          parentName: c.parent?.name,
        }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          brandId: product.brandId,
          condition: product.condition,
          price: product.price,
          partnerPrice: product.partnerPrice,
          discountPrice: product.discountPrice,
          stock: product.stock,
          lowStockAt: product.lowStockAt,
          warrantyMonths: product.warrantyMonths,
          minOrderQty: product.minOrderQty,
          maxOrderQty: product.maxOrderQty,
          country: product.country,
          partNumber: product.partNumber,
          oemNumber: product.oemNumber,
          technicalCode: product.technicalCode,
          shortDesc: product.shortDesc,
          longDesc: product.longDesc,
          specs: product.specs,
          isFeatured: product.isFeatured,
          isNew: product.isNew,
          isBestSeller: product.isBestSeller,
          hasFreeShipping: product.hasFreeShipping,
          tiers: product.tiers.map((t) => ({ minQty: t.minQty, price: t.price })),
        }}
      />
    </div>
  );
}
