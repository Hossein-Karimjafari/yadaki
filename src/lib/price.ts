import type { Product, UserRole } from "@prisma/client";

export interface ResolvedPrice {
  list: number;
  final: number;
  hasDiscount: boolean;
  partnerApplied: boolean;
}

const PARTNER_ROLES: UserRole[] = ["MECHANIC", "WHOLESALE", "ADMIN"];

export function resolvePrice(
  product: Pick<Product, "price" | "discountPrice" | "discountEndsAt" | "partnerPrice">,
  role: UserRole | null | undefined
): ResolvedPrice {
  const discountActive =
    product.discountPrice != null &&
    (!product.discountEndsAt || new Date(product.discountEndsAt) > new Date());

  let final = discountActive ? product.discountPrice! : product.price;
  let partnerApplied = false;

  if (role && PARTNER_ROLES.includes(role) && product.partnerPrice && product.partnerPrice < final) {
    final = product.partnerPrice;
    partnerApplied = true;
  }

  return {
    list: product.price,
    final,
    hasDiscount: discountActive && !partnerApplied,
    partnerApplied,
  };
}

export function stockStatus(p: { stock: number; lowStockAt: number }): "OUT" | "LOW" | "IN" {
  if (p.stock <= 0) return "OUT";
  if (p.stock <= p.lowStockAt) return "LOW";
  return "IN";
}
