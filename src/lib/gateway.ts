export interface GatewayRequest {
  orderCode: string;
  amount: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
}

export interface GatewayRedirect {
  type: "redirect";
  url: string;
}

export interface GatewayVerifyInput {
  authority: string;
  amount: number;
}

export interface GatewayVerifyResult {
  ok: boolean;
  refId?: string;
  message?: string;
}

export interface PaymentGateway {
  readonly id: string;
  request(req: GatewayRequest): Promise<GatewayRedirect>;
  verify(input: GatewayVerifyInput): Promise<GatewayVerifyResult>;
}

export function getGateway(id: string): PaymentGateway {
  switch (id) {
    case "sandbox":
      return new SandboxGateway();
    case "zarinpal":
      return new ZarinpalGateway();
    default:
      throw new Error(`Unknown gateway: ${id}`);
  }
}

export class SandboxGateway implements PaymentGateway {
  readonly id = "sandbox";

  async request(req: GatewayRequest): Promise<GatewayRedirect> {
    const url = new URL(req.callbackUrl);
    const sandboxUrl = new URL(`/pay/${req.orderCode}`, url.origin);
    return { type: "redirect", url: sandboxUrl.toString() };
  }

  async verify(input: GatewayVerifyInput): Promise<GatewayVerifyResult> {
    if (input.authority === "sandbox_fail") return { ok: false, message: "پرداخت ناموفق بود" };
    return { ok: true, refId: "SBX" + Math.floor(Math.random() * 1_000_000_000) };
  }
}

export class ZarinpalGateway implements PaymentGateway {
  readonly id = "zarinpal";
  private merchantId = process.env.ZARINPAL_MERCHANT_ID ?? "";

  async request(req: GatewayRequest): Promise<GatewayRedirect> {
    if (!this.merchantId) throw new Error("ZARINPAL_MERCHANT_ID تنظیم نشده است");
    const res = await fetch("https://api.zarinpal.com/pg/v4/payment/request.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: this.merchantId,
        amount: req.amount * 10,
        description: req.description,
        callback_url: req.callbackUrl,
        metadata: { order_id: req.orderCode, mobile: req.mobile },
      }),
    });
    const data = await res.json();
    const authority = data?.data?.authority;
    if (!authority) throw new Error(data?.errors?.message ?? "خطای زرین‌پال");
    return {
      type: "redirect",
      url: `https://www.zarinpal.com/pg/StartPay/${authority}`,
    };
  }

  async verify(input: GatewayVerifyInput): Promise<GatewayVerifyResult> {
    const res = await fetch("https://api.zarinpal.com/pg/v4/payment/verify.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: this.merchantId,
        amount: input.amount * 10,
        authority: input.authority,
      }),
    });
    const data = await res.json();
    const code = data?.data?.code;
    if (code === 100 || code === 101) {
      return { ok: true, refId: String(data.data.ref_id ?? "") };
    }
    return { ok: false, message: "تأیید پرداخت ناموفق بود" };
  }
}
