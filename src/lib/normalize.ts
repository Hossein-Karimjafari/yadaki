import { faToEnDigits } from "./format";

const CHAR_MAP: Record<string, string> = {
  "ي": "ی",
  "ك": "ک",
  "ة": "ه",
  "ؤ": "و",
  "إ": "ا",
  "أ": "ا",
  "ٱ": "ا",
  "ٔ": "",
  "ً": "",
  "ٌ": "",
  "ٍ": "",
  "َ": "",
  "ُ": "",
  "ِ": "",
  "ّ": "",
  "ْ": "",
  "\u200c": " ",
};

export function normalizeText(input: string): string {
  let s = faToEnDigits(input);
  s = s.replace(/[يكةؤإأٱًٌٍَُِّْ\u200c]/g, (c) => CHAR_MAP[c] ?? c);
  s = s.replace(/[\u200b-\u200f\u202a-\u202e]/g, "");
  s = s.replace(/\s+/g, " ");
  return s.trim().toLowerCase();
}

export function normalizePhone(input: string): string {
  const d = faToEnDigits(input).replace(/\D/g, "");
  if (d.startsWith("98") && d.length === 12) return "0" + d.slice(2);
  if (d.startsWith("9") && d.length === 10) return "0" + d;
  return d;
}

export function isValidIranMobile(input: string): boolean {
  return /^09\d{9}$/.test(input);
}
