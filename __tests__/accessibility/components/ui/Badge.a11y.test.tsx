import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Badge } from "@/components/ui/Badge";

// WCAG references:
//   1.1.1 Non-text Content  — meaningful labels
//   1.3.1 Info and Relationships — info conveyed visually is also programmatic
//   1.4.1 Use of Color — color is not the only means of conveying status

describe("Badge – accessibility (WCAG 2.1)", () => {
  const variants = ["gold", "outline", "status-available", "status-reserved", "status-sold"] as const;

  it.each(variants)("has no axe violations — variant: %s", async (variant) => {
    const { container } = render(<Badge variant={variant}>Label</Badge>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("exposes a visible text label so meaning is not conveyed by color alone (WCAG 1.4.1)", () => {
    render(<Badge variant="status-available">Available</Badge>);
    expect(screen.getByText("Available")).toBeVisible();
  });

  it("exposes a visible text label for reserved status (WCAG 1.4.1)", () => {
    render(<Badge variant="status-reserved">Reserved</Badge>);
    expect(screen.getByText("Reserved")).toBeVisible();
  });

  it("exposes a visible text label for sold status (WCAG 1.4.1)", () => {
    render(<Badge variant="status-sold">Sold</Badge>);
    expect(screen.getByText("Sold")).toBeVisible();
  });
});
