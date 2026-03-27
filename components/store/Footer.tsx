export function Footer() {
  return (
    <footer aria-label="Site footer" className="mt-auto border-t border-[var(--black-border)] bg-[var(--black-soft)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-lg font-semibold tracking-[0.15em] text-gold-gradient">
            KP JEWLRS
          </span>
          <p className="text-xs text-[var(--white-dim)]/50">
            All items are unisex. Prices listed in USD. Contact seller to coordinate payment.
          </p>
          <p className="text-xs text-[var(--white-dim)]/40">
            © {new Date().getFullYear()} KP Jewlrs
          </p>
        </div>
      </div>
    </footer>
  );
}
