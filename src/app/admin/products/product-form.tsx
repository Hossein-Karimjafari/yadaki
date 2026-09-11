"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "../actions";
import { SubmitButton } from "@/components/submit-button";

const initial: ProductFormState = {};

export interface ProductFormData {
  id?: string;
  name?: string;
  slug?: string;
  categoryId?: string;
  brandId?: string;
  condition?: string;
  price?: number;
  partnerPrice?: number | null;
  discountPrice?: number | null;
  stock?: number;
  lowStockAt?: number;
  warrantyMonths?: number;
  minOrderQty?: number;
  maxOrderQty?: number | null;
  country?: string | null;
  partNumber?: string | null;
  oemNumber?: string | null;
  technicalCode?: string | null;
  shortDesc?: string | null;
  longDesc?: string | null;
  specs?: string | null;
  isFeatured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  hasFreeShipping?: boolean;
  tiers?: Array<{ minQty: number; price: number }>;
}

export function ProductForm({
  categories,
  brands,
  product,
}: {
  categories: Array<{ id: string; name: string; parentName?: string }>;
  brands: Array<{ id: string; name: string }>;
  product?: ProductFormData;
}) {
  const [state, action] = useActionState(
    product?.id ? updateProductAction : createProductAction,
    initial
  );

  const tiersText = (product?.tiers ?? [])
    .map((t) => `${t.minQty}:${t.price}`)
    .join("\n");

  return (
    <form action={action} className="space-y-5">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="card p-5">
        <h3 className="mb-4 font-black">اطلاعات پایه</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">نام محصول *</label>
            <input name="name" className="input" defaultValue={product?.name} required />
          </div>
          <div>
            <label className="label">دسته‌بندی *</label>
            <select name="categoryId" className="input" defaultValue={product?.categoryId} required>
              <option value="">انتخاب...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentName ? `${c.parentName} → ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">برند *</label>
            <select name="brandId" className="input" defaultValue={product?.brandId} required>
              <option value="">انتخاب...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">وضعیت کالا</label>
            <select name="condition" className="input" defaultValue={product?.condition ?? "NEW"}>
              <option value="NEW">نو</option>
              <option value="ORIGINAL">اصل / اورجینال</option>
              <option value="AFTERMARKET">افترمارکت</option>
              <option value="STOCK">استوک</option>
              <option value="REFURBISHED">بازسازی‌شده</option>
            </select>
          </div>
          <div>
            <label className="label">آدرس سئویی (slug) — خالی = خودکار</label>
            <input name="slug" className="input" defaultValue={product?.slug} dir="ltr" />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-black">قیمت و موجودی (تومان)</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">قیمت اصلی *</label>
            <input name="price" className="input" inputMode="numeric" defaultValue={product?.price} required />
          </div>
          <div>
            <label className="label">قیمت همکار</label>
            <input name="partnerPrice" className="input" inputMode="numeric" defaultValue={product?.partnerPrice ?? ""} />
          </div>
          <div>
            <label className="label">قیمت با تخفیف</label>
            <input name="discountPrice" className="input" inputMode="numeric" defaultValue={product?.discountPrice ?? ""} />
          </div>
          <div>
            <label className="label">موجودی انبار *</label>
            <input name="stock" className="input" inputMode="numeric" defaultValue={product?.stock ?? 0} required />
          </div>
          <div>
            <label className="label">حد هشدار کم‌موجودی</label>
            <input name="lowStockAt" className="input" inputMode="numeric" defaultValue={product?.lowStockAt ?? 3} />
          </div>
          <div>
            <label className="label">ماه گارانتی</label>
            <input name="warrantyMonths" className="input" inputMode="numeric" defaultValue={product?.warrantyMonths ?? 0} />
          </div>
          <div>
            <label className="label">حداقل تعداد سفارش</label>
            <input name="minOrderQty" className="input" inputMode="numeric" defaultValue={product?.minOrderQty ?? 1} />
          </div>
          <div>
            <label className="label">حداکثر تعداد سفارش</label>
            <input name="maxOrderQty" className="input" inputMode="numeric" defaultValue={product?.maxOrderQty ?? ""} />
          </div>
          <div>
            <label className="label">کشور سازنده</label>
            <input name="country" className="input" defaultValue={product?.country ?? ""} />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">قیمت پلکانی — هر خط: تعداد:قیمت (مثلاً 5:1600000)</label>
          <textarea name="tiers" rows={3} className="input font-mono" dir="ltr" defaultValue={tiersText} />
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-black">کدها و مشخصات</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">شماره قطعه</label>
            <input name="partNumber" className="input" dir="ltr" defaultValue={product?.partNumber ?? ""} />
          </div>
          <div>
            <label className="label">شماره OEM</label>
            <input name="oemNumber" className="input" dir="ltr" defaultValue={product?.oemNumber ?? ""} />
          </div>
          <div>
            <label className="label">کد فنی</label>
            <input name="technicalCode" className="input" dir="ltr" defaultValue={product?.technicalCode ?? ""} />
          </div>
        </div>
        <div className="mt-4 grid gap-4">
          <div>
            <label className="label">توضیح کوتاه</label>
            <textarea name="shortDesc" rows={2} className="input" defaultValue={product?.shortDesc ?? ""} />
          </div>
          <div>
            <label className="label">توضیح کامل</label>
            <textarea name="longDesc" rows={5} className="input" defaultValue={product?.longDesc ?? ""} />
          </div>
          <div>
            <label className="label">مشخصات فنی — هر خط: عنوان: مقدار</label>
            <textarea name="specs" rows={4} className="input" defaultValue={product?.specs ?? ""} />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 font-black">برچسب‌های فروشگاه</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <Check name="isFeatured" label="پیشنهاد ویژه" checked={product?.isFeatured} />
          <Check name="isNew" label="جدید" checked={product?.isNew} />
          <Check name="isBestSeller" label="پرفروش" checked={product?.isBestSeller} />
          <Check name="hasFreeShipping" label="ارسال رایگان" checked={product?.hasFreeShipping} />
        </div>
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{state.success}</p>
      )}

      <div className="flex gap-3">
        <SubmitButton className="btn-primary" pendingText="در حال ذخیره...">
          {product?.id ? "ذخیره تغییرات" : "افزودن محصول"}
        </SubmitButton>
        <Link href="/admin/products" className="btn-outline">انصراف</Link>
      </div>
    </form>
  );
}

function Check({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} className="h-4 w-4 accent-orange-600" />
      {label}
    </label>
  );
}
