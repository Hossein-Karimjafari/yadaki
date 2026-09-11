import { prisma } from "@/lib/prisma";
import { PostForm } from "./post-form";
import { togglePostPublishAction } from "../actions";
import { formatJalali } from "@/lib/format";

export const metadata = { title: "مدیریت وبلاگ" };

export default async function AdminBlogPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-black">وبلاگ</h2>
      <PostForm />

      <div className="card divide-y divide-slate-50">
        {posts.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
            <div>
              <span className="font-bold">{p.title}</span>
              <span className="ms-2 text-xs text-slate-400" dir="ltr">{p.slug}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{formatJalali(p.createdAt)}</span>
              <span className={`badge ${p.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {p.isPublished ? "منتشرشده" : "پیش‌نویس"}
              </span>
              <form action={togglePostPublishAction}>
                <input type="hidden" name="id" value={p.id} />
                <button className="text-orange-600 hover:underline">
                  {p.isPublished ? "لغو انتشار" : "انتشار"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="p-8 text-center text-slate-400">مقاله‌ای وجود ندارد.</p>}
      </div>
    </div>
  );
}
