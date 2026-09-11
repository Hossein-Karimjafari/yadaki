"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setVehicleAction } from "@/app/actions/vehicle";
import type { VehicleTree } from "@/lib/vehicles";

interface Props {
  tree: VehicleTree[];
  selected: { make: string; model: string; trim: string } | null;
}

export function VehicleSelector({ tree, selected }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [makeId, setMakeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [trimId, setTrimId] = useState("");

  const models = useMemo(
    () => tree.find((m) => m.id === makeId)?.models ?? [],
    [tree, makeId]
  );
  const trims = useMemo(
    () => models.find((m) => m.id === modelId)?.trims ?? [],
    [models, modelId]
  );

  function pick(id: string | null) {
    startTransition(async () => {
      await setVehicleAction(id);
      setOpen(false);
      setMakeId("");
      setModelId("");
      setTrimId("");
      router.refresh();
    });
  }

  if (selected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm">
          <span>🚗</span>
          <span className="font-bold text-orange-800">
            {selected.make} {selected.model} | {selected.trim}
          </span>
        </div>
        <button
          onClick={() => pick(null)}
          disabled={pending}
          className="text-xs text-slate-400 hover:text-red-600"
          title="حذف خودروی انتخابی"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-outline !py-1.5 text-xs sm:text-sm"
      >
        🚗 انتخاب خودرو
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setOpen(false)}
          />
          <div className="card relative z-10 w-full max-w-lg p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black">انتخاب خودروی خود</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            <p className="mb-4 text-xs text-slate-500">
              با انتخاب خودرو، فقط قطعات سازگار نمایش داده می‌شوند.
            </p>
            <div className="grid gap-3">
              <select
                className="input"
                value={makeId}
                onChange={(e) => {
                  setMakeId(e.target.value);
                  setModelId("");
                  setTrimId("");
                }}
              >
                <option value="">برند خودرو...</option>
                {tree.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                className="input"
                value={modelId}
                disabled={!makeId}
                onChange={(e) => {
                  setModelId(e.target.value);
                  setTrimId("");
                }}
              >
                <option value="">مدل خودرو...</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>

              <select
                className="input"
                value={trimId}
                disabled={!modelId}
                onChange={(e) => setTrimId(e.target.value)}
              >
                <option value="">تیپ / سال ساخت...</option>
                {trims.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.engine ? ` - ${t.engine}` : ""}
                    {` (${t.yearFrom}${t.yearTo ? `-${t.yearTo}` : " به بعد"})`}
                  </option>
                ))}
              </select>

              <button
                className="btn-primary"
                disabled={!trimId || pending}
                onClick={() => pick(trimId)}
              >
                {pending ? "..." : "اعمال فیلتر خودرو"}
              </button>
              {selected && (
                <button className="btn-outline" onClick={() => pick(null)}>
                  حذف خودروی فعلی
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
