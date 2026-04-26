import { db } from "@/lib/db";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import { UserRoleToggle } from "@/components/dashboard/UserRoleToggle";
import type { Role } from "@/types/enums";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const users = await db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { purchases: true, sentMessages: true } },
    },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 300, letterSpacing: "0.05em", color: "text.primary" }}>
          Users
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4, mt: 0.5, display: "block" }}>
          {users.length} registered accounts
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Purchases</TableCell>
              <TableCell align="right">Messages</TableCell>
              <TableCell align="right">Joined</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ color: "text.primary" }}>
                    {user.name ?? (
                      <Box component="span" sx={{ color: "text.secondary", opacity: 0.3, fontStyle: "italic", fontSize: "0.75rem" }}>No name</Box>
                    )}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>{user.email}</Typography>
                </TableCell>
                <TableCell>
                  <Box
                    component="span"
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      px: 1,
                      py: 0.25,
                      borderRadius: 0.5,
                      ...(user.role === "ADMIN"
                        ? { bgcolor: "rgba(122,92,16,0.12)", color: "primary.main" }
                        : { bgcolor: "rgba(0,0,0,0.04)", color: "text.secondary" }),
                    }}
                  >
                    {user.role}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>{user._count.purchases}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>{user._count.sentMessages}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.4 }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <UserRoleToggle userId={user.id} currentRole={user.role as Role} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
