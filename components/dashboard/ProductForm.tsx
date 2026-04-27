"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import MuiButton from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";

const JEWELRY_TYPE_OPTIONS = [
  { value: "NECKLACE", label: "Necklace" },
  { value: "BRACELET", label: "Bracelet" },
  { value: "RING", label: "Ring" },
  { value: "EARRING", label: "Earring" },
  { value: "CHARM", label: "Charm" },
  { value: "NOSE_RING", label: "Nose Ring" },
  { value: "CLIP", label: "Clip" },
  { value: "OTHER", label: "Other" },
];

const MATERIAL_OPTIONS = [
  { value: "", label: "— None —" },
  { value: "Gold", label: "Gold" },
  { value: "White Gold", label: "White Gold" },
  { value: "Rose Gold", label: "Rose Gold" },
  { value: "Silver", label: "Silver" },
  { value: "Sterling Silver", label: "Sterling Silver" },
  { value: "Stainless Steel", label: "Stainless Steel" },
  { value: "Plated", label: "Plated" },
  { value: "Other", label: "Other" },
];

const COMMON_STYLES = [
  "Cubano",
  "Torso",
  "Cartier",
  "Franco",
  "Figaro",
  "Rope",
  "Box",
  "Snake",
  "Tennis",
  "Herringbone",
];

function fmt2(v: number | undefined, fallback = "") {
  return v !== undefined ? v.toFixed(2) : fallback;
}

interface SizeRow {
  size: string;
  quantity: string;
}

interface ProductFormProps {
  defaultValues?: {
    id?: string;
    name?: string;
    sku?: string;
    description?: string;
    material?: string;
    images?: string[];
    costMXN?: number;
    costUSD?: number;
    exchangeRate?: number;
    purchaseDate?: string;
    shippingFees?: number;
    wholesalePrice?: number;
    sellingPrice?: number;
    jewelryType?: string;
    styles?: string[];
    quantity?: number;
    sizes?: { size: string; quantity: number }[];
    status?: string;
    showOnStorefront?: boolean;
  };
  mode: "create" | "edit";
}

const fieldSx = {
  "& .MuiOutlinedInput-input": { padding: "10px 12px", fontSize: "0.875rem" },
};

const sectionLabelSx = {
  fontSize: "0.625rem",
  letterSpacing: "0.25em",
  color: "primary.main",
  textTransform: "uppercase" as const,
  fontWeight: 500,
  mb: 2,
};

