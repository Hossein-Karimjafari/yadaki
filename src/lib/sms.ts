import { prisma } from "./prisma";

export type SmsProvider = "console" | "kavenegar" | "melipayamak";

export async function sendSms(phone: string, template: string, body: string): Promise<void> {
  const provider = (process.env.SMS_PROVIDER as SmsProvider) ?? "console";
  try {
    if (provider === "kavenegar") {
      await sendKavenegar(phone, body);
    } else if (provider === "melipayamak") {
      await sendMelipayamak(phone, body);
    } else {
      console.log(`[SMS:${template}] to=${phone} body=${body}`);
    }
    await prisma.smsLog.create({ data: { phone, template, body, status: "SENT" } });
  } catch (e) {
    console.error("SMS failed", e);
    await prisma.smsLog.create({ data: { phone, template, body, status: "FAILED" } }).catch(() => {});
  }
}

async function sendKavenegar(phone: string, message: string) {
  const key = process.env.KAVENEGAR_API_KEY;
  if (!key) throw new Error("KAVENEGAR_API_KEY missing");
  const sender = process.env.SMS_SENDER ?? "";
  const url = `https://api.kavenegar.com/v1/${key}/sms/send.json?receptor=${encodeURIComponent(phone)}&message=${encodeURIComponent(message)}${sender ? `&sender=${sender}` : ""}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`kavenegar ${res.status}`);
}

async function sendMelipayamak(phone: string, message: string) {
  const user = process.env.MELIPAYAMAK_USERNAME;
  const pass = process.env.MELIPAYAMAK_PASSWORD;
  const from = process.env.SMS_SENDER;
  if (!user || !pass || !from) throw new Error("melipayamak env missing");
  const res = await fetch("https://rest.payamak-panel.com/api/SendSMS/SendSMS", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass, to: phone, from, text: message }),
  });
  if (!res.ok) throw new Error(`melipayamak ${res.status}`);
}
