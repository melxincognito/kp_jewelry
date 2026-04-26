"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import MuiButton from "@mui/material/Button";

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
  { value: "custom", label: "Custom Dates…" },
];

const inputSx = {
  minWidth: 180,
  "& .MuiOutlinedInput-input": { padding: "8px 12px", fontSize: "0.875rem" },
};

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
      if (value === "custom") return;
      const params = new URLSearchParams();
      if (value !== "all") params.set("preset", value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname],
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
    <Box
      sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 1.5 }}
      role="search"
      aria-label="Filter sales by date"
    >
      <TextField
        select
        label="Date Range"
        value={preset}
        onChange={(e) => applyPreset(e.target.value)}
        size="small"
        sx={inputSx}
      >
        {PRESETS.map((p) => (
          <MenuItem key={p.value} value={p.value}>
            {p.label}
          </MenuItem>
        ))}
      </TextField>

      {preset === "custom" && (
        <>
          <TextField
            label="From"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            size="small"
            aria-label="Start date"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ ...inputSx, minWidth: 150 }}
          />
          <TextField
            label="To"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            size="small"
            aria-label="End date"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ ...inputSx, minWidth: 150 }}
          />
          <MuiButton
            variant="contained"
            size="small"
            onClick={applyCustom}
            disabled={!from && !to}
            sx={{
              bgcolor: "#1a1714",
              color: "#fdfbf8",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "0.75rem",
              "&:hover": { bgcolor: "#7a5c10" },
              "&.Mui-disabled": { opacity: 0.5 },
              mb: "1px",
            }}
          >
            Apply
          </MuiButton>
        </>
      )}

      {isFiltered && (
        <MuiButton
          variant="text"
          size="small"
          onClick={clearFilters}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            letterSpacing: "normal",
            fontSize: "0.875rem",
            mb: "1px",
          }}
        >
          Clear
        </MuiButton>
      )}
    </Box>
  );
}
