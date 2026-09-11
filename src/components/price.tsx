import { formatToman } from "@/lib/format";
import type { ResolvedPrice } from "@/lib/price";

export function Price({ p, size = "md" }: { p: ResolvedPrice; size?: "sm" | "md" | "lg" }) {
  const cls =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className="flex flex-col items-start gap-0.5">
      {p.hasDiscount && (
        <span className="text-xs text-slate-400 line-through">
          {formatToman(p.list)}
        </span>
      )}
      <span className={`font-black text-slate-900 ${cls}`}>
        {formatToman(p.final)}
        <span className="mr-1 text-xs font-normal text-slate-500">تومان</span>
      </span>
      {p.partnerApplied && (
        <span className="badge bg-emerald-100 text-emerald-700">قیمت همکار</span>
      )}
    </div>
  );
}
