import { prisma } from "@/lib/prisma";
import { createCategoryAction, createBrandAction } from "../actions";
import { CategoryIcon } from "@/components/category-icon";
import { toFaDigits } from "@/lib/format";

export const metadata = { title: "دسته‌بندی‌ها و برندها" };

export default async function AdminCatalogPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ parentId: "asc" }, { order: "asc" }],
      include: { parent: { select: { name: true } }, _count: { select: { products: true } } },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);
  const parents = categories.filter((c) => !c.parentId);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-lg font-black">دسته‌بندی‌ها</h2>
        <form action={createCategoryAction} className="card grid gap-3 p-5 sm:grid-cols-2">
          <div>
            <label className="label">نام *</label>
            <input name="name" className="input" required />
          </div>
          <div>
            <label className="label">slug (خالی = خودکار)</label>
            <input name="slug" className="input" dir="ltr" />
          </div>
          <div>
            <label className="label">والد</label>
            <select name="parentId" className="input">
              <option value="">— دسته اصلی —</option>
              {parents.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">آیکون (نام آیکون Lucide)</label>
            <input name="icon" className="input" dir="ltr" placeholder="wrench" />
          </div>
          <div className="sm:col-span-2">
            <button className="btn-primary w-full">افزودن دسته</button>
          </div>
        </form>

        <div className="card max-h-96 overflow-y-auto p-4 text-sm">
          {parents.map((p) => (
            <div key={p.id} className="mb-3">
              <div className="flex items-center gap-1.5 font-bold">
                <CategoryIcon name={p.icon} className="size-4 text-orange-600" />
                {p.name}{" "}
                <span className="text-xs text-slate-400">
                  ({toFaDigits(p._count.products)} کالا) — {p.slug}
                </span>
              </div>
              <ul className="ms-5 mt-1 space-y-0.5 text-xs text-slate-500">
                {categories
                  .filter((c) => c.parentId === p.id)
                  .map((ch) => (
                    <li key={ch.id}>
                      • {ch.name} ({toFaDigits(ch._count.products)})
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-black">برندها</h2>
        <form action={createBrandAction} className="card grid gap-3 p-5 sm:grid-cols-2">
          <div>
            <label className="label">نام *</label>
            <input name="name" className="input" required />
          </div>
          <div>
            <label className="label">slug (خالی = خودکار)</label>
            <input name="slug" className="input" dir="ltr" />
          </div>
          <div>
            <label className="label">کشور</label>
            <input name="country" className="input" />
          </div>
          <label className="flex cursor-pointer items-end gap-2 pb-1 text-sm">
            <input type="checkbox" name="isOriginal" value="1" className="h-4 w-4 accent-orange-600" />
            سازنده اصلی (اورجینال)
          </label>
          <div className="sm:col-span-2">
            <button className="btn-primary w-full">افزودن برند</button>
          </div>
        </form>

        <div className="card max-h-96 overflow-y-auto divide-y divide-slate-50 text-sm">
          {brands.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3">
              <span className="font-bold">
                {b.name}
                {b.country ? <span className="ms-2 text-xs text-slate-400">{b.country}</span> : null}
              </span>
              <span className="text-xs text-slate-400">
                {toFaDigits(b._count.products)} کالا — {b.slug}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
