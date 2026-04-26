import { db } from "@/lib/db";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiButton from "@mui/material/Button";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { BulkImportButton } from "@/components/dashboard/BulkImportButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" } });

  const totalValue = products
    .filter((p) => p.status !== "SOLD")
    .reduce((sum, p) => sum + p.sellingPrice * p.quantity, 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: "0.05em", color: "text.primary" }}>
            Inventory
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4, mt: 0.5, display: "block" }}>
            {products.length} items · ${totalValue.toFixed(2)} listed value
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BulkImportButton />
          <MuiButton
            href="/dashboard/inventory/new"
            variant="contained"
            size="small"
            sx={{ bgcolor: "#1a1714", color: "#fdfbf8", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem", "&:hover": { bgcolor: "#7a5c10" } }}
          >
            + Add Item
          </MuiButton>
        </Box>
      </Box>

      {products.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 12, gap: 2, textAlign: "center" }}>
          <Typography sx={{ fontSize: "2.5rem", opacity: 0.1 }} aria-hidden="true">💎</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>No items yet</Typography>
          <MuiButton
            href="/dashboard/inventory/new"
            variant="outlined"
            size="small"
            sx={{ borderColor: "#1a1714", color: "#1a1714", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.7rem", "&:hover": { bgcolor: "#7a5c10", borderColor: "#7a5c10", color: "#fdfbf8" } }}
          >
            Add your first item
          </MuiButton>
        </Box>
      ) : (
        <InventoryTable products={products} />
      )}
    </Box>
  );
}
