import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { toggleProductStatusAction, deleteProductAction } from "../actions";
import { formatToman, toFaDigits } from "@/lib/format";

export const metadata = { title: "مدیریت محصولات" };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const perPage = 20;

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { partNumber: { contains: q, mode: "insensitive" as const } },
          { oemNumber: { contains: q, mode: "insensitive" as const } },
          { technicalCode: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: { brand: true, category: true },
    }),
    prisma.product.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black">محصولات ({toFaDigits(total)})</h2>
        <div className="flex items-center gap-2">
          <form action="/admin/products" className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              className="input !py-2 w-56 text-xs"
              placeholder="جستجوی نام یا کد قطعه..."
            />
            <button className="btn-outline !py-2 text-xs">جستجو</button>
          </form>
          <Link href="/admin/products/new" className="btn-primary !py-2 text-xs">+ محصول جدید</Link>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="p-3">محصول</th>
              <th className="p-3">برند</th>
              <th className="p-3">قیمت</th>
              <th className="p-3">موجودی</th>
              <th className="p-3">فروش</th>
              <th className="p-3">وضعیت</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-50">
                <td className="max-w-64 p-3">
                  <Link href={`/p/${p.slug}`} className="line-clamp-1 font-bold hover:text-orange-600">
                    {p.name}
                  </Link>
                  <span className="text-[11px] text-slate-400">{p.category.name}</span>
                </td>
                <td className="p-3 text-xs">{p.brand.name}</td>
                <td className="p-3 whitespace-nowrap text-xs font-bold">{formatToman(p.price)}</td>
                <td className="p-3">
                  <span className={`badge ${
                    p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= p.lowStockAt ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {toFaDigits(p.stock)}
                  </span>
                </td>
                <td className="p-3 text-xs">{toFaDigits(p.salesCount)}</td>
                <td className="p-3">
                  <span className={`badge ${p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {p.status === "ACTIVE" ? "فعال" : "آرشیو"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-3 text-xs">
                    <Link href={`/admin/products/${p.id}`} className="text-orange-600 hover:underline">
                      ویرایش
                    </Link>
                    <form action={toggleProductStatusAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="text-slate-500 hover:underline">
                        {p.status === "ACTIVE" ? "غیرفعال" : "فعال"}
                      </button>
                    </form>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="text-red-500 hover:underline">حذف</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/admin/products?page=${n}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold ${
                n === page ? "bg-orange-600 text-white" : "border border-slate-200 bg-white"
              }`}
            >
              {toFaDigits(n)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
