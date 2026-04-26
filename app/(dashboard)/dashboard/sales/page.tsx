import { db } from "@/lib/db";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableFooter from "@mui/material/TableFooter";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { RecordSaleButton } from "@/components/dashboard/RecordSaleButton";
import { SalesFilters } from "@/components/dashboard/SalesFilters";
import { SalesExport } from "@/components/dashboard/SalesExport";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sales" };

function getDateRange(
  preset: string | undefined,
  from: string | undefined,
  to: string | undefined
): { gte?: Date; lte?: Date } | undefined {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  const startOf = (d: Date) => { d.setHours(0, 0, 0, 0); return d; };
  const endOf = (d: Date) => { d.setHours(23, 59, 59, 999); return d; };

  switch (preset) {
    case "today":
      return { gte: startOf(new Date()), lte: endOf(new Date()) };
    case "this_week": {
      const day = now.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const mon = new Date(now);
      mon.setDate(now.getDate() + diff);
      return { gte: startOf(mon), lte: endOf(new Date()) };
    }
    case "this_month":
      return { gte: new Date(y, m, 1), lte: endOf(new Date()) };
    case "last_month": {
      return { gte: startOf(new Date(y, m - 1, 1)), lte: endOf(new Date(y, m, 0)) };
    }
    case "this_quarter": {
      const q = Math.floor(m / 3);
      return { gte: new Date(y, q * 3, 1), lte: endOf(new Date()) };
    }
    case "last_quarter": {
      const q = Math.floor(m / 3);
      const prevQ = q === 0 ? 3 : q - 1;
      const prevY = q === 0 ? y - 1 : y;
      return { gte: startOf(new Date(prevY, prevQ * 3, 1)), lte: endOf(new Date(prevY, prevQ * 3 + 3, 0)) };
    }
    case "this_year":
      return { gte: new Date(y, 0, 1), lte: endOf(new Date()) };
    case "last_year": {
      return { gte: startOf(new Date(y - 1, 0, 1)), lte: endOf(new Date(y - 1, 11, 31)) };
    }
    case "custom": {
      const range: { gte?: Date; lte?: Date } = {};
      if (from) range.gte = startOf(new Date(from));
      if (to) range.lte = endOf(new Date(to));
      return Object.keys(range).length ? range : undefined;
    }
    default:
      return undefined;
  }
}

function formatPresetLabel(preset: string | undefined, from: string | undefined, to: string | undefined) {
  if (!preset || preset === "all") return null;
  const labels: Record<string, string> = {
    today: "Today", this_week: "This Week", this_month: "This Month", last_month: "Last Month",
    this_quarter: "This Quarter", last_quarter: "Last Quarter", this_year: "This Year", last_year: "Last Year",
  };
  if (preset === "custom") {
    const parts = [from && `from ${from}`, to && `to ${to}`].filter(Boolean);
    return parts.length ? parts.join(" ") : "Custom Range";
  }
  return labels[preset] ?? null;
}

export default async function SalesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const { preset, from, to } = params;

  const dateRange = getDateRange(preset, from, to);
  const soldAtFilter = dateRange ? { soldAt: dateRange } : {};

  const [sales, availableProducts] = await Promise.all([
    db.sale.findMany({
      where: soldAtFilter,
      orderBy: { soldAt: "desc" },
      include: {
        product: { select: { name: true, sellingPrice: true, wholesalePrice: true } },
        buyer: { select: { name: true, email: true } },
      },
    }),
    db.product.findMany({
      where: { status: { not: "SOLD" } },
      select: { id: true, name: true, sellingPrice: true, quantity: true, sizes: { select: { size: true, quantity: true }, orderBy: { size: "asc" } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.salePrice, 0);
  const totalProfit = sales.reduce((sum, s) => sum + (s.salePrice - s.product.wholesalePrice), 0);
  const activeLabel = formatPresetLabel(preset, from, to);

  const exportRows = sales.map((s) => ({
    item: s.product.name,
    buyer: s.buyer?.name ?? s.buyer?.email ?? "In-person",
    salePrice: s.salePrice,
    profit: s.salePrice - s.product.wholesalePrice,
    date: new Date(s.soldAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    notes: s.notes ?? "",
  }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: "0.05em", color: "text.primary" }}>
            Sales
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4, mt: 0.5, display: "block" }}>
            {sales.length} sales · ${totalRevenue.toFixed(2)} revenue · ${totalProfit.toFixed(2)} profit
            {activeLabel && (
              <Box component="span" sx={{ color: "primary.main", ml: 0.5 }}>· {activeLabel}</Box>
            )}
          </Typography>
        </Box>
        <RecordSaleButton availableProducts={availableProducts} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5 }}>
        <SalesFilters />
        <SalesExport rows={exportRows} totalRevenue={totalRevenue} totalProfit={totalProfit} label={activeLabel ?? "All Time"} />
      </Box>

      {sales.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 12, gap: 1.5, textAlign: "center" }}>
          <Typography sx={{ fontSize: "2.5rem", opacity: 0.1 }} aria-hidden="true">◆</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {activeLabel ? `No sales found for ${activeLabel}` : "No sales recorded yet"}
          </Typography>
          {!activeLabel && (
            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4 }}>
              Use the &quot;Record Sale&quot; button when you close a deal
            </Typography>
          )}
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell align="right">Sale Price</TableCell>
                <TableCell align="right">Profit</TableCell>
                <TableCell align="right">Date</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((sale) => {
                const profit = sale.salePrice - sale.product.wholesalePrice;
                return (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>{sale.product.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {sale.buyer?.name ?? sale.buyer?.email ?? (
                          <Box component="span" sx={{ color: "text.secondary", opacity: 0.3, fontStyle: "italic", fontSize: "0.75rem" }}>In-person</Box>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600 }}>${sale.salePrice.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ fontWeight: 500, color: profit >= 0 ? "#059669" : "#b91c1c" }}>
                        ${profit.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.5 }}>
                        {new Date(sale.soldAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {sale.notes && (
                        <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.3, fontStyle: "italic", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: 96 }}>
                          {sale.notes}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow sx={{ bgcolor: "#ede9e3" }}>
                <TableCell colSpan={2}>
                  <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.5 }}>Total ({sales.length} sales)</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>${totalRevenue.toFixed(2)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "#059669" }}>${totalProfit.toFixed(2)}</Typography>
                </TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
