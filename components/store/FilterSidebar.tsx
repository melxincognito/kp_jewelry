"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const JEWELRY_TYPES = [
  { value: "", label: "All Types" },
  { value: "NECKLACE", label: "Necklaces" },
  { value: "BRACELET", label: "Bracelets" },
  { value: "RING", label: "Rings" },
  { value: "EARRING", label: "Earrings" },
  { value: "CHARM", label: "Charms" },
  { value: "NOSE_RING", label: "Nose Rings" },
  { value: "CLIP", label: "Clips" },
  { value: "OTHER", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

interface FilterSidebarProps {
  availableStyles: string[];
}

export function FilterSidebar({ availableStyles }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset page on filter change
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleStyle = useCallback(
    (style: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll("style");
      if (current.includes(style)) {
        params.delete("style");
        current.filter((s) => s !== style).forEach((s) => params.append("style", s));
      } else {
        params.append("style", style);
      }
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  const activeType = searchParams.get("type") ?? "";
  const activeStyles = searchParams.getAll("style");
  const activeSort = searchParams.get("sort") ?? "newest";
  const activeStatus = searchParams.get("status") ?? "";

  return (
    <aside aria-label="Product filters" className="w-56 flex-shrink-0 flex flex-col gap-6">
      {/* Sort */}
      <div role="group" aria-labelledby="filter-sort-label">
        <p id="filter-sort-label" className="text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase mb-3">Sort</p>
        <div className="flex flex-col gap-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam("sort", opt.value)}
              aria-pressed={activeSort === opt.value}
              className={[
                "text-left text-sm px-3 py-2 rounded-sm transition-colors",
                activeSort === opt.value
                  ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                  : "text-[var(--white-dim)] hover:text-[var(--white)] hover:bg-white/5",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div role="group" aria-labelledby="filter-availability-label">
        <p id="filter-availability-label" className="text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase mb-3">
          Availability
        </p>
        <div className="flex flex-col gap-1">
          {[
            { value: "", label: "All" },
            { value: "AVAILABLE", label: "Available" },
            { value: "RESERVED", label: "Reserved" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam("status", opt.value)}
              aria-pressed={activeStatus === opt.value}
              className={[
                "text-left text-sm px-3 py-2 rounded-sm transition-colors",
                activeStatus === opt.value
                  ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                  : "text-[var(--white-dim)] hover:text-[var(--white)] hover:bg-white/5",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jewelry Type */}
      <div role="group" aria-labelledby="filter-category-label">
        <p id="filter-category-label" className="text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase mb-3">
          Category
        </p>
        <div className="flex flex-col gap-1">
          {JEWELRY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setParam("type", type.value)}
              aria-pressed={activeType === type.value}
              className={[
                "text-left text-sm px-3 py-2 rounded-sm transition-colors",
                activeType === type.value
                  ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                  : "text-[var(--white-dim)] hover:text-[var(--white)] hover:bg-white/5",
              ].join(" ")}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style Tags */}
      {availableStyles.length > 0 && (
        <div role="group" aria-labelledby="filter-style-label">
          <p id="filter-style-label" className="text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase mb-3">
            Style
          </p>
          <div className="flex flex-wrap gap-2">
            {availableStyles.map((style) => (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                aria-pressed={activeStyles.includes(style)}
                className={[
                  "text-xs px-2.5 py-1 rounded-sm border transition-colors",
                  activeStyles.includes(style)
                    ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                    : "border-[var(--black-border)] text-[var(--white-dim)] hover:border-[var(--gold)]/40",
                ].join(" ")}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear */}
      {(activeType || activeStyles.length > 0 || activeStatus) && (
        <button
          onClick={() => router.push("/shop")}
          aria-label="Clear all filters"
          className="text-xs text-[var(--white-dim)]/50 hover:text-[var(--white-dim)] transition-colors text-left"
        >
          Clear all filters ×
        </button>
      )}
    </aside>
  );
}
