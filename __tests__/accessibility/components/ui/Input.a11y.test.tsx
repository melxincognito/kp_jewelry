import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Input } from "@/components/ui/Input";

// WCAG references:
//   1.3.1 Info and Relationships — form inputs have programmatic labels
//   3.3.1 Error Identification — errors are described in text
//   3.3.2 Labels or Instructions — labels present and descriptive

describe("Input – accessibility (WCAG 2.1)", () => {
  it("has no axe violations with a label", async () => {
    const { container } = render(<Input label="Email address" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in error state", async () => {
    const { container } = render(<Input label="Email address" error="Invalid email" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with a hint", async () => {
    const { container } = render(<Input label="Password" hint="Minimum 8 characters" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations for a required field", async () => {
    const { container } = render(<Input label="Full name" required />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("associates label with input programmatically (WCAG 1.3.1)", () => {
    render(<Input label="Email address" />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it("displays error text so the problem is described in text (WCAG 3.3.1)", () => {
    render(<Input label="Email address" error="Please enter a valid email" />);
    expect(screen.getByText("Please enter a valid email")).toBeVisible();
  });

  it("marks required fields so users know they must be completed (WCAG 3.3.2)", () => {
    render(<Input label="Full name" required />);
    const input = screen.getByLabelText(/full name/i);
    expect(input).toBeRequired();
  });

  it("displays hint text as instruction (WCAG 3.3.2)", () => {
    render(<Input label="Password" hint="Minimum 8 characters" />);
    expect(screen.getByText("Minimum 8 characters")).toBeVisible();
  });
});
