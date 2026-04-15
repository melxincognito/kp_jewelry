import { Suspense } from "react";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/ProductCard";
import { FilterSidebar } from "@/components/store/FilterSidebar";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import type { Metadata } from "next";
import type { JewelryType, ProductStatus } from "@/types/enums";

export const metadata: Metadata = { title: "Shop" };

const PAGE_SIZE = 24;

interface ShopSearchParams {
  type?: string;
  style?: string | string[];
  sort?: string;
  status?: string;
  page?: string;
}

async function getProducts(params: ShopSearchParams) {
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const styleFilters = params.style
    ? (Array.isArray(params.style) ? params.style : [params.style])
    : [];

  const where = {
    showOnStorefront: true,
    ...(params.type ? { jewelryType: params.type as JewelryType } : {}),
    ...(params.status
      ? { status: params.status as ProductStatus }
      : { status: { not: "SOLD" as ProductStatus } }),
  };

  const orderBy =
    params.sort === "price_asc"
      ? { sellingPrice: "asc" as const }
      : params.sort === "price_desc"
      ? { sellingPrice: "desc" as const }
      : { createdAt: "desc" as const };

  let products = await db.product.findMany({
    where,
    orderBy,
    skip,
    take: PAGE_SIZE + 1, // fetch one extra to check hasNextPage
  });

  // Filter by style in JS (styles stored as JSON array)
  if (styleFilters.length > 0) {
    products = products.filter((p) => {
      const pStyles: string[] = JSON.parse(p.styles || "[]");
      return styleFilters.some((s) => pStyles.includes(s));
    });
  }

  const hasNextPage = products.length > PAGE_SIZE;
  return { products: products.slice(0, PAGE_SIZE), hasNextPage, page };
}

async function getAvailableStyles(): Promise<string[]> {
  const products = await db.product.findMany({
    where: { status: { not: "SOLD" }, showOnStorefront: true },
    select: { styles: true },
  });
  const allStyles = products.flatMap((p) => {
    try {
      return JSON.parse(p.styles || "[]") as string[];
    } catch {
      return [];
    }
  });
  return [...new Set(allStyles)].sort();
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const params = await searchParams;
  const [{ products, hasNextPage, page }, availableStyles] = await Promise.all([
    getProducts(params),
    getAvailableStyles(),
  ]);

  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams();
    if (params.type) sp.set("type", params.type);
    if (params.sort) sp.set("sort", params.sort);
    if (params.status) sp.set("status", params.status);
    if (Array.isArray(params.style)) params.style.forEach((s) => sp.append("style", s));
    else if (params.style) sp.set("style", params.style);
    sp.set("page", String(p));
    return `/shop?${sp.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-wide text-[var(--white)]">
          Collection
        </h1>
        <p className="text-xs text-[var(--white-dim)]/50 mt-1">
          {products.length} item{products.length !== 1 ? "s" : ""} shown
        </p>
      </div>

      <div className="flex gap-8">
        <Suspense fallback={null}>
          <FilterSidebar availableStyles={availableStyles} />
        </Suspense>

        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <p className="text-3xl opacity-20">💎</p>
              <p className="text-[var(--white-dim)]">No items found</p>
              <a href="/shop" className="text-xs text-[var(--gold)]">
                Clear filters
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Suspense key={product.id} fallback={<PageLoader />}>
                    <ProductCard product={product} />
                  </Suspense>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-4 mt-10">
                {page > 1 && (
                  <a
                    href={buildPageUrl(page - 1)}
                    className="text-sm text-[var(--white-dim)] hover:text-[var(--gold)] transition-colors"
                  >
                    ← Previous
                  </a>
                )}
                <span className="text-xs text-[var(--white-dim)]/40">
                  Page {page}
                </span>
                {hasNextPage && (
                  <a
                    href={buildPageUrl(page + 1)}
                    className="text-sm text-[var(--white-dim)] hover:text-[var(--gold)] transition-colors"
                  >
                    Next →
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