export function ProductForm({ defaultValues, mode }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(defaultValues?.name ?? "");
  const [sku, setSku] = useState(defaultValues?.sku ?? "");
  const [description, setDescription] = useState(
    defaultValues?.description ?? "",
  );
  const [material, setMaterial] = useState(defaultValues?.material ?? "");
  const [jewelryType, setJewelryType] = useState(
    defaultValues?.jewelryType ?? "NECKLACE",
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>(
    defaultValues?.styles ?? [],
  );
  const [customStyle, setCustomStyle] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    defaultValues?.purchaseDate
      ? defaultValues.purchaseDate.split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [costMXN, setCostMXN] = useState(fmt2(defaultValues?.costMXN));
  const [costUSD, setCostUSD] = useState(fmt2(defaultValues?.costUSD));
  const [exchangeRate, setExchangeRate] = useState(
    String(defaultValues?.exchangeRate ?? ""),
  );
  const [shippingFees, setShippingFees] = useState(
    fmt2(defaultValues?.shippingFees, "0"),
  );
  const [wholesalePrice, setWholesalePrice] = useState(
    fmt2(defaultValues?.wholesalePrice),
  );
  const [sellingPrice, setSellingPrice] = useState(
    fmt2(defaultValues?.sellingPrice),
  );
  const [quantity, setQuantity] = useState(
    String(defaultValues?.quantity ?? "1"),
  );
  const [status, setStatus] = useState(defaultValues?.status ?? "AVAILABLE");
  const [showOnStorefront, setShowOnStorefront] = useState(
    defaultValues?.showOnStorefront ?? true,
  );
  const [sizes, setSizes] = useState<SizeRow[]>(
    (defaultValues?.sizes ?? []).map((s) => ({
      size: s.size,
      quantity: String(s.quantity),
    })),
  );
  const [existingImages, setExistingImages] = useState<string[]>(
    defaultValues?.images ?? [],
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [fetchingRate, setFetchingRate] = useState(false);

  const hasSizes = sizes.length > 0;
  const derivedQuantity = sizes.reduce(
    (sum, s) => sum + (parseInt(s.quantity) || 0),
    0,
  );

  async function fetchRate() {
    if (!purchaseDate) return;
    setFetchingRate(true);
    try {
      const res = await fetch(`/api/exchange-rate?date=${purchaseDate}`);
      const data = await res.json();
      if (data.mxnPerUsd) {
        setExchangeRate(data.mxnPerUsd.toFixed(4));
        if (costMXN)
          setCostUSD((parseFloat(costMXN) / data.mxnPerUsd).toFixed(2));
      }
    } catch {
      setError("Could not fetch exchange rate. Enter manually.");
    } finally {
      setFetchingRate(false);
    }
  }

  const roundMoney = (val: string, setter: (v: string) => void) => {
    const n = parseFloat(val);
    if (!isNaN(n)) setter(n.toFixed(2));
  };

  const recalcUSD = (mxn: string, rate: string) => {
    const mxnVal = parseFloat(mxn);
    const rateVal = parseFloat(rate);
    if (mxnVal > 0 && rateVal > 0) setCostUSD((mxnVal / rateVal).toFixed(2));
  };

  const toggleStyle = (style: string) =>
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );

  const addCustomStyle = () => {
    const trimmed = customStyle.trim();
    if (trimmed && !selectedStyles.includes(trimmed))
      setSelectedStyles((prev) => [...prev, trimmed]);
    setCustomStyle("");
  };

  const addSizeRow = () =>
    setSizes((prev) => [...prev, { size: "", quantity: "1" }]);
  const removeSizeRow = (i: number) =>
    setSizes((prev) => prev.filter((_, idx) => idx !== i));
  const updateSizeRow = (i: number, field: keyof SizeRow, value: string) =>
    setSizes((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
    );

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewImageFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])]);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of newImageFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Image upload failed");
        const { url } = await res.json();
        uploadedUrls.push(url);
      }
      const allImages = [...existingImages, ...uploadedUrls];
      const parsedSizes = sizes.map((s) => ({
        size: s.size.trim(),
        quantity: parseInt(s.quantity) || 0,
      }));
      const sizeLabels = parsedSizes.map((s) => s.size);
      if (
        parsedSizes.length > 0 &&
        new Set(sizeLabels).size !== sizeLabels.length
      )
        throw new Error("Each size must have a unique label");
      if (parsedSizes.some((s) => !s.size))
        throw new Error("All size rows must have a label");
      const finalQuantity = hasSizes ? derivedQuantity : parseInt(quantity, 10);
      const payload = {
        name,
        sku: sku.trim() || undefined,
        description,
        material: material || undefined,
        showOnStorefront,
        images: allImages,
        costMXN: parseFloat(costMXN),
        costUSD: parseFloat(costUSD),
        exchangeRate: parseFloat(exchangeRate),
        purchaseDate,
        shippingFees: parseFloat(shippingFees) || 0,
        wholesalePrice: parseFloat(wholesalePrice),
        sellingPrice: parseFloat(sellingPrice),
        jewelryType,
        styles: selectedStyles,
        quantity: finalQuantity,
        sizes: parsedSizes,
        status,
      };
      const url =
        mode === "edit" && defaultValues?.id
          ? `/api/products/${defaultValues.id}`
          : "/api/products";
      const method = mode === "edit" ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      router.push("/dashboard/inventory");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
      {error && <Alert severity="error">{error}</Alert>}

      {/* Basic Info */}
      <Paper sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={sectionLabelSx}>Basic Info</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            size="small"
            sx={fieldSx}
          />
          <TextField
            label="SKU (optional)"
            placeholder="e.g. NKL-001"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            fullWidth
            size="small"
            sx={fieldSx}
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            select
            label="Jewelry Type"
            value={jewelryType}
            onChange={(e) => setJewelryType(e.target.value)}
            fullWidth
            size="small"
            sx={fieldSx}
          >
            {JEWELRY_TYPE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Material (optional)"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            fullWidth
            size="small"
            sx={fieldSx}
          >
            {MATERIAL_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={3}
          size="small"
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            alignItems: "flex-end",
          }}
        >
          {hasSizes ? (
            <Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500, mb: 0.75 }}
              >
                Total Quantity
              </Typography>
              <Box
                sx={{
                  px: 1.5,
                  py: 1.25,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "#ede9e3",
                  fontSize: "0.875rem",
                  color: "text.primary",
                }}
              >
                {derivedQuantity}{" "}
                <Box
                  component="span"
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    opacity: 0.4,
                  }}
                >
                  (sum of sizes)
                </Box>
              </Box>
            </Box>
          ) : (
            <TextField
              label="Quantity"
              type="number"
              slotProps={{ htmlInput: { min: 1 } }}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              fullWidth
              size="small"
              sx={fieldSx}
            />
          )}
          {mode === "edit" && (
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
              size="small"
              sx={fieldSx}
            >
              {[
                { value: "AVAILABLE", label: "Available" },
                { value: "RESERVED", label: "Reserved" },
                { value: "SOLD", label: "Sold" },
              ].map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>

        {/* Sizes */}
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 0.5 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", opacity: 0.5 }}
            >
              {hasSizes
                ? "Size breakdown — deductions will track per size"
                : "This item has no sizes (e.g. necklace, nose ring)"}
            </Typography>
            {hasSizes ? (
              <MuiButton
                variant="text"
                size="small"
                onClick={() => setSizes([])}
                sx={{
                  fontSize: "0.75rem",
                  textTransform: "none",
                  letterSpacing: "normal",
                  color: "error.main",
                  opacity: 0.6,
                  p: 0,
                  minWidth: 0,
                }}
              >
                Remove sizing ×
              </MuiButton>
            ) : (
              <MuiButton
                variant="text"
                size="small"
                onClick={addSizeRow}
                sx={{
                  fontSize: "0.75rem",
                  textTransform: "none",
                  letterSpacing: "normal",
                  color: "primary.main",
                  opacity: 0.7,
                  p: 0,
                  minWidth: 0,
                }}
              >
                + Add sizing
              </MuiButton>
            )}
          </Box>
          {hasSizes && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 100px 32px",
                  gap: 1,
                  px: 0.5,
                }}
              >
                {["Size", "Qty", ""].map((h, i) => (
                  <Typography
                    key={i}
                    variant="caption"
                    sx={{
                      fontSize: "0.625rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: "text.secondary",
                      opacity: 0.4,
                    }}
                  >
                    {h}
                  </Typography>
                ))}
              </Box>
              {sizes.map((row, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 100px 32px",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <TextField
                    placeholder='e.g. "6" or "M"'
                    value={row.size}
                    onChange={(e) => updateSizeRow(i, "size", e.target.value)}
                    size="small"
                    fullWidth
                    sx={fieldSx}
                    aria-label={`Size label for row ${i + 1}`}
                  />
                  <TextField
                    type="number"
                    slotProps={{ htmlInput: { min: 0 } }}
                    value={row.quantity}
                    onChange={(e) =>
                      updateSizeRow(i, "quantity", e.target.value)
                    }
                    size="small"
                    sx={fieldSx}
                    aria-label={`Quantity for size ${row.size || i + 1}`}
                  />
                  <MuiButton
                    onClick={() => removeSizeRow(i)}
                    aria-label={`Remove size row ${i + 1}`}
                    sx={{
                      minWidth: 32,
                      width: 32,
                      height: 36,
                      p: 0,
                      color: "text.secondary",
                      opacity: 0.3,
                      "&:hover": {
                        color: "error.main",
                        opacity: 1,
                        bgcolor: "rgba(185,28,28,0.08)",
                      },
                    }}
                  >
                    ×
                  </MuiButton>
                </Box>
              ))}
              <MuiButton
                variant="text"
                size="small"
                onClick={addSizeRow}
                sx={{
                  alignSelf: "flex-start",
                  fontSize: "0.75rem",
                  textTransform: "none",
                  letterSpacing: "normal",
                  color: "primary.main",
                  opacity: 0.7,
                  p: 0,
                  minWidth: 0,
                  mt: 0.5,
                }}
              >
                + Add another size
              </MuiButton>
            </Box>
          )}
        </Box>

        {/* Storefront toggle */}
        <Divider sx={{ borderColor: "divider", my: 0.5 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              Show on storefront
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", opacity: 0.4 }}
            >
              When off, this item is only visible to you in the dashboard.
            </Typography>
          </Box>
          <Switch
            checked={showOnStorefront}
            onChange={(e) => setShowOnStorefront(e.target.checked)}
            slotProps={{ input: { "aria-label": "Show on storefront" } }}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: "#7a5c10" },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                bgcolor: "#7a5c10",
              },
            }}
          />
        </Box>
      </Paper>

      {/* Style Tags */}
      <Paper sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={sectionLabelSx}>Style Tags</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {COMMON_STYLES.map((style) => {
            const active = selectedStyles.includes(style);
            return (
              <Chip
                key={style}
                label={style}
                onClick={() => toggleStyle(style)}
                variant={active ? "filled" : "outlined"}
                sx={{
                  cursor: "pointer",
                  borderColor: active ? "primary.main" : "divider",
                  bgcolor: active ? "rgba(122,92,16,0.08)" : "transparent",
                  color: active ? "primary.main" : "text.secondary",
                  "&:hover": {
                    bgcolor: active
                      ? "rgba(122,92,16,0.12)"
                      : "rgba(122,92,16,0.05)",
                    borderColor: "rgba(122,92,16,0.4)",
                  },
                }}
              />
            );
          })}
        </Box>
        {selectedStyles
          .filter((s) => !COMMON_STYLES.includes(s))
          .map((s) => (
            <Chip
              key={s}
              label={s}
              onDelete={() => toggleStyle(s)}
              size="small"
              sx={{
                bgcolor: "rgba(122,92,16,0.08)",
                color: "primary.main",
                border: "1px solid",
                borderColor: "primary.main",
              }}
            />
          ))}
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            placeholder="Add custom style..."
            value={customStyle}
            onChange={(e) => setCustomStyle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomStyle();
              }
            }}
            size="small"
            sx={{ flex: 1, ...fieldSx }}
          />
          <MuiButton
            variant="outlined"
            size="small"
            onClick={addCustomStyle}
            sx={{
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "0.7rem",
              borderColor: "#1a1714",
              color: "#1a1714",
              "&:hover": { bgcolor: "#7a5c10", borderColor: "#7a5c10" },
            }}
          >
            Add
          </MuiButton>
        </Box>
      </Paper>

      {/* Cost Tracking */}
      <Paper sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={sectionLabelSx}>Cost Tracking</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Purchase Date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={fieldSx}
          />
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
                mb: 0.75,
                fontSize: "0.875rem",
              }}
            >
              Exchange Rate (MXN per $1 USD)
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                placeholder="e.g. 17.25"
                value={exchangeRate}
                onChange={(e) => {
                  setExchangeRate(e.target.value);
                  recalcUSD(costMXN, e.target.value);
                }}
                size="small"
                sx={{ flex: 1, ...fieldSx }}
              />
              <MuiButton
                variant="outlined"
                size="small"
                onClick={fetchRate}
                disabled={fetchingRate}
                startIcon={
                  fetchingRate ? (
                    <CircularProgress size={12} sx={{ color: "inherit" }} />
                  ) : undefined
                }
                title="Fetch historical rate for this date"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontSize: "0.7rem",
                  borderColor: "#1a1714",
                  color: "#1a1714",
                  "&:hover": { bgcolor: "#7a5c10", borderColor: "#7a5c10" },
                  "&.Mui-disabled": { opacity: 0.5 },
                }}
              >
                Fetch
              </MuiButton>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Cost (Mexican Pesos $MXN)"
            type="number"
            slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
            placeholder="e.g. 350.00"
            value={costMXN}
            onChange={(e) => {
              setCostMXN(e.target.value);
              recalcUSD(e.target.value, exchangeRate);
            }}
            onBlur={() => roundMoney(costMXN, setCostMXN)}
            required
            fullWidth
            size="small"
            sx={fieldSx}
          />
          <TextField
            label="Cost in USD (auto-calculated)"
            type="number"
            slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
            value={costUSD}
            onChange={(e) => setCostUSD(e.target.value)}
            onBlur={() => roundMoney(costUSD, setCostUSD)}
            helperText="Editable — override if needed"
            required
            fullWidth
            size="small"
            sx={fieldSx}
          />
        </Box>

        <TextField
          label="Shipping & Import Fees (USD)"
          type="number"
          slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
          placeholder="0.00"
          value={shippingFees}
          onChange={(e) => setShippingFees(e.target.value)}
          onBlur={() => roundMoney(shippingFees, setShippingFees)}
          fullWidth
          size="small"
          sx={fieldSx}
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Wholesale / Floor Price (USD)"
            type="number"
            slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
            placeholder="Your break-even price"
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            onBlur={() => roundMoney(wholesalePrice, setWholesalePrice)}
            required
            fullWidth
            size="small"
            sx={fieldSx}
          />
          <TextField
            label="Selling Price (USD)"
            type="number"
            slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
            placeholder="Listed price for customers"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            onBlur={() => roundMoney(sellingPrice, setSellingPrice)}
            required
            fullWidth
            size="small"
            sx={fieldSx}
          />
        </Box>

        {costUSD && wholesalePrice && sellingPrice && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 1.5,
              pt: 1.5,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            {[
              {
                label: "Total Cost",
                value: `$${(parseFloat(costUSD) + parseFloat(shippingFees || "0")).toFixed(2)}`,
                color: "text.primary",
              },
              {
                label: "Margin",
                value: `$${(parseFloat(sellingPrice) - parseFloat(wholesalePrice)).toFixed(2)}`,
                color:
                  parseFloat(sellingPrice) - parseFloat(wholesalePrice) >= 0
                    ? "#059669"
                    : "#b91c1c",
              },
              {
                label: "Markup",
                value:
                  wholesalePrice && parseFloat(wholesalePrice) > 0
                    ? `${(((parseFloat(sellingPrice) - parseFloat(wholesalePrice)) / parseFloat(wholesalePrice)) * 100).toFixed(0)}%`
                    : "—",
                color: "text.primary",
              },
            ].map((stat) => (
              <Box key={stat.label} sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontSize: "0.625rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "text.secondary",
                    opacity: 0.4,
                    mb: 0.5,
                  }}
                >
                  {stat.label}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, color: stat.color }}
                >
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Images */}
      <Paper sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={sectionLabelSx}>Photos</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {existingImages.map((url) => (
            <Box
              key={url}
              sx={{
                position: "relative",
                width: 80,
                height: 80,
                "&:hover .remove-btn": { opacity: 1 },
              }}
            >
              <Image
                src={url}
                alt="Product"
                fill
                style={{ objectFit: "cover", borderRadius: 2 }}
                sizes="80px"
              />
              <MuiButton
                onClick={() =>
                  setExistingImages((prev) => prev.filter((u) => u !== url))
                }
                className="remove-btn"
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  minWidth: 20,
                  width: 20,
                  height: 20,
                  p: 0,
                  bgcolor: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  fontSize: "0.75rem",
                  borderRadius: 1,
                  opacity: 0,
                  transition: "opacity 0.15s",
                }}
              >
                ×
              </MuiButton>
            </Box>
          ))}
          {newImageFiles.map((file, i) => (
            <Box
              key={i}
              sx={{
                position: "relative",
                width: 80,
                height: 80,
                bgcolor: "#ede9e3",
                borderRadius: "2px",
                overflow: "hidden",
                "&:hover .remove-btn": { opacity: 1 },
              }}
            >
              <Image
                src={URL.createObjectURL(file)}
                alt="New"
                fill
                style={{ objectFit: "cover" }}
                sizes="80px"
              />
              <MuiButton
                onClick={() =>
                  setNewImageFiles((prev) => prev.filter((_, idx) => idx !== i))
                }
                className="remove-btn"
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  minWidth: 20,
                  width: 20,
                  height: 20,
                  p: 0,
                  bgcolor: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  fontSize: "0.75rem",
                  borderRadius: 1,
                  opacity: 0,
                  transition: "opacity 0.15s",
                }}
              >
                ×
              </MuiButton>
            </Box>
          ))}
        </Box>
        <Box
          component="label"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            width: "fit-content",
          }}
        >
          <Box
            component="span"
            sx={{
              px: 2,
              py: 1,
              fontSize: "0.75rem",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              color: "text.secondary",
              "&:hover": { borderColor: "rgba(122,92,16,0.4)" },
              transition: "border-color 0.15s",
            }}
          >
            + Add Photos
          </Box>
          <input
            type="file"
            accept="image/*"
            multiple
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clip: "rect(0,0,0,0)",
            }}
            onChange={handleImagePick}
          />
        </Box>
      </Paper>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <MuiButton
          type="submit"
          variant="contained"
          disabled={saving}
          startIcon={
            saving ? (
              <CircularProgress size={14} sx={{ color: "inherit" }} />
            ) : undefined
          }
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
          {mode === "edit" ? "Save Changes" : "Add to Inventory"}
        </MuiButton>
        <MuiButton
          type="button"
          variant="text"
          onClick={() => router.push("/dashboard/inventory")}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            letterSpacing: "normal",
            fontSize: "0.875rem",
          }}
        >
          Cancel
        </MuiButton>
      </Box>
    </Box>
  );
}
