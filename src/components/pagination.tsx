import Link from "next/link";
import { toFaDigits } from "@/lib/format";

export function Pagination({
  page,
  pages,
  makeHref,
}: {
  page: number;
  pages: number;
  makeHref: (page: number) => string;
}) {
  if (pages <= 1) return null;
  const nums: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i);

  return (
    <nav className="mt-8 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link href={makeHref(page - 1)} className="btn-outline !py-2">
          قبلی
        </Link>
      )}
      {nums.map((n) => (
        <Link
          key={n}
          href={makeHref(n)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
            n === page ? "bg-orange-600 text-white" : "border border-slate-200 bg-white hover:border-orange-300"
          }`}
        >
          {toFaDigits(n)}
        </Link>
      ))}
      {page < pages && (
        <Link href={makeHref(page + 1)} className="btn-outline !py-2">
          بعدی
        </Link>
      )}
    </nav>
  );
}
