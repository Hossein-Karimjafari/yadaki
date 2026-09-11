import { prisma } from "@/lib/prisma";
import { resolvePartnerAction } from "../actions";
import { formatJalali, toFaDigits } from "@/lib/format";

export const metadata = { title: "درخواست‌های همکاری" };

export default async function AdminPartnersPage() {
  const requests = await prisma.partnerRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, phone: true } } },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">درخواست‌های همکاری (عمده/تعمیرگاه)</h2>
      {requests.length === 0 && (
        <div className="card p-10 text-center text-sm text-slate-400">درخواستی ثبت نشده است.</div>
      )}
      {requests.map((r) => (
        <div key={r.id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-black">{r.shopName}</span>
              <span className="badge ms-2 bg-blue-100 text-blue-700">
                {r.type === "WHOLESALE" ? "عمده‌فروش" : "تعمیرگاه"}
              </span>
              <span className="ms-2 text-xs text-slate-400">{r.city}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="badge bg-slate-100 text-slate-600">
                {r.status === "PENDING" ? "در انتظار" : r.status === "APPROVED" ? "تأیید شد" : "رد شد"}
              </span>
              <span className="text-slate-400">{formatJalali(r.createdAt)}</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            متقاضی: {r.user?.name ?? "—"} ({toFaDigits(r.user?.phone ?? "")})
            {r.message ? ` — ${r.message}` : ""}
          </p>
          {r.status === "PENDING" && (
            <div className="mt-3 flex gap-2">
              <form action={resolvePartnerAction}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="decision" value="APPROVE" />
                <button className="btn-primary !py-2 text-xs">تأیید و ارتقای حساب</button>
              </form>
              <form action={resolvePartnerAction}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="decision" value="REJECT" />
                <button className="btn-outline !py-2 text-xs">رد درخواست</button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
