"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface AvailableProduct {
  id: string;
  name: string;
  sellingPrice: number;
}

export function RecordSaleButton({ availableProducts }: { availableProducts: AvailableProduct[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(availableProducts[0]?.id ?? "");
  const [salePrice, setSalePrice] = useState(
    String(availableProducts[0]?.sellingPrice ?? "")
  );
  const [buyerEmail, setBuyerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [soldAt, setSoldAt] = useState(new Date().toISOString().split("T")[0]);

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const product = availableProducts.find((p) => p.id === id);
    if (product) setSalePrice(String(product.sellingPrice));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
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
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} disabled={availableProducts.length === 0}>
        Record Sale
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="Record a Sale" maxWidth="sm">
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-sm text-xs text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Item Sold"
            options={availableProducts.map((p) => ({
              value: p.id,
              label: `${p.name} ($${p.sellingPrice})`,
            }))}
            value={selectedProductId}
            onChange={(e) => handleProductChange(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Sale Price (USD)"
              type="number"
              step="0.01"
              min="0"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              required
            />
            <Input
              label="Date Sold"
              type="date"
              value={soldAt}
              onChange={(e) => setSoldAt(e.target.value)}
              required
            />
          </div>
          <Input
            label="Buyer Email (optional)"
            type="email"
            placeholder="Leave blank for in-person sales"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="Any notes about this sale..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading}>Save Sale</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
