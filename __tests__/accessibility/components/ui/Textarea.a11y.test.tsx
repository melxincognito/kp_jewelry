import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Textarea } from "@/components/ui/Textarea";

// WCAG references:
//   1.3.1 Info and Relationships — textarea has a programmatic label
//   3.3.1 Error Identification — errors described in text
//   3.3.2 Labels or Instructions — label present and descriptive

describe("Textarea – accessibility (WCAG 2.1)", () => {
  it("has no axe violations with a label", async () => {
    const { container } = render(<Textarea label="Description" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in error state", async () => {
    const { container } = render(
      <Textarea label="Description" error="Description is required" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations when required", async () => {
    const { container } = render(<Textarea label="Description" required />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("associates label with textarea programmatically (WCAG 1.3.1)", () => {
    render(<Textarea label="Description" />);
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it("displays error text so the problem is identified in text (WCAG 3.3.1)", () => {
    render(<Textarea label="Description" error="Too short — 10 characters minimum" />);
    expect(screen.getByText("Too short — 10 characters minimum")).toBeVisible();
  });

  it("marks required fields (WCAG 3.3.2)", () => {
    render(<Textarea label="Message" required />);
    expect(screen.getByLabelText(/message/i)).toBeRequired();
  });
});
