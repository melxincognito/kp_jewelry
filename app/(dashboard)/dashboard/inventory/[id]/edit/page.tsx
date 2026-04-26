import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ProductForm } from "@/components/dashboard/ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Item" };

export default async function EditInventoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { sizes: { orderBy: { size: "asc" } } },
  });
  if (!product) notFound();

  const images: string[] = JSON.parse(product.images || "[]");
  const styles: string[] = JSON.parse(product.styles || "[]");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 672 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: "0.05em", color: "text.primary" }}>
          Edit Item
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4, mt: 0.5, display: "block" }}>
          {product.name}
        </Typography>
      </Box>
      <ProductForm
        mode="edit"
        defaultValues={{
          id: product.id,
          name: product.name,
          sku: product.sku ?? "",
          description: product.description ?? "",
          material: product.material ?? "",
          images,
          costMXN: product.costMXN,
          costUSD: product.costUSD,
          exchangeRate: product.exchangeRate,
          purchaseDate: product.purchaseDate.toISOString(),
          shippingFees: product.shippingFees,
          wholesalePrice: product.wholesalePrice,
          sellingPrice: product.sellingPrice,
          jewelryType: product.jewelryType,
          styles,
          quantity: product.quantity,
          sizes: product.sizes.map((s) => ({ size: s.size, quantity: s.quantity })),
          status: product.status,
          showOnStorefront: product.showOnStorefront,
        }}
      />
    </Box>
  );
}
