import { db } from "@/lib/db";
import { StatCard } from "@/components/ui/StatCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

async function getAnalytics() {
  const [
    totalProducts,
    availableProducts,
    soldProducts,
    totalSales,
    recentSales,
    unreadMessages,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { status: "AVAILABLE" } }),
    db.product.count({ where: { status: "SOLD" } }),
    db.sale.aggregate({ _sum: { salePrice: true }, _count: true }),
    db.sale.findMany({
      orderBy: { soldAt: "desc" },
      take: 5,
      include: {
        product: true,
        buyer: { select: { name: true, email: true } },
      },
    }),
    db.message.count({ where: { read: false } }),
  ]);

  // Revenue this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthRevenue = await db.sale.aggregate({
    _sum: { salePrice: true },
    where: { soldAt: { gte: startOfMonth } },
  });

  return {
    totalProducts,
    availableProducts,
    soldProducts,
    totalRevenue: totalSales._sum.salePrice ?? 0,
    totalSalesCount: totalSales._count,
    monthRevenue: monthRevenue._sum.salePrice ?? 0,
    recentSales,
    unreadMessages,
  };
}

export default async function DashboardOverviewPage() {
  const data = await getAnalytics();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-light tracking-wide text-[var(--white)]">
          Overview
        </h1>
        <p className="text-xs text-[var(--white-dim)]/40 mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${data.totalRevenue.toFixed(2)}`}
          subtitle="All time"
          icon={<span>$</span>}
        />
        <StatCard
          title="This Month"
          value={`$${data.monthRevenue.toFixed(2)}`}
          subtitle={new Date().toLocaleString("en-US", { month: "long" })}
          icon={<span>📅</span>}
        />
        <StatCard
          title="Items Sold"
          value={data.soldProducts}
          subtitle={`${data.totalSalesCount} transactions`}
          icon={<span>✓</span>}
        />
        <StatCard
          title="Available"
          value={data.availableProducts}
          subtitle={`of ${data.totalProducts} total items`}
          icon={<span>◈</span>}
        />
      </div>

      {/* Alerts row */}
      {data.unreadMessages > 0 && (
        <Link
          href="/dashboard/messages"
          className="flex items-center gap-3 px-4 py-3 bg-[var(--gold)]/8 border border-[var(--gold)]/20 rounded-sm hover:bg-[var(--gold)]/12 transition-colors"
        >
          <span className="text-[var(--gold)] text-sm">◇</span>
          <p className="text-sm text-[var(--white-dim)]">
            You have{" "}
            <span className="text-[var(--gold)] font-medium">
              {data.unreadMessages}
            </span>{" "}
            unread message{data.unreadMessages !== 1 ? "s" : ""}
          </p>
          <span className="ml-auto text-xs text-[var(--gold)]">View →</span>
        </Link>
      )}

      {/* Recent Sales */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs tracking-[0.25em] text-[var(--gold)] uppercase">
            Recent Sales
          </h2>
          <Link
            href="/dashboard/sales"
            className="text-xs text-[var(--white-dim)]/50 hover:text-[var(--gold)] transition-colors"
          >
            View all →
          </Link>
        </div>

        {data.recentSales.length === 0 ? (
          <p className="text-sm text-[var(--white-dim)]/40 py-6 text-center">
            No sales yet
          </p>
        ) : (
          <div className="bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--black-border)]">
                  <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">
                    Item
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">
                    Buyer
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">
                    Price
                  </th>
                  <th className="text-right px-4 py-3 text-xs text-[var(--white-dim)]/50 font-normal tracking-widest uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-[var(--black-border)]/50 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-[var(--white)]">
                      {sale.product.name}
                    </td>
                    <td className="px-4 py-3 text-[var(--white-dim)]">
                      {sale.buyer?.name ?? sale.buyer?.email ?? (
                        <span className="text-[var(--white-dim)]/30 italic">
                          In-person
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--gold)] font-medium">
                      ${sale.salePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--white-dim)]/50 text-xs">
                      {new Date(sale.soldAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            href: "/dashboard/inventory/new",
            label: "Add New Item",
            icon: "+",
          },
          {
            href: "/dashboard/inventory",
            label: "Manage Inventory",
            icon: "◻",
          },
          { href: "/dashboard/sales", label: "Record a Sale", icon: "◆" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-4 py-4 bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm hover:border-[var(--gold)]/30 transition-colors group"
          >
            <span className="text-[var(--gold)] text-lg font-light">
              {link.icon}
            </span>
            <span className="text-sm text-[var(--white-dim)] group-hover:text-[var(--white)] transition-colors">
              {link.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
