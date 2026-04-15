"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const PRESETS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "last_quarter", label: "Last Quarter" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "custom", label: "Custom Range…" },
];

export function SalesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [preset, setPreset] = useState(searchParams.get("preset") ?? "all");
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  const applyPreset = useCallback(
    (value: string) => {
      setPreset(value);
      if (value === "custom") return; // wait for user to enter dates
      const params = new URLSearchParams();
      if (value !== "all") params.set("preset", value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const applyCustom = useCallback(() => {
    const params = new URLSearchParams();
    params.set("preset", "custom");
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, from, to]);

  const clearFilters = useCallback(() => {
    setPreset("all");
    setFrom("");
    setTo("");
    router.push(pathname);
  }, [router, pathname]);

  const isFiltered = preset !== "all";

  return (
    <div
      className="flex flex-wrap items-end gap-3"
      role="search"
      aria-label="Filter sales by date"
    >
      <div className="min-w-[180px]">
        <Select
          label="Date Range"
          options={PRESETS}
          value={preset}
          onChange={(e) => applyPreset(e.target.value)}
        />
      </div>

      {preset === "custom" && (
        <>
          <div className="min-w-[140px]">
            <Input
              label="From"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="Start date"
            />
          </div>
          <div className="min-w-[140px]">
            <Input
              label="To"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="End date"
            />
          </div>
          <div className="pb-[1px]">
            <Button size="sm" onClick={applyCustom} disabled={!from && !to}>
              Apply
            </Button>
          </div>
        </>
      )}

      {isFiltered && (
        <div className="pb-[1px]">
          <Button size="sm" variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
