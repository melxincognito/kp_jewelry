import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/dashboard/ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Item" };

export default async function EditInventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { sizes: { orderBy: { size: "asc" } } },
  });
  if (!product) notFound();

  const images: string[] = JSON.parse(product.images || "[]");
  const styles: string[] = JSON.parse(product.styles || "[]");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-light tracking-wide text-[var(--white)]">Edit Item</h1>
        <p className="text-xs text-[var(--white-dim)]/40 mt-1">{product.name}</p>
      </div>
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
    </div>
  );
}
