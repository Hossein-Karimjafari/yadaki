import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatJalali } from "@/lib/format";

export const metadata = {
  title: "وبلاگ یدکی",
  description: "مقالات آموزشی نگهداری خودرو، راهنمای خرید لوازم یدکی و تشخیص قطعات تقلبی",
};

export const revalidate = 600;

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-black">وبلاگ یدکی</h1>
      <p className="mb-8 text-sm text-slate-500">
        آموزش‌های نگهداری خودرو، راهنمای خرید قطعات و تشخیص اصالت کالا
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="card group p-6 transition hover:border-orange-300 hover:shadow-md">
            <h2 className="text-lg font-black group-hover:text-orange-600">{p.title}</h2>
            {p.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-500">{p.excerpt}</p>}
            <span className="mt-3 block text-xs text-slate-400">{formatJalali(p.publishedAt ?? p.createdAt)}</span>
          </Link>
        ))}
      </div>
      {posts.length === 0 && (
        <div className="card p-16 text-center text-sm text-slate-400">
          هنوز مقاله‌ای منتشر نشده است.
        </div>
      )}
    </div>
  );
}
