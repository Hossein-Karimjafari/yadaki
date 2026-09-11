import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getGateway } from "@/lib/gateway";
import { finalizePaidOrder, failOrderPayment } from "@/lib/orders";

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const orderCode = sp.get("order");
  const gatewayId = sp.get("gateway") ?? process.env.PAYMENT_GATEWAY ?? "sandbox";
  const authority = sp.get("authority") ?? sp.get("Authority") ?? "";
  const status = sp.get("status") ?? sp.get("Status") ?? "";

  if (!orderCode) {
    return NextResponse.redirect(new URL("/?payment=invalid", request.url));
  }

  const order = await prisma.order.findUnique({ where: { code: orderCode } });
  if (!order) {
    return NextResponse.redirect(new URL("/?payment=invalid", request.url));
  }

  if (order.status !== "PENDING_PAYMENT") {
    return NextResponse.redirect(new URL(`/order/${order.code}`, request.url));
  }

  const isFailed =
    status.toLowerCase() === "cancel" ||
    status.toLowerCase() === "n" ||
    status === "failed";

  if (isFailed) {
    await failOrderPayment(order.id);
    return NextResponse.redirect(new URL(`/order/${order.code}?payment=failed`, request.url));
  }

  try {
    const gateway = getGateway(gatewayId);
    const result = await gateway.verify({ authority, amount: order.total });
    if (result.ok && result.refId) {
      await finalizePaidOrder(order.id, gatewayId, result.refId);
      return NextResponse.redirect(new URL(`/order/${order.code}?payment=ok`, request.url));
    }
    await failOrderPayment(order.id);
    return NextResponse.redirect(
      new URL(`/order/${order.code}?payment=failed&msg=${encodeURIComponent(result.message ?? "")}`, request.url)
    );
  } catch {
    await failOrderPayment(order.id);
    return NextResponse.redirect(new URL(`/order/${order.code}?payment=error`, request.url));
  }
}
