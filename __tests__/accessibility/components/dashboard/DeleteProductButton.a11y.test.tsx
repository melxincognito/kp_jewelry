import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DeleteProductButton } from "@/components/dashboard/DeleteProductButton";

// WCAG references:
//   2.1.1 Keyboard — confirmation flow operable by keyboard
//   3.3.4 Error Prevention — irreversible action requires confirmation
//   4.1.2 Name, Role, Value — both states have accessible button names

describe("DeleteProductButton – accessibility (WCAG 2.1)", () => {
  it("has no axe violations in initial state", async () => {
    const { container } = render(<DeleteProductButton id="prod-1" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in confirmation state", async () => {
    const user = userEvent.setup();
    const { container } = render(<DeleteProductButton id="prod-1" />);
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("initial delete button has an accessible name (WCAG 4.1.2)", () => {
    render(<DeleteProductButton id="prod-1" />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("confirmation state shows Confirm and Cancel buttons (WCAG 3.3.4)", async () => {
    const user = userEvent.setup();
    render(<DeleteProductButton id="prod-1" />);
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("cancel button returns to initial state (WCAG 3.3.4)", async () => {
    const user = userEvent.setup();
    render(<DeleteProductButton id="prod-1" />);
    await user.click(screen.getByRole("button", { name: /delete/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /confirm/i })).not.toBeInTheDocument();
  });
});
