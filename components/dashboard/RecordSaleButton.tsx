"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MuiButton from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";

interface ProductSize {
  size: string;
  quantity: number;
}

interface AvailableProduct {
  id: string;
  name: string;
  sellingPrice: number;
  quantity: number;
  sizes: ProductSize[];
}

const fieldSx = { "& .MuiOutlinedInput-input": { padding: "8px 12px", fontSize: "0.875rem" } };

export function RecordSaleButton({ availableProducts }: { availableProducts: AvailableProduct[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(availableProducts[0]?.id ?? "");
  const [salePrice, setSalePrice] = useState(String(availableProducts[0]?.sellingPrice ?? ""));
  const [selectedSize, setSelectedSize] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [soldAt, setSoldAt] = useState(new Date().toISOString().split("T")[0]);

  const selectedProduct = availableProducts.find((p) => p.id === selectedProductId) ?? null;
  const availableSizes = selectedProduct?.sizes.filter((s) => s.quantity > 0) ?? [];
  const hasSizes = availableSizes.length > 0;

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    setSelectedSize("");
    const product = availableProducts.find((p) => p.id === id);
    if (product) setSalePrice(String(product.sellingPrice));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (hasSizes && !selectedSize) {
      setError("Please select a size for this item");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          size: selectedSize || undefined,
          salePrice: parseFloat(salePrice),
          buyerEmail: buyerEmail || undefined,
          notes,
          soldAt,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to record sale");
      }
      setOpen(false);
      setSelectedSize("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <MuiButton
        variant="contained"
        size="small"
        onClick={() => setOpen(true)}
        disabled={availableProducts.length === 0}
        sx={{
          bgcolor: "#1a1714",
          color: "#fdfbf8",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: "0.7rem",
          "&:hover": { bgcolor: "#7a5c10" },
          "&.Mui-disabled": { opacity: 0.5 },
        }}
      >
        Record Sale
      </MuiButton>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          Record a Sale
          <IconButton
            aria-label="Close"
            onClick={() => setOpen(false)}
            size="small"
            sx={{ position: "absolute", right: 16, top: 12, color: "text.secondary" }}
          >
            ×
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: "0.75rem" }}>{error}</Alert>
          )}

          <Box component="form" id="record-sale-form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              select
              label="Item Sold"
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              fullWidth
              size="small"
              sx={fieldSx}
            >
              {availableProducts.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} — ${p.sellingPrice.toFixed(2)} ({p.quantity} left)
                </MenuItem>
              ))}
            </TextField>

            {hasSizes && (
              <TextField
                select
                label="Size"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                fullWidth
                size="small"
                sx={fieldSx}
              >
                <MenuItem value="">Select a size…</MenuItem>
                {availableSizes.map((s) => (
                  <MenuItem key={s.size} value={s.size}>
                    Size {s.size} — {s.quantity} left
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <TextField
                label="Sale Price (USD)"
                type="number"
                slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
                size="small"
                sx={fieldSx}
              />
              <TextField
                label="Date Sold"
                type="date"
                value={soldAt}
                onChange={(e) => setSoldAt(e.target.value)}
                required
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                sx={fieldSx}
              />
            </Box>

            <TextField
              label="Buyer Email (optional)"
              type="email"
              placeholder="Leave blank for in-person sales"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              fullWidth
              size="small"
              sx={fieldSx}
            />

            <TextField
              label="Notes (optional)"
              placeholder="Any notes about this sale..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
              size="small"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <MuiButton
            variant="text"
            onClick={() => setOpen(false)}
            sx={{ color: "text.secondary", textTransform: "none", letterSpacing: "normal" }}
          >
            Cancel
          </MuiButton>
          <MuiButton
            type="submit"
            form="record-sale-form"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={14} sx={{ color: "inherit" }} /> : undefined}
            sx={{
              bgcolor: "#1a1714",
              color: "#fdfbf8",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "0.75rem",
              "&:hover": { bgcolor: "#7a5c10" },
              "&.Mui-disabled": { opacity: 0.5 },
            }}
          >
            Save Sale
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
