import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ProductForm } from "@/components/dashboard/ProductForm";

// WCAG references:
//   1.3.1 Info and Relationships — all form fields have labels
//   3.3.2 Labels or Instructions — inputs are described
//   4.1.2 Name, Role, Value — submit button has accessible name

describe("ProductForm — create mode — accessibility (WCAG 2.1)", () => {
  it("has no axe violations in create mode", async () => {
    const { container } = render(<ProductForm mode="create" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in edit mode with default values", async () => {
    const { container } = render(
      <ProductForm
        mode="edit"
        defaultValues={{
          name: "Gold Chain",
          sku: "GC-001",
          sellingPrice: 120,
          jewelryType: "NECKLACE",
          status: "AVAILABLE",
        }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Item Name field has a programmatic label (WCAG 1.3.1)", () => {
    render(<ProductForm mode="create" />);
    expect(screen.getByLabelText(/item name/i)).toBeInTheDocument();
  });

  it("Jewelry Type field has a programmatic label (WCAG 1.3.1)", () => {
    render(<ProductForm mode="create" />);
    expect(screen.getByLabelText(/jewelry type/i)).toBeInTheDocument();
  });

  it("Selling Price field has a programmatic label (WCAG 1.3.1)", () => {
    render(<ProductForm mode="create" />);
    expect(screen.getByLabelText(/selling price/i)).toBeInTheDocument();
  });

  it("Show on storefront switch has a programmatic label on its input (WCAG 1.3.1)", () => {
    render(<ProductForm mode="create" />);
    expect(screen.getByRole("checkbox", { name: /show on storefront/i })).toBeInTheDocument();
  });

  it("submit button has an accessible name (WCAG 4.1.2)", () => {
    render(<ProductForm mode="create" />);
    expect(
      screen.getByRole("button", { name: /add to inventory|save changes/i }),
    ).toBeInTheDocument();
  });
});
