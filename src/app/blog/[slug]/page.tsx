import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatJalali } from "@/lib/format";

export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug }, select: { title: true, excerpt: true } });
  if (!post) return { title: "مقاله یافت نشد" };
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.isPublished) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-4 text-xs text-slate-400">
        <Link href="/" className="hover:text-orange-600">خانه</Link>
        <span className="mx-1">/</span>
        <Link href="/blog" className="hover:text-orange-600">وبلاگ</Link>
      </nav>
      <h1 className="text-2xl font-black leading-relaxed md:text-3xl">{post.title}</h1>
      <span className="mt-2 block text-xs text-slate-400">{formatJalali(post.publishedAt ?? post.createdAt)}</span>
      {post.excerpt && (
        <p className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm leading-7 text-orange-900">{post.excerpt}</p>
      )}
      <div className="mt-6 whitespace-pre-line text-[15px] leading-8 text-slate-700">{post.body}</div>
      <div className="mt-10 border-t border-slate-100 pt-6">
        <Link href="/blog" className="btn-outline">همه مقالات</Link>
      </div>
    </article>
  );
}
