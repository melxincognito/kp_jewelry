import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { BulkImportButton } from "@/components/dashboard/BulkImportButton";

// WCAG references:
//   1.3.1 Info and Relationships — file input has a label
//   3.3.1 Error Identification — import errors described in text
//   4.1.2 Name, Role, Value — trigger button and dialog have accessible names

describe("BulkImportButton – accessibility (WCAG 2.1)", () => {
  it("has no axe violations in closed (button) state", async () => {
    const { container } = render(<BulkImportButton />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations when dialog is open", async () => {
    const user = userEvent.setup();
    render(<BulkImportButton />);
    await user.click(screen.getByRole("button", { name: /import spreadsheet/i }));
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("trigger button has an accessible name (WCAG 4.1.2)", () => {
    render(<BulkImportButton />);
    expect(screen.getByRole("button", { name: /import spreadsheet/i })).toBeInTheDocument();
  });

  it("dialog has an accessible name when open (WCAG 4.1.2)", async () => {
    const user = userEvent.setup();
    render(<BulkImportButton />);
    await user.click(screen.getByRole("button", { name: /import spreadsheet/i }));
    expect(screen.getByRole("dialog", { name: /import inventory/i })).toBeInTheDocument();
  });

  it("dialog close button has an accessible name (WCAG 4.1.2)", async () => {
    const user = userEvent.setup();
    render(<BulkImportButton />);
    await user.click(screen.getByRole("button", { name: /import spreadsheet/i }));
    expect(screen.getByRole("button", { name: /close import dialog/i })).toBeInTheDocument();
  });

  it("template download button has an accessible name (WCAG 4.1.2)", async () => {
    const user = userEvent.setup();
    render(<BulkImportButton />);
    await user.click(screen.getByRole("button", { name: /import spreadsheet/i }));
    expect(screen.getByRole("button", { name: /download csv template/i })).toBeInTheDocument();
  });
});
