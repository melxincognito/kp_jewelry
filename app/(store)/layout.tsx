import { auth } from "@/lib/auth";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar session={session} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
