import { prisma } from "./prisma";
import { normalizeText } from "./normalize";
import type { Prisma } from "@prisma/client";

export interface ProductQuery {
  q?: string;
  categorySlug?: string;
  brandSlugs?: string[];
  trimId?: string;
  conditions?: string[];
  min?: number;
  max?: number;
  inStock?: boolean;
  hasWarranty?: boolean;
  freeShipping?: boolean;
  discountOnly?: boolean;
  sort?: string;
  page?: number;
  perPage?: number;
}

export async function listProducts(query: ProductQuery) {
  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(48, Math.max(4, query.perPage ?? 20));
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

  if (query.categorySlug) {
    const category = await prisma.category.findUnique({ where: { slug: query.categorySlug } });
    if (category) {
      const childIds = (
        await prisma.category.findMany({ where: { parentId: category.id }, select: { id: true } })
      ).map((c) => c.id);
      where.categoryId = { in: [category.id, ...childIds] };
    } else {
      where.categoryId = "__none__";
    }
  }

  if (query.brandSlugs?.length) {
    where.brand = { slug: { in: query.brandSlugs } };
  }

  if (query.trimId) {
    where.compat = { some: { trimId: query.trimId } };
  }

  if (query.conditions?.length) {
    where.condition = { in: query.conditions as never[] };
  }

  if (query.min != null || query.max != null) {
    where.price = {};
    if (query.min != null) where.price.gte = query.min;
    if (query.max != null) where.price.lte = query.max;
  }

  if (query.inStock) where.stock = { gt: 0 };
  if (query.hasWarranty) where.warrantyMonths = { gt: 0 };
  if (query.freeShipping) where.hasFreeShipping = true;
  if (query.discountOnly) where.discountPrice = { not: null };

  const q = query.q ? normalizeText(query.q) : null;
  if (q) {
    const digits = q.replace(/\s+/g, "");
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { partNumber: { contains: digits, mode: "insensitive" } },
      { oemNumber: { contains: digits, mode: "insensitive" } },
      { technicalCode: { contains: digits, mode: "insensitive" } },
      { crossRefs: { some: { code: { contains: digits, mode: "insensitive" } } } },
      { brand: { name: { contains: q, mode: "insensitive" } } },
      { category: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  switch (query.sort) {
    case "cheap":
      orderBy = { price: "asc" };
      break;
    case "expensive":
      orderBy = { price: "desc" };
      break;
    case "best":
      orderBy = { salesCount: "desc" };
      break;
    case "rating":
      orderBy = { ratingAvg: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: { brand: true, category: true, images: { orderBy: { order: "asc" }, take: 1 } },
    }),
    prisma.product.count({ where }),
  ]);

  if (q) {
    prisma.searchLog
      .create({ data: { query: q, resultCount: total } })
      .catch(() => {});
  }

  return {
    items,
    total,
    page,
    perPage,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getFilterFacets() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return { brands };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { order: "asc" } },
      tiers: { orderBy: { minQty: "asc" } },
      crossRefs: true,
      compat: { include: { make: true, model: true, trim: true } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      questions: {
        where: { answer: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getRelatedProducts(categoryId: string, excludeId: string, take = 8) {
  return prisma.product.findMany({
    where: { categoryId, status: "ACTIVE", id: { not: excludeId }, stock: { gt: 0 } },
    include: { brand: true, category: true, images: { orderBy: { order: "asc" }, take: 1 } },
    orderBy: { salesCount: "desc" },
    take,
  });
}
