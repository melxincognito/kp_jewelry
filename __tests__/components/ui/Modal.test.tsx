import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/ui/Modal";

describe("Modal", () => {
  it("renders the title when provided", () => {
    render(
      <Modal open onClose={jest.fn()} title="Confirm Action">
        <p>Are you sure?</p>
      </Modal>
    );
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
  });

  it("renders children inside the modal", () => {
    render(
      <Modal open onClose={jest.fn()} title="Test">
        <p>Modal content here</p>
      </Modal>
    );
    expect(screen.getByText("Modal content here")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = jest.fn();
    render(
      <Modal open onClose={handleClose} title="Close Me">
        <p>Content</p>
      </Modal>
    );
    await user.click(screen.getByRole("button", { name: /close/i, hidden: true }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("has aria-modal set to true for screen readers", () => {
    render(
      <Modal open onClose={jest.fn()} title="Accessible">
        <p>Content</p>
      </Modal>
    );
    expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute("aria-modal", "true");
  });

  it("labels the dialog with the title via aria-labelledby", () => {
    render(
      <Modal open onClose={jest.fn()} title="My Dialog">
        <p>Content</p>
      </Modal>
    );
    const dialog = screen.getByRole("dialog", { hidden: true });
    const labelId = dialog.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)).toHaveTextContent("My Dialog");
  });

  it("calls showModal on the dialog element when open is true", () => {
    render(
      <Modal open onClose={jest.fn()} title="Open">
        <p>Content</p>
      </Modal>
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });
});
