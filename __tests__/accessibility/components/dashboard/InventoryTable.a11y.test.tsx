import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { InventoryTable, type InventoryProduct } from "@/components/dashboard/InventoryTable";

// WCAG references:
//   1.3.1 Info and Relationships — table headers, search labels, filter groups
//   2.1.1 Keyboard — search and filter controls are keyboard operable
//   4.1.2 Name, Role, Value — form controls have accessible names

const mockProducts: InventoryProduct[] = [
  {
    id: "p1",
    name: "Gold Ring",
    sku: "GR-001",
    images: JSON.stringify(["https://example.com/ring.jpg"]),
    jewelryType: "RING",
    status: "AVAILABLE",
    quantity: 2,
    costUSD: 40,
    costMXN: 720,
    shippingFees: 3,
    wholesalePrice: 50,
    sellingPrice: 90,
    showOnStorefront: true,
  },
  {
    id: "p2",
    name: "Silver Bracelet",
    sku: "SB-001",
    images: "[]",
    jewelryType: "BRACELET",
    status: "SOLD",
    quantity: 0,
    costUSD: 25,
    costMXN: 450,
    shippingFees: 2,
    wholesalePrice: 30,
    sellingPrice: 55,
    showOnStorefront: false,
  },
];

describe("InventoryTable – accessibility (WCAG 2.1)", () => {
  it("has no axe violations with products", async () => {
    const { container } = render(<InventoryTable products={mockProducts} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations when empty", async () => {
    const { container } = render(<InventoryTable products={[]} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("table has column headers (WCAG 1.3.1)", () => {
    render(<InventoryTable products={mockProducts} />);
    expect(screen.getByRole("columnheader", { name: /item/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /price/i })).toBeInTheDocument();
  });

  it("name search input has a programmatic label (WCAG 1.3.1)", () => {
    render(<InventoryTable products={mockProducts} />);
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
  });

  it("SKU search input has a programmatic label (WCAG 1.3.1)", () => {
    render(<InventoryTable products={mockProducts} />);
    expect(screen.getByLabelText(/^sku$/i)).toBeInTheDocument();
  });

  it("filter region has an accessible label attribute (WCAG 2.4.6)", () => {
    render(<InventoryTable products={mockProducts} />);
    const filterRegion = document.querySelector("[aria-label='Filter inventory']");
    expect(filterRegion).toBeInTheDocument();
  });

  it("product names are visible in the table (WCAG 1.3.1)", () => {
    render(<InventoryTable products={mockProducts} />);
    expect(screen.getByText("Gold Ring")).toBeVisible();
    expect(screen.getByText("Silver Bracelet")).toBeVisible();
  });
});
