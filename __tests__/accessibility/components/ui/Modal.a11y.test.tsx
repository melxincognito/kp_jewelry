import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Modal } from "@/components/ui/Modal";

// WCAG references:
//   2.1.2 No Keyboard Trap — focus can be moved out of modal via keyboard
//   2.4.3 Focus Order — focus moves to dialog on open
//   4.1.2 Name, Role, Value — dialog has role="dialog", aria-modal, accessible name

describe("Modal – accessibility (WCAG 2.1)", () => {
  it("has no axe violations when open with a title", async () => {
    render(
      <Modal open onClose={() => {}} title="Confirm Action">
        <p>Are you sure?</p>
      </Modal>,
    );
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("has no axe violations when open with aria-label (no title)", async () => {
    render(
      <Modal open onClose={() => {}} aria-label="Confirmation dialog">
        <p>Content without a visible heading</p>
      </Modal>,
    );
    expect(await axe(document.body)).toHaveNoViolations();
  });

  it("does not render dialog content when closed", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Hidden Dialog">
        <p>Hidden content</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("has role=dialog (WCAG 4.1.2)", () => {
    render(
      <Modal open onClose={() => {}} title="Settings">
        <p>Settings content</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("has aria-modal attribute on the dialog (WCAG 4.1.2)", () => {
    render(
      <Modal open onClose={() => {}} title="Confirm">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("has an accessible name from the title (WCAG 4.1.2)", () => {
    render(
      <Modal open onClose={() => {}} title="Delete Item">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog", { name: /delete item/i })).toBeInTheDocument();
  });

  it("close button has an accessible name (WCAG 4.1.2)", () => {
    render(
      <Modal open onClose={() => {}} title="Settings">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("close button calls onClose when activated (WCAG 2.1.1)", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Modal open onClose={onClose} title="Settings">
        <p>Content</p>
      </Modal>,
    );
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
