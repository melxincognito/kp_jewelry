"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

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

interface ProductFormProps {
  defaultValues?: {
    id?: string;
    name?: string;
    description?: string;
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
    status?: string;
  };
  mode: "create" | "edit";
}

export function ProductForm({ defaultValues, mode }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [jewelryType, setJewelryType] = useState(defaultValues?.jewelryType ?? "NECKLACE");
  const [selectedStyles, setSelectedStyles] = useState<string[]>(defaultValues?.styles ?? []);
  const [customStyle, setCustomStyle] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    defaultValues?.purchaseDate
      ? defaultValues.purchaseDate.split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [costMXN, setCostMXN] = useState(String(defaultValues?.costMXN ?? ""));
  const [costUSD, setCostUSD] = useState(String(defaultValues?.costUSD ?? ""));
  const [exchangeRate, setExchangeRate] = useState(String(defaultValues?.exchangeRate ?? ""));
  const [shippingFees, setShippingFees] = useState(String(defaultValues?.shippingFees ?? "0"));
  const [wholesalePrice, setWholesalePrice] = useState(String(defaultValues?.wholesalePrice ?? ""));
  const [sellingPrice, setSellingPrice] = useState(String(defaultValues?.sellingPrice ?? ""));
  const [quantity, setQuantity] = useState(String(defaultValues?.quantity ?? "1"));
  const [status, setStatus] = useState(defaultValues?.status ?? "AVAILABLE");

  // Images
  const [existingImages, setExistingImages] = useState<string[]>(defaultValues?.images ?? []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [fetchingRate, setFetchingRate] = useState(false);

  // Fetch historical exchange rate
  const fetchRate = useCallback(async () => {
    if (!purchaseDate) return;
    setFetchingRate(true);
    try {
      const res = await fetch(`/api/exchange-rate?date=${purchaseDate}`);
      const data = await res.json();
      if (data.mxnPerUsd) {
        setExchangeRate(data.mxnPerUsd.toFixed(4));
        if (costMXN) {
          const usd = parseFloat(costMXN) / data.mxnPerUsd;
          setCostUSD(usd.toFixed(2));
        }
      }
    } catch {
      setError("Could not fetch exchange rate. Enter manually.");
    } finally {
      setFetchingRate(false);
    }
  }, [purchaseDate, costMXN]);

  // Recalculate USD when MXN or rate changes
  const recalcUSD = (mxn: string, rate: string) => {
    const mxnVal = parseFloat(mxn);
    const rateVal = parseFloat(rate);
    if (mxnVal > 0 && rateVal > 0) {
      setCostUSD((mxnVal / rateVal).toFixed(2));
    }
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const addCustomStyle = () => {
    const trimmed = customStyle.trim();
    if (trimmed && !selectedStyles.includes(trimmed)) {
      setSelectedStyles((prev) => [...prev, trimmed]);
    }
    setCustomStyle("");
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setNewImageFiles((prev) => [...prev, ...files]);
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Upload new images first
      const uploadedUrls: string[] = [];
      for (const file of newImageFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Image upload failed");
        const { url } = await res.json();
        uploadedUrls.push(url);
      }

      const allImages = [...existingImages, ...uploadedUrls];

      const payload = {
        name,
        description,
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
        quantity: parseInt(quantity, 10),
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-sm text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm p-5 flex flex-col gap-4">
        <p className="text-xs tracking-[0.25em] text-[var(--gold)] uppercase">Basic Info</p>
        <Input label="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Textarea label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Jewelry Type"
            options={JEWELRY_TYPE_OPTIONS}
            value={jewelryType}
            onChange={(e) => setJewelryType(e.target.value)}
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        {mode === "edit" && (
          <Select
            label="Status"
            options={[
              { value: "AVAILABLE", label: "Available" },
              { value: "RESERVED", label: "Reserved" },
              { value: "SOLD", label: "Sold" },
            ]}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        )}
      </section>

      {/* Styles */}
      <section className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm p-5 flex flex-col gap-4">
        <p className="text-xs tracking-[0.25em] text-[var(--gold)] uppercase">Style Tags</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              className={[
                "px-3 py-1.5 text-xs rounded-sm border transition-colors",
                selectedStyles.includes(style)
                  ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                  : "border-[var(--black-border)] text-[var(--white-dim)] hover:border-[var(--gold)]/40",
              ].join(" ")}
            >
              {style}
            </button>
          ))}
        </div>
        {selectedStyles.filter((s) => !COMMON_STYLES.includes(s)).map((s) => (
          <span key={s} className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)] rounded-sm">
            {s}
            <button type="button" onClick={() => toggleStyle(s)} className="hover:text-white">×</button>
          </span>
        ))}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom style..."
            value={customStyle}
            onChange={(e) => setCustomStyle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomStyle(); } }}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addCustomStyle}>
            Add
          </Button>
        </div>
      </section>

      {/* Cost Tracking */}
      <section className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm p-5 flex flex-col gap-4">
        <p className="text-xs tracking-[0.25em] text-[var(--gold)] uppercase">Cost Tracking</p>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Purchase Date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--white-dim)] tracking-wide">
              Exchange Rate (MXN per $1 USD)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. 17.25"
                value={exchangeRate}
                onChange={(e) => {
                  setExchangeRate(e.target.value);
                  recalcUSD(costMXN, e.target.value);
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={fetchRate}
                loading={fetchingRate}
                title="Fetch historical rate for this date"
              >
                Fetch
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cost (Mexican Pesos $MXN)"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 350.00"
            value={costMXN}
            onChange={(e) => {
              setCostMXN(e.target.value);
              recalcUSD(e.target.value, exchangeRate);
            }}
            required
          />
          <Input
            label="Cost in USD (auto-calculated)"
            type="number"
            step="0.01"
            min="0"
            value={costUSD}
            onChange={(e) => setCostUSD(e.target.value)}
            hint="Editable — override if needed"
            required
          />
        </div>

        <Input
          label="Shipping & Import Fees (USD)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={shippingFees}
          onChange={(e) => setShippingFees(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Wholesale / Floor Price (USD)"
            type="number"
            step="0.01"
            min="0"
            placeholder="Your break-even price"
            value={wholesalePrice}
            onChange={(e) => setWholesalePrice(e.target.value)}
            required
          />
          <Input
            label="Selling Price (USD)"
            type="number"
            step="0.01"
            min="0"
            placeholder="Listed price for customers"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            required
          />
        </div>

        {/* Cost summary */}
        {costUSD && wholesalePrice && sellingPrice && (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[var(--black-border)]">
            <div className="text-center">
              <p className="text-[10px] text-[var(--white-dim)]/40 uppercase tracking-widest">Total Cost</p>
              <p className="text-sm font-medium text-[var(--white)]">
                ${(parseFloat(costUSD) + parseFloat(shippingFees || "0")).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[var(--white-dim)]/40 uppercase tracking-widest">Margin</p>
              <p className={`text-sm font-medium ${
                parseFloat(sellingPrice) - parseFloat(wholesalePrice) >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}>
                ${(parseFloat(sellingPrice) - parseFloat(wholesalePrice)).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[var(--white-dim)]/40 uppercase tracking-widest">Markup</p>
              <p className="text-sm font-medium text-[var(--white)]">
                {wholesalePrice && parseFloat(wholesalePrice) > 0
                  ? `${(((parseFloat(sellingPrice) - parseFloat(wholesalePrice)) / parseFloat(wholesalePrice)) * 100).toFixed(0)}%`
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Images */}
      <section className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm p-5 flex flex-col gap-4">
        <p className="text-xs tracking-[0.25em] text-[var(--gold)] uppercase">Photos</p>

        <div className="flex flex-wrap gap-3">
          {existingImages.map((url) => (
            <div key={url} className="relative group w-20 h-20">
              <Image src={url} alt="Product" fill className="object-cover rounded-sm" sizes="80px" />
              <button
                type="button"
                onClick={() => removeExistingImage(url)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 text-white text-xs rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          {newImageFiles.map((file, i) => (
            <div key={i} className="relative group w-20 h-20 bg-[var(--black-soft)] rounded-sm overflow-hidden">
              <Image
                src={URL.createObjectURL(file)}
                alt="New"
                fill
                className="object-cover"
                sizes="80px"
              />
              <button
                type="button"
                onClick={() => removeNewImage(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 text-white text-xs rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <span className="px-4 py-2 text-xs border border-dashed border-[var(--black-border)] rounded-sm text-[var(--white-dim)] hover:border-[var(--gold)]/40 transition-colors">
            + Add Photos
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleImagePick}
          />
        </label>
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          {mode === "edit" ? "Save Changes" : "Add to Inventory"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/dashboard/inventory")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
