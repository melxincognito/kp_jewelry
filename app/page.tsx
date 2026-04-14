import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { ProductCard } from "@/components/store/ProductCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KP Jewelrs — Handpicked Jewelry",
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

  const noUserDetected = session?.user?.id == null;
  const userId = session?.user?.id;

  const unreadCount = userId
    ? await db.message.count({ where: { recipientId: userId, read: false } })
    : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar session={session} unreadCount={unreadCount} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {/* Hero */}
        <section
          aria-labelledby="hero-heading"
          className="bg-[var(--black-soft)] border-b border-[var(--black-border)]"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center flex flex-col items-center gap-6">
            <p
              className="text-[10px] tracking-[0.5em] text-[var(--gold)] uppercase font-medium"
              aria-hidden="true"
            >
              Handpicked from Mexico
            </p>
            <h1
              id="hero-heading"
              className="font-serif text-6xl sm:text-7xl font-light tracking-wide text-[var(--white)]"
            >
              KP <span className="text-gold">Jewelrs</span>
            </h1>
            <p className="text-sm text-[var(--white-dim)] max-w-md leading-loose tracking-wide">
              Curated jewelry for every style. Necklaces, bracelets, rings,
              earrings and more — all unisex, all authentic.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <Link
                href="/shop"
                className="px-10 py-3 bg-[var(--white)] text-[var(--black-card)] text-xs tracking-[0.2em] uppercase font-medium hover:bg-[var(--gold)] hover:text-[var(--black-card)] transition-colors"
              >
                Browse Collection
              </Link>
              {noUserDetected && (
                <Link
                  href="/register"
                  className="text-xs tracking-[0.2em] uppercase text-[var(--white-dim)] border-b border-[var(--black-border)] pb-0.5 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Category Quick Links */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2
            id="category-heading"
            className="text-[10px] tracking-[0.4em] text-[var(--white-dim)] uppercase mb-10"
          >
            Shop by Category
          </h2>

          <ul
            role="list"
            className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--black-border)] list-none p-0 m-0"
          >
            {CATEGORIES.map(({ label, type }) => (
              <li key={type}>
                <Link
                  href={`/shop?type=${type}`}
                  aria-label={`Shop by Category: ${label}`}
                  className="group flex items-center justify-center py-7 bg-[var(--black-card)] hover:bg-[var(--black-soft)] transition-colors"
                >
                  <span
                    aria-hidden="true"
                    className="text-xs tracking-[0.25em] uppercase text-[var(--white-dim)] group-hover:text-[var(--gold)] transition-colors"
                  >
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <hr className="divider-gold max-w-7xl mx-auto w-full" />

        {/* New Arrivals */}
        {featured.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-serif text-2xl font-light tracking-wide text-[var(--white)]">
                New Arrivals
              </h2>
              <Link
                href="/shop"
                aria-label="View all new arrivals"
                className="text-[10px] tracking-[0.25em] uppercase text-[var(--white-dim)] border-b border-[var(--black-border)] pb-0.5 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                View All
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
        <section className="border-t border-[var(--black-border)] bg-[var(--black-soft)] py-20">
          <div className="max-w-2xl mx-auto px-4 text-center flex flex-col gap-6">
            <p className="text-[10px] tracking-[0.5em] text-[var(--gold)] uppercase">
              Our Story
            </p>
            <p className="font-serif text-xl font-light text-[var(--white)] leading-relaxed">
              Every piece in our collection is personally sourced from Mexico.
            </p>
            <p className="text-xs text-[var(--white-dim)] leading-loose tracking-wide max-w-lg mx-auto">
              We specialize in styles like Cubano, Torso, and Cartier chains, as
              well as charms, rings, earrings and more. Interested in a piece?
              Create an account and send us a message to coordinate.
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
