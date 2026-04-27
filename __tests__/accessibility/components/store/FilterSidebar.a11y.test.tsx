import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { FilterSidebar } from "@/components/store/FilterSidebar";

// WCAG references:
//   1.3.1 Info and Relationships — filter groups have programmatic labels
//   2.1.1 Keyboard — all filters operable by keyboard
//   4.1.2 Name, Role, Value — toggle button has aria-expanded, filter buttons have aria-pressed

const noStyles: string[] = [];
const withStyles = ["Cubano", "Franco", "Tennis"];

describe("FilterSidebar – accessibility (WCAG 2.1)", () => {
  it("has no axe violations with no styles", async () => {
    const { container } = render(<FilterSidebar availableStyles={noStyles} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with style tags", async () => {
    const { container } = render(<FilterSidebar availableStyles={withStyles} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations when mobile panel is open", async () => {
    const user = userEvent.setup();
    const { container } = render(<FilterSidebar availableStyles={withStyles} />);
    const toggle = screen.queryByRole("button", { name: /filters/i });
    if (toggle) await user.click(toggle);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("aside landmark has an accessible label (WCAG 2.4.6)", () => {
    render(<FilterSidebar availableStyles={noStyles} />);
    expect(screen.getByRole("complementary", { name: /product filters/i })).toBeInTheDocument();
  });

  it("filter groups have programmatic labels via aria-labelledby (WCAG 1.3.1)", () => {
    render(<FilterSidebar availableStyles={noStyles} />);
    expect(screen.getByRole("group", { name: /sort/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /availability/i })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /category/i })).toBeInTheDocument();
  });

  it("filter buttons have aria-pressed to communicate selected state (WCAG 4.1.2)", () => {
    render(<FilterSidebar availableStyles={noStyles} />);
    const buttons = screen.getAllByRole("button", { name: /newest|all types|all$/i });
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-pressed");
    });
  });

  it("style tag buttons have aria-pressed (WCAG 4.1.2)", () => {
    render(<FilterSidebar availableStyles={withStyles} />);
    const cubaBtn = screen.getByRole("button", { name: /cubano/i });
    expect(cubaBtn).toHaveAttribute("aria-pressed");
  });

  it("mobile toggle button has aria-expanded and aria-controls (WCAG 4.1.2)", () => {
    render(<FilterSidebar availableStyles={noStyles} />);
    const toggle = screen.queryByRole("button", { name: /filters/i });
    if (toggle) {
      expect(toggle).toHaveAttribute("aria-expanded");
      expect(toggle).toHaveAttribute("aria-controls");
    }
  });
});
