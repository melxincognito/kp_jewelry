import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RecordSaleButton } from "@/components/dashboard/RecordSaleButton";

// WCAG references:
//   2.1.2 No Keyboard Trap — dialog can be dismissed with keyboard
//   3.3.2 Labels or Instructions — form fields inside dialog have labels
//   4.1.2 Name, Role, Value — dialog has accessible name

const availableProducts = [
  { id: "p1", name: "Gold Ring", sellingPrice: 90, quantity: 2, sizes: [] },
  { id: "p2", name: "Silver Chain", sellingPrice: 55, quantity: 1, sizes: [{ size: "M", quantity: 1 }] },
];

describe("RecordSaleButton – accessibility (WCAG 2.1)", () => {
  it("has no axe violations in the closed (button) state", async () => {
    const { container } = render(<RecordSaleButton availableProducts={availableProducts} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations when the dialog is open", async () => {
    const user = userEvent.setup();
    render(<RecordSaleButton availableProducts={availableProducts} />);
    await user.click(screen.getByRole("button", { name: /record sale/i }));
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("trigger button has an accessible name (WCAG 4.1.2)", () => {
    render(<RecordSaleButton availableProducts={availableProducts} />);
    expect(screen.getByRole("button", { name: /record sale/i })).toBeInTheDocument();
  });

  it("dialog has role=dialog and an accessible name (WCAG 4.1.2)", async () => {
    const user = userEvent.setup();
    render(<RecordSaleButton availableProducts={availableProducts} />);
    await user.click(screen.getByRole("button", { name: /record sale/i }));
    expect(screen.getByRole("dialog", { name: /record a sale/i })).toBeInTheDocument();
  });

  it("close button inside dialog has an accessible name (WCAG 4.1.2)", async () => {
    const user = userEvent.setup();
    render(<RecordSaleButton availableProducts={availableProducts} />);
    await user.click(screen.getByRole("button", { name: /record sale/i }));
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("item sold select inside dialog has a programmatic label (WCAG 3.3.2)", async () => {
    const user = userEvent.setup();
    render(<RecordSaleButton availableProducts={availableProducts} />);
    await user.click(screen.getByRole("button", { name: /record sale/i }));
    expect(screen.getByLabelText(/item sold/i)).toBeInTheDocument();
  });

  it("sale price field has a programmatic label (WCAG 3.3.2)", async () => {
    const user = userEvent.setup();
    render(<RecordSaleButton availableProducts={availableProducts} />);
    await user.click(screen.getByRole("button", { name: /record sale/i }));
    expect(screen.getByLabelText(/sale price/i)).toBeInTheDocument();
  });

  it("shows disabled state when no products available (WCAG 4.1.2)", () => {
    render(<RecordSaleButton availableProducts={[]} />);
    expect(screen.getByRole("button", { name: /record sale/i })).toBeDisabled();
  });
});
