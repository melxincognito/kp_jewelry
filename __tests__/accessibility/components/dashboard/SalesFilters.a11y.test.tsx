import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SalesFilters } from "@/components/dashboard/SalesFilters";

// WCAG references:
//   1.3.1 Info and Relationships — filter controls have labels
//   2.4.6 Headings and Labels — search region has an accessible label
//   3.3.2 Labels or Instructions — date inputs have labels when visible

describe("SalesFilters – accessibility (WCAG 2.1)", () => {
  it("has no axe violations in default state", async () => {
    const { container } = render(<SalesFilters />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has a search region with accessible label (WCAG 2.4.6)", () => {
    render(<SalesFilters />);
    expect(screen.getByRole("search", { name: /filter sales by date/i })).toBeInTheDocument();
  });

  it("Date Range select has a programmatic label (WCAG 1.3.1)", () => {
    render(<SalesFilters />);
    expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
  });

  it("custom date From input has a programmatic label when visible (WCAG 3.3.2)", async () => {
    const user = userEvent.setup();
    render(<SalesFilters />);
    await user.selectOptions(screen.getByLabelText(/date range/i), "custom");
    expect(screen.getByLabelText(/^from$/i)).toBeInTheDocument();
  });

  it("custom date To input has a programmatic label when visible (WCAG 3.3.2)", async () => {
    const user = userEvent.setup();
    render(<SalesFilters />);
    await user.selectOptions(screen.getByLabelText(/date range/i), "custom");
    expect(screen.getByLabelText(/^to$/i)).toBeInTheDocument();
  });
});
