import { db } from "@/lib/db";
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
  const m = now.getMonth(); // 0-indexed

  const startOf = (d: Date) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const endOf = (d: Date) => {
    d.setHours(23, 59, 59, 999);
    return d;
  };

  switch (preset) {
    case "today":
      return { gte: startOf(new Date()), lte: endOf(new Date()) };

    case "this_week": {
      const day = now.getDay(); // 0=Sun
      const diff = day === 0 ? -6 : 1 - day; // shift to Monday
      const mon = new Date(now);
      mon.setDate(now.getDate() + diff);
      return { gte: startOf(mon), lte: endOf(new Date()) };
    }

    case "this_month":
      return { gte: new Date(y, m, 1), lte: endOf(new Date()) };

    case "last_month": {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0); // last day of prev month
      return { gte: startOf(start), lte: endOf(end) };
    }

    case "this_quarter": {
      const q = Math.floor(m / 3);
      return { gte: new Date(y, q * 3, 1), lte: endOf(new Date()) };
    }

    case "last_quarter": {
      const q = Math.floor(m / 3);
      const prevQ = q === 0 ? 3 : q - 1;
      const prevY = q === 0 ? y - 1 : y;
      const start = new Date(prevY, prevQ * 3, 1);
      const end = new Date(prevY, prevQ * 3 + 3, 0);
      return { gte: startOf(start), lte: endOf(end) };
    }

    case "this_year":
      return { gte: new Date(y, 0, 1), lte: endOf(new Date()) };

    case "last_year": {
      const start = new Date(y - 1, 0, 1);
      const end = new Date(y - 1, 11, 31);
      return { gte: startOf(start), lte: endOf(end) };
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
    today: "Today",
    this_week: "This Week",
    this_month: "This Month",
    last_month: "Last Month",
    this_quarter: "This Quarter",
    last_quarter: "Last Quarter",
    this_year: "This Year",
    last_year: "Last Year",
  };
  if (preset === "custom") {
    const parts = [from && `from ${from}`, to && `to ${to}`].filter(Boolean);
    return parts.length ? parts.join(" ") : "Custom Range";
  }
  return labels[preset] ?? null;
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const preset = params.preset;
  const from = params.from;
  const to = params.to;

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
      select: { id: true, name: true, sellingPrice: true, quantity: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalRevenue = sales.reduce((sum, s) => sum + s.salePrice, 0);
  const totalProfit = sales.reduce((sum, s) => {
    const profit = s.salePrice - s.product.wholesalePrice;
    return sum + profit;
  }, 0);

  const activeLabel = formatPresetLabel(preset, from, to);

  const exportRows = sales.map((s) => ({
    item: s.product.name,
    buyer: s.buyer?.name ?? s.buyer?.email ?? "In-person",
    salePrice: s.salePrice,
    profit: s.salePrice - s.product.wholesalePrice,
    date: new Date(s.soldAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    notes: s.notes ?? "",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-light tracking-wide text-[var(--white)]">Sales</h1>
          <p className="text-xs text-[var(--white-dim)]/40 mt-1">
            {sales.length} sales · ${totalRevenue.toFixed(2)} revenue · ${totalProfit.toFixed(2)} profit
            {activeLabel && (
              <span className="ml-1 text-[var(--gold)]">· {activeLabel}</span>
            )}
          </p>
        </div>
        <RecordSaleButton availableProducts={availableProducts} />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <SalesFilters />
        <SalesExport
          rows={exportRows}
          totalRevenue={totalRevenue}
          totalProfit={totalProfit}
          label={activeLabel ?? "All Time"}
        />
      </div>

      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-4xl opacity-10">◆</p>
          <p className="text-[var(--white-dim)]">
            {activeLabel ? `No sales found for ${activeLabel}` : "No sales recorded yet"}
          </p>
          {!activeLabel && (
            <p className="text-xs text-[var(--white-dim)]/40">
              Use the &quot;Record Sale&quot; button when you close a deal
            </p>
          )}
        </div>
      ) : (
        <div className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--black-border)]">
                <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Item</th>
                <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Buyer</th>
                <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Sale Price</th>
                <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Profit</th>
                <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const profit = sale.salePrice - sale.product.wholesalePrice;
                return (
                  <tr
                    key={sale.id}
                    className="border-b border-[var(--black-border)]/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-[var(--white)] font-medium">
                      {sale.product.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--white-dim)]">
                      {sale.buyer?.name ?? sale.buyer?.email ?? (
                        <span className="text-[var(--white-dim)]/30 italic text-xs">In-person</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--gold)] font-semibold">
                      ${sale.salePrice.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right text-xs font-medium ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      ${profit.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[var(--white-dim)]/50">
                      {new Date(sale.soldAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      {sale.notes && (
                        <span className="text-[10px] text-[var(--white-dim)]/30 italic line-clamp-1 max-w-24">
                          {sale.notes}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--black-border)] bg-[var(--black-soft)]">
                <td className="px-4 py-3 text-xs text-[var(--white-dim)]/50" colSpan={2}>
                  Total ({sales.length} sales)
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-[var(--gold)]">
                  ${totalRevenue.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-emerald-400">
                  ${totalProfit.toFixed(2)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
