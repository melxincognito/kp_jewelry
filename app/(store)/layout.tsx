import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import Box from "@mui/material/Box";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id;

  const unreadCount = userId
    ? await db.message.count({ where: { recipientId: userId, read: false } })
    : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar session={session} unreadCount={unreadCount} />
      <Box component="main" sx={{ flex: 1 }}>{children}</Box>
      <Footer />
    </Box>
  );
}
