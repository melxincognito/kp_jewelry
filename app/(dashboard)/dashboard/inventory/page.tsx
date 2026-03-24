import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";
import type { ProductStatus } from "@/types/enums";
import { DeleteProductButton } from "@/components/dashboard/DeleteProductButton";

export const metadata: Metadata = { title: "Inventory" };

const statusVariant: Record<
  ProductStatus,
  "status-available" | "status-reserved" | "status-sold"
> = {
  AVAILABLE: "status-available",
  RESERVED: "status-reserved",
  SOLD: "status-sold",
};

export default async function InventoryPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { sale: true },
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
        <Link href="/dashboard/inventory/new">
          <Button size="sm">+ Add Item</Button>
        </Link>
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
        <div className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--black-border)]">
                <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase w-10" />
                <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Item</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Cost USD</th>
                <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">List Price</th>
                <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Margin</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const images: string[] = JSON.parse(product.images || "[]");
                const totalCost = product.costUSD + product.shippingFees;
                const margin = product.sellingPrice - product.wholesalePrice;
                return (
                  <tr
                    key={product.id}
                    className="border-b border-[var(--black-border)]/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-3 py-2">
                      <div className="relative w-8 h-8 bg-[var(--black-soft)] rounded-sm overflow-hidden">
                        {images[0] && (
                          <Image src={images[0]} alt={product.name} fill sizes="32px" className="object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[var(--white)] font-medium">{product.name}</p>
                      <p className="text-xs text-[var(--white-dim)]/40">
                        Qty: {product.quantity}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[var(--white-dim)] capitalize">
                        {product.jewelryType.replace("_", " ").toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[product.status]}>
                        {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--white-dim)]">
                      <p>${totalCost.toFixed(2)}</p>
                      <p className="text-[10px] text-[var(--white-dim)]/40">
                        {product.costMXN.toFixed(0)} MXN
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--gold)] font-medium">
                      ${product.sellingPrice.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-medium ${margin >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      ${margin.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/dashboard/inventory/${product.id}/edit`}
                          className="text-xs text-[var(--white-dim)]/50 hover:text-[var(--gold)] transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton id={product.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
