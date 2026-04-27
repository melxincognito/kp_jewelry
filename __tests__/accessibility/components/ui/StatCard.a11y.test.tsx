import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { StatCard } from "@/components/ui/StatCard";

// WCAG references:
//   1.3.1 Info and Relationships — card content is understandable without visual layout
//   1.4.1 Use of Color — trend direction uses ▲/▼ symbol, not color alone

describe("StatCard – accessibility (WCAG 2.1)", () => {
  it("has no axe violations in minimal form", async () => {
    const { container } = render(<StatCard title="Total Revenue" value="$1,200.00" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with all optional props", async () => {
    const { container } = render(
      <StatCard
        title="Total Revenue"
        value="$1,200.00"
        subtitle="12 items sold"
        icon={<span aria-hidden="true">💰</span>}
        trend={{ value: 15, label: "vs last month" }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with a negative trend", async () => {
    const { container } = render(
      <StatCard
        title="Total Revenue"
        value="$800.00"
        trend={{ value: -10, label: "vs last month" }}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("title is visible in the document (WCAG 1.3.1)", () => {
    render(<StatCard title="Items Listed" value={42} />);
    expect(screen.getByText("Items Listed")).toBeVisible();
  });

  it("positive trend uses ▲ symbol so direction is not conveyed by color alone (WCAG 1.4.1)", () => {
    render(<StatCard title="Sales" value="$500" trend={{ value: 20, label: "this week" }} />);
    expect(screen.getByText(/▲/)).toBeInTheDocument();
  });

  it("negative trend uses ▼ symbol so direction is not conveyed by color alone (WCAG 1.4.1)", () => {
    render(<StatCard title="Sales" value="$300" trend={{ value: -5, label: "this week" }} />);
    expect(screen.getByText(/▼/)).toBeInTheDocument();
  });
});
