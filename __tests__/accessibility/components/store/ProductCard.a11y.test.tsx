import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ProductCard } from "@/components/store/ProductCard";
import type { Product } from "@/app/generated/prisma";

// WCAG references:
//   1.1.1 Non-text Content — product image has descriptive alt text
//   1.3.1 Info and Relationships — status conveyed by text, not color alone
//   2.4.4 Link Purpose — card link has an accessible name describing the item
//   4.1.2 Name, Role, Value — card is a link with a descriptive name

const baseProduct: Product = {
  id: "prod-1",
  name: "Gold Chain Necklace",
  sku: "GCN-001",
  description: "A beautiful gold chain necklace.",
  images: JSON.stringify(["https://example.com/img.jpg"]),
  jewelryType: "NECKLACE",
  status: "AVAILABLE",
  quantity: 1,
  costUSD: 50,
  costMXN: 900,
  exchangeRate: 18,
  shippingFees: 5,
  wholesalePrice: 60,
  sellingPrice: 120,
  purchaseDate: null,
  styles: JSON.stringify(["Cubano", "Franco"]),
  sizes: JSON.stringify([]),
  material: "Gold",
  showOnStorefront: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

describe("ProductCard – accessibility (WCAG 2.1)", () => {
  it("has no axe violations for an available product with image", async () => {
    const { container } = render(<ProductCard product={baseProduct} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations for a product without an image", async () => {
    const product = { ...baseProduct, images: "[]" };
    const { container } = render(<ProductCard product={product} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations for a reserved product", async () => {
    const product = { ...baseProduct, status: "RESERVED" };
    const { container } = render(<ProductCard product={product} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations for a sold product", async () => {
    const product = { ...baseProduct, status: "SOLD" };
    const { container } = render(<ProductCard product={product} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("card link has an accessible name that includes product name and price (WCAG 2.4.4)", () => {
    render(<ProductCard product={baseProduct} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAccessibleName(/gold chain necklace/i);
    expect(link).toHaveAccessibleName(/120\.00/);
  });

  it("product image has descriptive alt text (WCAG 1.1.1)", () => {
    render(<ProductCard product={baseProduct} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("alt", expect.stringContaining("Gold Chain Necklace"));
  });

  it("reserved status badge shows text, not just color (WCAG 1.4.1)", () => {
    const product = { ...baseProduct, status: "RESERVED" };
    render(<ProductCard product={product} />);
    expect(screen.getByText("Reserved")).toBeVisible();
  });

  it("links to the product detail page (WCAG 2.4.4)", () => {
    render(<ProductCard product={baseProduct} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/shop/prod-1");
  });
});
