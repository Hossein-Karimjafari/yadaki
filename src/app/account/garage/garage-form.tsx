"use client";

import { useActionState, useMemo, useState } from "react";
import { saveVehicleAction, type SimpleState } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import type { VehicleTree } from "@/lib/vehicles";

const initial: SimpleState = {};

export function GarageForm({ tree }: { tree: VehicleTree[] }) {
  const [state, action] = useActionState(saveVehicleAction, initial);
  const [makeId, setMakeId] = useState("");
  const [modelId, setModelId] = useState("");
  const [trimId, setTrimId] = useState("");

  const models = useMemo(() => tree.find((m) => m.id === makeId)?.models ?? [], [tree, makeId]);
  const trims = useMemo(() => models.find((m) => m.id === modelId)?.trims ?? [], [models, modelId]);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label">برند خودرو</label>
        <select className="input" value={makeId} onChange={(e) => { setMakeId(e.target.value); setModelId(""); setTrimId(""); }} required>
          <option value="">انتخاب کنید...</option>
          {tree.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">مدل خودرو</label>
        <select className="input" value={modelId} disabled={!makeId} onChange={(e) => { setModelId(e.target.value); setTrimId(""); }} required>
          <option value="">انتخاب کنید...</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">تیپ / موتور</label>
        <select name="trimId" className="input" value={trimId} disabled={!modelId} onChange={(e) => setTrimId(e.target.value)} required>
          <option value="">انتخاب کنید...</option>
          {trims.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.yearFrom} تا {t.yearTo ?? "بعد"})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">سال ساخت (شمسی، اختیاری)</label>
        <input name="year" className="input" inputMode="numeric" placeholder="مثلاً ۱۳۹۸" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">پلاک خودرو (اختیاری)</label>
        <input name="plate" className="input" placeholder="مثلاً 12ب345 ایران22" />
      </div>
      <div className="sm:col-span-2">
        {state.error && <p className="mb-2 text-sm font-bold text-red-600">{state.error}</p>}
        {state.success && <p className="mb-2 text-sm font-bold text-emerald-600">{state.success}</p>}
        <SubmitButton pendingText="در حال ذخیره..." disabled={!trimId}>
          افزودن به گاراژ
        </SubmitButton>
      </div>
    </form>
  );
}
