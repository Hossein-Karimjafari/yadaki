import Link from "next/link";
import { getSelectedTrim, getVehicleTree } from "@/lib/vehicles";
import { setVehicleAction } from "@/app/actions/vehicle";
import { toFaDigits } from "@/lib/format";

export async function Filters({
  brands,
  params,
  basePath,
}: {
  brands: Array<{ id: string; name: string; slug: string }>;
  params: Record<string, string | string[] | undefined>;
  basePath: string;
}) {
  const tree = await getVehicleTree();
  const trim = await getSelectedTrim();
  const selectedBrands = arr(params.brand);

  return (
    <aside className="card sticky top-32 hidden h-fit w-64 shrink-0 p-5 lg:block">
      <h3 className="mb-4 font-black">فیلترها</h3>

      <form action={basePath} method="get" className="space-y-6">
        {params.q && <input type="hidden" name="q" value={String(params.q)} />}
        {trim && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs">
            <span className="font-bold text-orange-800">
              فیلتر فعال: {trim.model.make.name} {trim.model.name} {trim.name}
            </span>
            <button
              formAction={async () => {
                "use server";
                await setVehicleAction(null);
              }}
              className="mt-1 block text-orange-600 hover:underline"
            >
              حذف فیلتر خودرو
            </button>
          </div>
        )}

        {!trim && (
          <div>
            <Label>خودروی سازگار</Label>
            <div className="space-y-2">
              <select
                name="vehicle_make"
                id="flt-make"
                className="input !py-2 text-xs"
                defaultValue=""
              >
                <option value="">همه برندها</option>
                {tree.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                برای فیلتر دقیق خودرو از دکمه «انتخاب خودرو» در بالای صفحه استفاده کنید.
              </p>
            </div>
          </div>
        )}

        <div>
          <Label>برند قطعه</Label>
          <div className="max-h-48 space-y-1.5 overflow-y-auto pl-1">
            {brands.map((b) => (
              <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="brand"
                  value={b.slug}
                  defaultChecked={selectedBrands.includes(b.slug)}
                  className="h-4 w-4 accent-orange-600"
                />
                <span className="text-slate-600">{b.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label>محدوده قیمت (تومان)</Label>
          <div className="flex items-center gap-2">
            <input name="min" inputMode="numeric" placeholder="از" className="input !py-2 text-xs" defaultValue={String(params.min ?? "")} />
            <span className="text-slate-300">—</span>
            <input name="max" inputMode="numeric" placeholder="تا" className="input !py-2 text-xs" defaultValue={String(params.max ?? "")} />
          </div>
        </div>

        <div>
          <Label>وضعیت کالا</Label>
          <div className="space-y-1.5 text-sm">
            <Check name="condition" value="ORIGINAL" label="اصل / اورجینال" checked={arr(params.condition).includes("ORIGINAL")} />
            <Check name="condition" value="AFTERMARKET" label="افترمارکت" checked={arr(params.condition).includes("AFTERMARKET")} />
            <Check name="condition" value="STOCK" label="استوک" checked={arr(params.condition).includes("STOCK")} />
            <Check name="condition" value="REFURBISHED" label="بازسازی‌شده" checked={arr(params.condition).includes("REFURBISHED")} />
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <Check name="inStock" value="1" label="فقط کالاهای موجود" checked={params.inStock === "1"} />
          <Check name="hasWarranty" value="1" label="دارای گارانتی" checked={params.hasWarranty === "1"} />
          <Check name="freeShipping" value="1" label="ارسال رایگان" checked={params.freeShipping === "1"} />
          <Check name="discount" value="1" label="فقط تخفیف‌دارها" checked={params.discount === "1"} />
        </div>

        <button className="btn-primary w-full">اعمال فیلترها</button>
        <Link href={basePath} className="btn-outline w-full">
          حذف همه فیلترها
        </Link>
      </form>
    </aside>
  );
}

function arr(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-sm font-bold text-slate-700">{children}</div>;
}

function Check({ name, value, label, checked }: { name: string; value: string; label: string; checked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        className="h-4 w-4 accent-orange-600"
      />
      <span className="text-slate-600">{label}</span>
    </label>
  );
}

export function SortBar({
  total,
  params,
  basePath,
}: {
  total: number;
  params: Record<string, string | string[] | undefined>;
  basePath: string;
}) {
  const sorts = [
    { key: "", label: "جدیدترین" },
    { key: "best", label: "پرفروش‌ترین" },
    { key: "cheap", label: "ارزان‌ترین" },
    { key: "expensive", label: "گران‌ترین" },
    { key: "rating", label: "بهترین امتیاز" },
  ];
  const current = String(params.sort ?? "");
  const qs = (over: Record<string, string>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (typeof v === "string" && v) sp.set(k, v);
    }
    for (const [k, v] of Object.entries(over)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
      <span className="text-slate-500">{toFaDigits(total)} کالا یافت شد</span>
      <div className="flex flex-wrap gap-1">
        {sorts.map((s) => (
          <Link
            key={s.key}
            href={qs({ sort: s.key })}
            className={`rounded-lg px-3 py-1.5 ${
              current === s.key
                ? "bg-orange-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
