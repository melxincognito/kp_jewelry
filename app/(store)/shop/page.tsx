import { Suspense } from "react";
import { db } from "@/lib/db";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
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
    ...(params.status ? { status: params.status as ProductStatus } : { status: { not: "SOLD" as ProductStatus } }),
  };

  const orderBy =
    params.sort === "price_asc" ? { sellingPrice: "asc" as const }
    : params.sort === "price_desc" ? { sellingPrice: "desc" as const }
    : { createdAt: "desc" as const };

  let products = await db.product.findMany({ where, orderBy, skip, take: PAGE_SIZE + 1 });

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
    try { return JSON.parse(p.styles || "[]") as string[]; }
    catch { return []; }
  });
  return [...new Set(allStyles)].sort();
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
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
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 300, letterSpacing: "0.05em", color: "text.primary" }}>
          Collection
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.5, mt: 0.5, display: "block" }}>
          {products.length} item{products.length !== 1 ? "s" : ""} shown
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, sm: 4 } }}>
        <Suspense fallback={null}>
          <FilterSidebar availableStyles={availableStyles} />
        </Suspense>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {products.length === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 12, gap: 2, textAlign: "center" }}>
              <Typography sx={{ fontSize: "1.875rem", opacity: 0.2 }} aria-hidden="true">💎</Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>No items found</Typography>
              <MuiLink href="/shop" variant="caption" sx={{ color: "primary.main" }}>
                Clear filters
              </MuiLink>
            </Box>
          ) : (
            <>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
                {products.map((product) => (
                  <Suspense key={product.id} fallback={<PageLoader />}>
                    <ProductCard product={product} />
                  </Suspense>
                ))}
              </Box>

              {/* Pagination */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mt: 5 }}>
                {page > 1 && (
                  <MuiLink href={buildPageUrl(page - 1)} sx={{ fontSize: "0.875rem", color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" }, transition: "color 0.15s" }}>
                    ← Previous
                  </MuiLink>
                )}
                <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4 }}>Page {page}</Typography>
                {hasNextPage && (
                  <MuiLink href={buildPageUrl(page + 1)} sx={{ fontSize: "0.875rem", color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" }, transition: "color 0.15s" }}>
                    Next →
                  </MuiLink>
                )}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
