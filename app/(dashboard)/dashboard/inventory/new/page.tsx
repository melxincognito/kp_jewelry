import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ProductForm } from "@/components/dashboard/ProductForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Item" };

export default function NewInventoryItemPage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 672 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: "0.05em", color: "text.primary" }}>
          Add New Item
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4, mt: 0.5, display: "block" }}>
          Fill in the details below. Use the Fetch button to auto-load the exchange rate for your purchase date.
        </Typography>
      </Box>
      <ProductForm mode="create" />
    </Box>
  );
}
