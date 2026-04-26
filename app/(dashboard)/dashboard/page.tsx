import { db } from "@/lib/db";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import { StatCard } from "@/components/ui/StatCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

async function getAnalytics() {
  const [totalProducts, availableProducts, soldProducts, totalSales, recentSales, unreadMessages] = await Promise.all([
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

  const quickLinks = [
    { href: "/dashboard/inventory/new", label: "Add New Item", icon: "+" },
    { href: "/dashboard/inventory", label: "Manage Inventory", icon: "◻" },
    { href: "/dashboard/sales", label: "Record a Sale", icon: "◆" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: "0.05em", color: "text.primary" }}>
          Overview
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4, mt: 0.5, display: "block" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </Typography>
      </Box>

      {/* Stats grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2 }}>
        <StatCard title="Total Revenue" value={`$${data.totalRevenue.toFixed(2)}`} subtitle="All time" icon={<span>$</span>} />
        <StatCard title="This Month" value={`$${data.monthRevenue.toFixed(2)}`} subtitle={new Date().toLocaleString("en-US", { month: "long" })} icon={<span>📅</span>} />
        <StatCard title="Items Sold" value={data.soldProducts} subtitle={`${data.totalSalesCount} transactions`} icon={<span>✓</span>} />
        <StatCard title="Available" value={data.availableProducts} subtitle={`of ${data.totalProducts} total items`} icon={<span>◈</span>} />
      </Box>

      {/* Unread messages alert */}
      {data.unreadMessages > 0 && (
        <MuiLink
          href="/dashboard/messages"
          underline="none"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2,
            py: 1.5,
            bgcolor: "rgba(122,92,16,0.06)",
            border: "1px solid rgba(122,92,16,0.18)",
            borderRadius: 0.5,
            "&:hover": { bgcolor: "rgba(122,92,16,0.1)" },
            transition: "background-color 0.15s",
          }}
        >
          <Typography sx={{ color: "primary.main", fontSize: "0.875rem" }}>◇</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            You have{" "}
            <Box component="span" sx={{ color: "primary.main", fontWeight: 500 }}>
              {data.unreadMessages}
            </Box>{" "}
            unread message{data.unreadMessages !== 1 ? "s" : ""}
          </Typography>
          <Typography variant="caption" sx={{ ml: "auto", color: "primary.main" }}>View →</Typography>
        </MuiLink>
      )}

      {/* Recent Sales */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ fontSize: "0.625rem", letterSpacing: "0.25em", color: "primary.main", textTransform: "uppercase" }}>
            Recent Sales
          </Typography>
          <MuiLink
            href="/dashboard/sales"
            variant="caption"
            sx={{ color: "text.secondary", opacity: 0.5, textDecoration: "none", "&:hover": { color: "primary.main", opacity: 1 } }}
          >
            View all →
          </MuiLink>
        </Box>

        {data.recentSales.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.4, py: 3, textAlign: "center" }}>
            No sales yet
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Buyer</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.primary" }}>{sale.product.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {sale.buyer?.name ?? sale.buyer?.email ?? (
                          <Box component="span" sx={{ color: "text.secondary", opacity: 0.3, fontStyle: "italic", fontSize: "0.75rem" }}>In-person</Box>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 500 }}>${sale.salePrice.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.5 }}>
                        {new Date(sale.soldAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Quick links */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
        {quickLinks.map((link) => (
          <MuiLink
            key={link.href}
            href={link.href}
            underline="none"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 0.5,
              "&:hover": { borderColor: "rgba(122,92,16,0.3)" },
              transition: "border-color 0.15s",
            }}
          >
            <Typography sx={{ color: "primary.main", fontSize: "1.125rem", fontWeight: 300 }}>{link.icon}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}>
              {link.label}
            </Typography>
          </MuiLink>
        ))}
      </Box>
    </Box>
  );
}
