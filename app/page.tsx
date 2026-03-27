import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { ProductCard } from "@/components/store/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KP Jewlrs — Handpicked Jewelry",
};

async function getFeaturedProducts() {
  return db.product.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

export default async function LandingPage() {
  const [session, featured] = await Promise.all([
    auth(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar session={session} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {/* Hero */}
        <section aria-label="Hero" className="relative overflow-hidden bg-[var(--black-soft)] border-b border-[var(--black-border)]">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center flex flex-col items-center gap-8">
            <p className="text-xs tracking-[0.4em] text-[var(--gold)] uppercase font-medium">
              Handpicked from Mexico
            </p>
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight">
              <span className="text-gold-gradient font-semibold">KP JEWLRS</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--white-dim)] max-w-xl leading-relaxed">
              Curated jewelry for every style. Necklaces, bracelets, rings, earrings and more —
              all unisex, all authentic.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/shop"
                className="px-8 py-3 bg-[var(--gold)] text-[var(--black)] text-sm font-semibold rounded-sm hover:bg-[var(--gold-light)] transition-colors"
              >
                Browse Collection
              </Link>
              <Link
                href="/register"
                className="px-8 py-3 border border-[var(--black-border)] text-sm text-[var(--white-dim)] rounded-sm hover:border-[var(--gold)]/50 hover:text-[var(--white)] transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>

        {/* Category Quick Links */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-xs tracking-[0.3em] text-[var(--gold)] uppercase mb-8">
            Shop by Category
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map(({ label, type }) => (
              <Link
                key={type}
                href={`/shop?type=${type}`}
                className="group flex flex-col items-center justify-center gap-2 py-6 bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm hover:border-[var(--gold)]/40 transition-colors"
              >
                <span aria-hidden="true" className="text-2xl">{getCategoryEmoji(type)}</span>
                <span className="text-xs font-medium text-[var(--white-dim)] group-hover:text-[var(--gold)] transition-colors tracking-wide">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <hr className="divider-gold max-w-7xl mx-auto w-full" />

        {/* New Arrivals */}
        {featured.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-xs tracking-[0.3em] text-[var(--gold)] uppercase">
                New Arrivals
              </h2>
              <Link
                href="/shop"
                className="text-xs text-[var(--white-dim)] hover:text-[var(--gold)] transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* About strip */}
        <section className="border-t border-[var(--black-border)] bg-[var(--black-soft)] py-14">
          <div className="max-w-3xl mx-auto px-4 text-center flex flex-col gap-4">
            <p className="text-xs tracking-[0.3em] text-[var(--gold)] uppercase">About Us</p>
            <p className="text-[var(--white-dim)] leading-relaxed text-sm">
              Every piece in our collection is personally sourced from Mexico. We specialize
              in styles like Cubano, Torso, and Cartier chains, as well as charms, rings,
              earrings and more. Interested in a piece? Create an account and send us a
              message to coordinate.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

const CATEGORIES = [
  { label: "Necklaces", type: "NECKLACE" },
  { label: "Bracelets", type: "BRACELET" },
  { label: "Rings", type: "RING" },
  { label: "Earrings", type: "EARRING" },
  { label: "Charms", type: "CHARM" },
  { label: "Nose Rings", type: "NOSE_RING" },
  { label: "Clips", type: "CLIP" },
  { label: "Other", type: "OTHER" },
];

function getCategoryEmoji(type: string): string {
  const map: Record<string, string> = {
    NECKLACE: "📿",
    BRACELET: "💎",
    RING: "💍",
    EARRING: "✨",
    CHARM: "🔮",
    NOSE_RING: "⭐",
    CLIP: "📎",
    OTHER: "🪙",
  };
  return map[type] ?? "💎";
}
