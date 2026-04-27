"use client";

import { useState, useMemo, useId } from "react";
import NextLink from "next/link";
import Image from "next/image";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import MuiButton from "@mui/material/Button";
import { Badge } from "@/components/ui/Badge";
import { DeleteProductButton } from "@/components/dashboard/DeleteProductButton";
import type { ProductStatus } from "@/types/enums";

const statusVariant: Record<ProductStatus, "status-available" | "status-reserved" | "status-sold"> = {
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
  showOnStorefront: boolean;
}

const filterSx = {
  minWidth: 140,
  "& .MuiOutlinedInput-input": { padding: "8px 12px", fontSize: "0.875rem" },
};

export function InventoryTable({ products }: { products: InventoryProduct[] }) {
  const [nameQuery, setNameQuery] = useState("");
  const [skuQuery, setSkuQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const nameId = useId();
  const skuId = useId();

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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Filter bar */}
      <Paper
        component="section"
        aria-label="Filter inventory"
        sx={{ p: 2, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "flex-end" }}
      >
        <TextField
          id={nameId}
          label="Name"
          type="search"
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
          placeholder="Search by name…"
          size="small"
          sx={{ ...filterSx, flex: 1, minWidth: 160 }}
        />
        <TextField
          id={skuId}
          label="SKU"
          type="search"
          value={skuQuery}
          onChange={(e) => setSkuQuery(e.target.value)}
          placeholder="e.g. NKL-001"
          size="small"
          sx={{ ...filterSx, flex: 1 }}
        />
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          size="small"
          sx={filterSx}
        >
          {TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={filterSx}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
          ))}
        </TextField>
        {hasFilters && (
          <MuiButton
            variant="text"
            size="small"
            onClick={clearFilters}
            sx={{ color: "text.secondary", textTransform: "none", letterSpacing: "normal", fontSize: "0.75rem", alignSelf: "flex-end", mb: "1px" }}
          >
            Clear filters
          </MuiButton>
        )}
      </Paper>

      {/* Results count */}
      <Typography
        role="status"
        aria-live="polite"
        variant="caption"
        sx={{ color: "text.secondary", opacity: 0.4 }}
      >
        {hasFilters
          ? `${filtered.length} of ${products.length} item${products.length !== 1 ? "s" : ""} match`
          : `${products.length} item${products.length !== 1 ? "s" : ""}`}
      </Typography>

      {/* Table */}
      {filtered.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4 }}>
            No items match your filters.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }}>
                  <Box component="span" sx={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>Photo</Box>
                </TableCell>
                <TableCell>Item</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Storefront</TableCell>
                <TableCell align="right">Cost USD</TableCell>
                <TableCell align="right">List Price</TableCell>
                <TableCell align="right">Margin</TableCell>
                <TableCell><Box component="span" sx={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>Actions</Box></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((product) => {
                const images: string[] = JSON.parse(product.images || "[]");
                const totalCost = product.costUSD + product.shippingFees;
                const margin = product.sellingPrice - product.wholesalePrice;
                return (
                  <TableRow key={product.id}>
                    <TableCell sx={{ p: 1 }}>
                      <Box sx={{ position: "relative", width: 32, height: 32, bgcolor: "#ede9e3", borderRadius: "2px", overflow: "hidden" }}>
                        {images[0] && (
                          <Image src={images[0]} alt="" fill sizes="32px" style={{ objectFit: "cover" }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>{product.name}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4 }}>Qty: {product.quantity}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontFamily: "var(--font-geist-mono)", color: "text.secondary", opacity: 0.6 }}>
                        {product.sku ?? <Box component="span" sx={{ opacity: 0.2 }}>—</Box>}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "capitalize" }}>
                        {product.jewelryType.replace("_", " ").toLowerCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[product.status as ProductStatus]}>
                        {product.status.charAt(0) + product.status.slice(1).toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.showOnStorefront ? (
                        <Typography variant="caption" sx={{ color: "#059669" }}>Visible</Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.3 }}>Hidden</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>${totalCost.toFixed(2)}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4 }}>{product.costMXN.toFixed(0)} MXN</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500, color: "primary.main" }}>${product.sellingPrice.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontWeight: 500, color: margin >= 0 ? "#059669" : "#b91c1c" }}>
                        ${margin.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end" }}>
                        <MuiLink
                          component={NextLink}
                          href={`/dashboard/inventory/${product.id}/edit`}
                          aria-label={`Edit ${product.name}`}
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                            opacity: 0.5,
                            textDecoration: "none",
                            "&:hover": { color: "primary.main", opacity: 1 },
                            transition: "all 0.15s",
                          }}
                        >
                          Edit
                        </MuiLink>
                        <DeleteProductButton id={product.id} />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
