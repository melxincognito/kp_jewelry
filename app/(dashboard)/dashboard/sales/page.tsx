import { db } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { RecordSaleButton } from "@/components/dashboard/RecordSaleButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sales" };

export default async function SalesPage() {
  const [sales, availableProducts] = await Promise.all([
    db.sale.findMany({
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-light tracking-wide text-[var(--white)]">Sales</h1>
          <p className="text-xs text-[var(--white-dim)]/40 mt-1">
            {sales.length} sales · ${totalRevenue.toFixed(2)} revenue · ${totalProfit.toFixed(2)} profit
          </p>
        </div>
        <RecordSaleButton availableProducts={availableProducts} />
      </div>

      {sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-4xl opacity-10">◆</p>
          <p className="text-[var(--white-dim)]">No sales recorded yet</p>
          <p className="text-xs text-[var(--white-dim)]/40">
            Use the &quot;Record Sale&quot; button when you close a deal
          </p>
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
