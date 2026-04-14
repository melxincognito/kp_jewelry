"use client";

import { useState, useMemo, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { DeleteProductButton } from "@/components/dashboard/DeleteProductButton";
import type { ProductStatus } from "@/types/enums";

const statusVariant: Record<
  ProductStatus,
  "status-available" | "status-reserved" | "status-sold"
> = {
  AVAILABLE: "status-available",
  RESERVED: "status-reserved",
  SOLD: "status-sold",
};

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "NECKLACE", label: "Necklace" },
  { value: "BRACELET", label: "Bracelet" },
  { value: "RING", label: "Ring" },
  { value: "EARRING", label: "Earring" },
  { value: "CHARM", label: "Charm" },
  { value: "NOSE_RING", label: "Nose Ring" },
  { value: "CLIP", label: "Clip" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "SOLD", label: "Sold" },
];

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string | null;
  images: string;
  jewelryType: string;
  status: string;
  quantity: number;
  costUSD: number;
  costMXN: number;
  shippingFees: number;
  wholesalePrice: number;
  sellingPrice: number;
}

interface InventoryTableProps {
  products: InventoryProduct[];
}

export function InventoryTable({ products }: InventoryTableProps) {
  const [nameQuery, setNameQuery] = useState("");
  const [skuQuery, setSkuQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const nameId = useId();
  const skuId = useId();
  const typeId = useId();
  const statusId = useId();

  const filtered = useMemo(() => {
    const name = nameQuery.trim().toLowerCase();
    const sku = skuQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (name && !p.name.toLowerCase().includes(name)) return false;
      if (sku && !(p.sku ?? "").toLowerCase().includes(sku)) return false;
      if (typeFilter && p.jewelryType !== typeFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, nameQuery, skuQuery, typeFilter, statusFilter]);

  const hasFilters = nameQuery || skuQuery || typeFilter || statusFilter;

  function clearFilters() {
    setNameQuery("");
    setSkuQuery("");
    setTypeFilter("");
    setStatusFilter("");
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <section
        aria-label="Filter inventory"
        className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm p-4 flex flex-wrap gap-3 items-end"
      >
        {/* Name */}
        <div className="flex flex-col gap-1 min-w-[160px] flex-1">
          <label
            htmlFor={nameId}
            className="text-[10px] tracking-widest uppercase text-[var(--white-dim)]/50"
          >
            Name
          </label>
          <input
            id={nameId}
            type="search"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Search by name…"
            className="bg-[var(--black-soft)] border border-[var(--black-border)] rounded-sm px-3 py-2 text-sm text-[var(--white)] placeholder:text-[var(--white-dim)]/30 focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
          />
        </div>

        {/* SKU */}
        <div className="flex flex-col gap-1 min-w-[140px] flex-1">
          <label
            htmlFor={skuId}
            className="text-[10px] tracking-widest uppercase text-[var(--white-dim)]/50"
          >
            SKU
          </label>
          <input
            id={skuId}
            type="search"
            value={skuQuery}
            onChange={(e) => setSkuQuery(e.target.value)}
            placeholder="e.g. NKL-001"
            className="bg-[var(--black-soft)] border border-[var(--black-border)] rounded-sm px-3 py-2 text-sm text-[var(--white)] placeholder:text-[var(--white-dim)]/30 focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
          />
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label
            htmlFor={typeId}
            className="text-[10px] tracking-widest uppercase text-[var(--white-dim)]/50"
          >
            Type
          </label>
          <select
            id={typeId}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[var(--black-soft)] border border-[var(--black-border)] rounded-sm px-3 py-2 text-sm text-[var(--white)] focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label
            htmlFor={statusId}
            className="text-[10px] tracking-widest uppercase text-[var(--white-dim)]/50"
          >
            Status
          </label>
          <select
            id={statusId}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--black-soft)] border border-[var(--black-border)] rounded-sm px-3 py-2 text-sm text-[var(--white)] focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-[var(--white-dim)]/50 hover:text-[var(--gold)] transition-colors pb-2 self-end whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </section>

      {/* Results count */}
      <p
        role="status"
        aria-live="polite"
        className="text-xs text-[var(--white-dim)]/40"
      >
        {hasFilters
          ? `${filtered.length} of ${products.length} item${products.length !== 1 ? "s" : ""} match`
          : `${products.length} item${products.length !== 1 ? "s" : ""}`}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-xs text-[var(--white-dim)]/40">
          No items match your filters.
        </div>
      ) : (
        <div className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--black-border)]">
                <th scope="col" className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase w-10" />
                <th scope="col" className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Item</th>
                <th scope="col" className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">SKU</th>
                <th scope="col" className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Type</th>
                <th scope="col" className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Status</th>
                <th scope="col" className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Cost USD</th>
                <th scope="col" className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">List Price</th>
                <th scope="col" className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Margin</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
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
                          <Image
                            src={images[0]}
                            alt=""
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[var(--white)] font-medium">{product.name}</p>
                      <p className="text-xs text-[var(--white-dim)]/40">Qty: {product.quantity}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[var(--white-dim)]/60 font-mono">
                        {product.sku ?? <span className="text-[var(--white-dim)]/20">—</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-[var(--white-dim)] capitalize">
                        {product.jewelryType.replace("_", " ").toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[product.status as ProductStatus]}>
                        {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--white-dim)]">
                      <p>${totalCost.toFixed(2)}</p>
                      <p className="text-[10px] text-[var(--white-dim)]/40">{product.costMXN.toFixed(0)} MXN</p>
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
                          aria-label={`Edit ${product.name}`}
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
