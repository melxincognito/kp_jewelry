import { ProductForm } from "@/components/dashboard/ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Item" };

export default function NewInventoryItemPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-light tracking-wide text-[var(--white)]">Add New Item</h1>
        <p className="text-xs text-[var(--white-dim)]/40 mt-1">
          Fill in the details below. Use the Fetch button to auto-load the exchange rate for your purchase date.
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
