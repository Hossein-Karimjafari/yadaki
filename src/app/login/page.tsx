import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "ورود / ثبت‌نام" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(sp.next ?? "/account");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-2xl font-black text-white">
          ید
        </span>
        <h1 className="text-2xl font-black">ورود / ثبت‌نام در یدکی</h1>
        <p className="mt-2 text-sm text-slate-500">
          با شماره موبایل و کد یکبارمصرف وارد شوید؛ سریع و بدون رمز عبور.
        </p>
      </div>
      <div className="card p-6">
        <LoginForm next={sp.next} />
      </div>
    </div>
  );
}
