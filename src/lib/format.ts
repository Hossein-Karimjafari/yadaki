const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function faToEnDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function formatToman(amount: number): string {
  return toFaDigits(amount.toLocaleString("en-US"));
}

export function priceLabel(amount: number): string {
  return `${formatToman(amount)} تومان`;
}

export function formatJalali(date: Date | string | number): string {
  const d = new Date(date);
  const [jy, jm, jd] = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  const p = (n: number) => toFaDigits(String(n).padStart(2, "0"));
  return `${toFaDigits(jy)}/${p(jm)}/${p(jd)}`;
}

export function formatJalaliTime(date: Date | string | number): string {
  const d = new Date(date);
  const hh = p2(d.getHours());
  const mm = p2(d.getMinutes());
  return `${formatJalali(d)} ${toFaDigits(hh)}:${toFaDigits(mm)}`;
}

function p2(n: number) {
  return String(n).padStart(2, "0");
}

export function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const gDm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  const y = gy - (gy <= 1600 ? 621 : 1600);
  const gy2 = gm > 2 ? y + 1 : y;
  let days =
    365 * y +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    gDm[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

export const ORDER_STATUS_FA: Record<string, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PAID: "پرداخت شده",
  PROCESSING: "در حال پردازش",
  PACKAGING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل داده شده",
  CANCELED: "لغو شده",
  AWAITING_RETURN: "در انتظار مرجوعی",
  RETURNED: "مرجوع شده",
  AWAITING_WARRANTY: "در انتظار گارانتی",
  REFUNDED: "بازپرداخت شده",
  INCOMPLETE: "ناقص / نیاز به تأمین",
  AWAITING_PARTNER_APPROVAL: "در انتظار تأیید همکار",
};

export const ROLE_FA: Record<string, string> = {
  CUSTOMER: "مشتری",
  MECHANIC: "تعمیرگاه / مکانیک",
  WHOLESALE: "عمده‌فروش / همکار",
  ADMIN: "مدیر",
};

export const CONDITION_FA: Record<string, string> = {
  NEW: "نو",
  STOCK: "استوک",
  REFURBISHED: "بازسازی‌شده",
  ORIGINAL: "اصل / اورجینال",
  AFTERMARKET: "افترمارکت",
};
