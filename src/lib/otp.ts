import { prisma } from "./prisma";

const MAX_PER_HOUR = 3;
const CODE_TTL_MIN = 5;
const MAX_ATTEMPTS = 5;

const bucket = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (bucket.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  bucket.set(key, hits);
  return true;
}

export async function issueOtp(phone: string): Promise<{ ok: boolean; message: string }> {
  if (!rateLimit(`otp:${phone}`, MAX_PER_HOUR, 60 * 60 * 1000)) {
    return { ok: false, message: "تعداد درخواست زیاد است. کمی بعد دوباره تلاش کنید." };
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.otpCode.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + CODE_TTL_MIN * 60 * 1000),
    },
  });
  const { sendSms } = await import("./sms");
  await sendSms(phone, "OTP", `کد ورود شما به یدکی: ${code}`);
  return { ok: true, message: "کد تأیید پیامک شد." };
}

export async function verifyOtp(phone: string, code: string): Promise<{ ok: boolean; message: string }> {
  if (!rateLimit(`otpverify:${phone}`, 10, 10 * 60 * 1000)) {
    return { ok: false, message: "تلاش بیش از حد. بعداً تلاش کنید." };
  }
  const otp = await prisma.otpCode.findFirst({
    where: { phone, consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { ok: false, message: "کد منقضی یا نامعتبر است." };
  if (otp.attempts >= MAX_ATTEMPTS) return { ok: false, message: "کد غیرفعال شد. کد جدید بگیرید." };
  if (otp.code !== code) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, message: "کد نادرست است." };
  }
  await prisma.otpCode.update({ where: { id: otp.id }, data: { consumed: true } });
  return { ok: true, message: "ok" };
}
