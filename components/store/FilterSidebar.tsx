"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import MuiLink from "@mui/material/Link";

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

function FilterGroup({ label, labelId }: { label: string; labelId: string }) {
  return (
    <Typography
      id={labelId}
      sx={{
        fontSize: "0.625rem",
        letterSpacing: "0.25em",
        color: "primary.main",
        textTransform: "uppercase",
        fontWeight: 500,
        mb: 1,
      }}
    >
      {label}
    </Typography>
  );
}

function FilterButton({
  active,
  onClick,
  children,
  "aria-pressed": ariaPressed,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  "aria-pressed"?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      aria-pressed={ariaPressed}
      variant="text"
      size="small"
      sx={{
        justifyContent: "flex-start",
        textAlign: "left",
        fontSize: "0.875rem",
        textTransform: "none",
        letterSpacing: "normal",
        px: 1.5,
        py: 0.75,
        color: active ? "primary.main" : "text.secondary",
        bgcolor: active ? "rgba(122,92,16,0.08)" : "transparent",
        "&:hover": {
          color: active ? "primary.main" : "text.primary",
          bgcolor: active ? "rgba(122,92,16,0.12)" : "rgba(0,0,0,0.04)",
        },
      }}
    >
      {children}
    </Button>
  );
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
        current.filter((s) => s !== style).forEach((s) => params.append("style", s));
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

  return (
    <Box
      component="aside"
      aria-label="Product filters"
      sx={{ width: 224, flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}
    >
      {/* Sort */}
      <Box role="group" aria-labelledby="filter-sort-label">
        <FilterGroup label="Sort" labelId="filter-sort-label" />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          {SORT_OPTIONS.map((opt) => (
            <FilterButton
              key={opt.value}
              active={activeSort === opt.value}
              onClick={() => setParam("sort", opt.value)}
              aria-pressed={activeSort === opt.value}
            >
              {opt.label}
            </FilterButton>
          ))}
        </Box>
      </Box>

      {/* Availability */}
      <Box role="group" aria-labelledby="filter-availability-label">
        <FilterGroup label="Availability" labelId="filter-availability-label" />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          {[
            { value: "", label: "All" },
            { value: "AVAILABLE", label: "Available" },
            { value: "RESERVED", label: "Reserved" },
          ].map((opt) => (
            <FilterButton
              key={opt.value}
              active={activeStatus === opt.value}
              onClick={() => setParam("status", opt.value)}
              aria-pressed={activeStatus === opt.value}
            >
              {opt.label}
            </FilterButton>
          ))}
        </Box>
      </Box>

      {/* Category */}
      <Box role="group" aria-labelledby="filter-category-label">
        <FilterGroup label="Category" labelId="filter-category-label" />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
          {JEWELRY_TYPES.map((type) => (
            <FilterButton
              key={type.value}
              active={activeType === type.value}
              onClick={() => setParam("type", type.value)}
              aria-pressed={activeType === type.value}
            >
              {type.label}
            </FilterButton>
          ))}
        </Box>
      </Box>

      {/* Style Tags */}
      {availableStyles.length > 0 && (
        <Box role="group" aria-labelledby="filter-style-label">
          <FilterGroup label="Style" labelId="filter-style-label" />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {availableStyles.map((style) => {
              const active = activeStyles.includes(style);
              return (
                <Button
                  key={style}
                  onClick={() => toggleStyle(style)}
                  aria-pressed={active}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    textTransform: "none",
                    letterSpacing: "normal",
                    px: 1.25,
                    py: 0.5,
                    borderColor: active ? "primary.main" : "divider",
                    color: active ? "primary.main" : "text.secondary",
                    bgcolor: active ? "rgba(122,92,16,0.08)" : "transparent",
                    "&:hover": {
                      borderColor: active ? "primary.main" : "rgba(122,92,16,0.4)",
                    },
                  }}
                >
                  {style}
                </Button>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Clear filters */}
      {(activeType || activeStyles.length > 0 || activeStatus) && (
        <MuiLink
          component="button"
          onClick={() => router.push("/shop")}
          aria-label="Clear all filters"
          sx={{
            fontSize: "0.75rem",
            color: "text.secondary",
            opacity: 0.5,
            cursor: "pointer",
            textAlign: "left",
            textDecoration: "none",
            "&:hover": { opacity: 1 },
            background: "none",
            border: "none",
          }}
        >
          Clear all filters ×
        </MuiLink>
      )}
    </Box>
  );
}
