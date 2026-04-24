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
    [router, searchParams],
  );

  const toggleStyle = useCallback(
    (style: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = params.getAll("style");
      if (current.includes(style)) {
        params.delete("style");
        current
          .filter((s) => s !== style)
          .forEach((s) => params.append("style", s));
      } else {
        params.append("style", style);
      }
      params.delete("page");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams],
  );

  const activeType = searchParams.get("type") ?? "";
  const activeStyles = searchParams.getAll("style");
  const activeSort = searchParams.get("sort") ?? "newest";
  const activeStatus = searchParams.get("status") ?? "";

  // Styles Variables

  const asideProductFiltersStyles = "w-56 flex-shrink-0 flex flex-col gap-6";

  // Filter group label (Sort / Availability / Category / Style headings)

  const sortByFiltersStyles =
    "text-[10px] tracking-[0.25em] text-[var(--gold)] uppercase mb-3";

  // Filter option list container

  const filterOptionListStyles = "flex flex-col gap-1";

  // Filter option buttons (Sort / Availability / Category)

  const sortByButtonOptionsStyles =
    "hover:cursor-pointer text-left text-sm px-3 py-2 rounded-sm transition-colors";

  const filterButtonActiveStyles = "bg-[var(--gold)]/10 text-[var(--gold)]";
  const filterButtonInactiveStyles =
    "text-[var(--white-dim)] hover:text-[var(--white)] hover:bg-white/5";

  // Style tag chips

  const styleTagListStyles = "flex flex-wrap gap-2";
  const styleTagBaseStyles =
    "hover:cursor-pointer text-xs px-2.5 py-1 rounded-sm border transition-colors";
  const styleTagActiveStyles =
    "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]";
  const styleTagInactiveStyles =
    "border-[var(--black-border)] text-[var(--white-dim)] hover:border-[var(--gold)]/40";

  // Reset Filters

  const resetFiltersStyles =
    "hover:cursor-pointer text-xs text-[var(--white-dim)]/50 hover:text-[var(--white-dim)] transition-colors text-left";

  return (
    <aside aria-label="Product filters" className={asideProductFiltersStyles}>
      {/* Sort */}
      <div role="group" aria-labelledby="filter-sort-label">
        <p id="filter-sort-label" className={sortByFiltersStyles}>
          Sort
        </p>
        <div className={filterOptionListStyles}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setParam("sort", opt.value)}
              aria-pressed={activeSort === opt.value}
              className={[
                sortByButtonOptionsStyles,
                activeSort === opt.value
                  ? filterButtonActiveStyles
                  : filterButtonInactiveStyles,
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div role="group" aria-labelledby="filter-availability-label">
        <p id="filter-availability-label" className={sortByFiltersStyles}>
          Availability
        </p>
        <div className={filterOptionListStyles}>
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
                sortByButtonOptionsStyles,
                activeStatus === opt.value
                  ? filterButtonActiveStyles
                  : filterButtonInactiveStyles,
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div role="group" aria-labelledby="filter-category-label">
        <p id="filter-category-label" className={sortByFiltersStyles}>
          Category
        </p>
        <div className={filterOptionListStyles}>
          {JEWELRY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setParam("type", type.value)}
              aria-pressed={activeType === type.value}
              className={[
                sortByButtonOptionsStyles,
                activeType === type.value
                  ? filterButtonActiveStyles
                  : filterButtonInactiveStyles,
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
          <p id="filter-style-label" className={sortByFiltersStyles}>
            Style
          </p>
          <div className={styleTagListStyles}>
            {availableStyles.map((style) => (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                aria-pressed={activeStyles.includes(style)}
                className={[
                  styleTagBaseStyles,
                  activeStyles.includes(style)
                    ? styleTagActiveStyles
                    : styleTagInactiveStyles,
                ].join(" ")}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear hello */}
      {(activeType || activeStyles.length > 0 || activeStatus) && (
        <button
          onClick={() => router.push("/shop")}
          aria-label="Clear all filters"
          className={resetFiltersStyles}
        >
          Clear all filters ×
        </button>
      )}
    </aside>
  );
}
