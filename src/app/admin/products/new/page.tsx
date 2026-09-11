import { prisma } from "@/lib/prisma";
import { ProductForm } from "../product-form";

export const metadata = { title: "افزودن محصول" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { order: "asc" }],
    include: { parent: { select: { name: true } } },
  });
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">افزودن محصول جدید</h2>
      <ProductForm
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          parentName: c.parent?.name,
        }))}
        brands={brands.map((b) => ({ id: b.id, name: b.name }))}
      />
    </div>
  );
}
