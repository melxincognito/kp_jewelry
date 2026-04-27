import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Button } from "@/components/ui/Button";

// WCAG references:
//   2.1.1 Keyboard — all functionality available via keyboard
//   4.1.2 Name, Role, Value — interactive elements have accessible names
//   4.1.3 Status Messages — busy state is communicated programmatically

describe("Button – accessibility (WCAG 2.1)", () => {
  it("has no axe violations in default state", async () => {
    const { container } = render(<Button>Save Changes</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in loading state", async () => {
    const { container } = render(<Button loading>Saving</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in disabled state", async () => {
    const { container } = render(<Button disabled>Submit</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has an accessible name from visible text (WCAG 4.1.2)", () => {
    render(<Button>Submit form</Button>);
    expect(screen.getByRole("button", { name: /submit form/i })).toBeInTheDocument();
  });

  it("communicates busy state via aria-busy (WCAG 4.1.3)", () => {
    render(<Button loading>Saving</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy");
  });

  it("is disabled when loading so it cannot be activated (WCAG 2.1.1)", () => {
    render(<Button loading>Saving</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is reachable by keyboard — not removed from tab order (WCAG 2.1.1)", () => {
    render(<Button>Focusable</Button>);
    const btn = screen.getByRole("button", { name: /focusable/i });
    expect(btn).not.toHaveAttribute("tabindex", "-1");
  });

  it("disabled button still has an accessible name (WCAG 4.1.2)", () => {
    render(<Button disabled>Disabled action</Button>);
    expect(screen.getByRole("button", { name: /disabled action/i })).toBeDisabled();
  });
});
