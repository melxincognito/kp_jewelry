import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { UserRoleToggle } from "@/components/dashboard/UserRoleToggle";

// WCAG references:
//   4.1.2 Name, Role, Value — button has an accessible name that reflects the action

describe("UserRoleToggle – accessibility (WCAG 2.1)", () => {
  it("has no axe violations for a CUSTOMER role", async () => {
    const { container } = render(<UserRoleToggle userId="u1" currentRole="CUSTOMER" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations for an ADMIN role", async () => {
    const { container } = render(<UserRoleToggle userId="u2" currentRole="ADMIN" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows 'Make admin' action for CUSTOMER (WCAG 4.1.2)", () => {
    render(<UserRoleToggle userId="u1" currentRole="CUSTOMER" />);
    expect(screen.getByRole("button", { name: /make admin/i })).toBeInTheDocument();
  });

  it("shows 'Remove admin' action for ADMIN (WCAG 4.1.2)", () => {
    render(<UserRoleToggle userId="u2" currentRole="ADMIN" />);
    expect(screen.getByRole("button", { name: /remove admin/i })).toBeInTheDocument();
  });

  it("button is keyboard accessible — not removed from tab order (WCAG 2.1.1)", () => {
    render(<UserRoleToggle userId="u1" currentRole="CUSTOMER" />);
    expect(screen.getByRole("button")).not.toHaveAttribute("tabindex", "-1");
  });
});
