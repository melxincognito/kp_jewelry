import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { BulkImportButton } from "@/components/dashboard/BulkImportButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalValue = products
    .filter((p) => p.status !== "SOLD")
    .reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-light tracking-wide text-[var(--white)]">Inventory</h1>
          <p className="text-xs text-[var(--white-dim)]/40 mt-1">
            {products.length} items · ${totalValue.toFixed(2)} listed value
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BulkImportButton />
          <Link href="/dashboard/inventory/new">
            <Button size="sm">+ Add Item</Button>
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <p className="text-4xl opacity-10">💎</p>
          <p className="text-[var(--white-dim)]">No items yet</p>
          <Link href="/dashboard/inventory/new">
            <Button variant="secondary" size="sm">Add your first item</Button>
          </Link>
        </div>
      ) : (
        <InventoryTable products={products} />
      )}
    </div>
  );
}
