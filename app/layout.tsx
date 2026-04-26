import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ThemeRegistry } from "./ThemeRegistry";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "KP Jewelry", template: "%s | KP Jewelry" },
  description:
    "Handpicked jewelry — necklaces, bracelets, rings, earrings and more. Browse our curated collection.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}
      style={{ height: "100%" }}
    >
      <body
        style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
