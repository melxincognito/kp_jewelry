import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import Box from "@mui/material/Box";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const adminId = session?.user?.id;

  const unreadCount = adminId
    ? await db.message.count({ where: { recipientId: adminId, read: false } })
    : 0;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <DashboardNav unreadCount={unreadCount} />
      <Box component="main" sx={{ flex: 1, bgcolor: "background.default", overflow: "auto" }}>
        <Box sx={{ maxWidth: 1152, mx: "auto", px: 3, py: 4 }}>{children}</Box>
      </Box>
    </Box>
  );
}
