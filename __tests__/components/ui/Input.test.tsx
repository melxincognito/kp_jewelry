import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("renders a labelled input when label prop is provided", () => {
    render(<Input label="Email Address" />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it("renders without a label when label prop is omitted", () => {
    render(<Input placeholder="Enter value" />);
    expect(screen.getByPlaceholderText("Enter value")).toBeInTheDocument();
  });

  it("displays an error message and applies aria-invalid when error prop is set", () => {
    render(<Input label="Email" error="Invalid email address" />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email address");
  });

  it("does not show an error alert when no error prop is provided", () => {
    render(<Input label="Name" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("displays a hint message when hint prop is set and there is no error", () => {
    render(<Input label="Price" hint="Enter in USD" />);
    expect(screen.getByText("Enter in USD")).toBeInTheDocument();
  });

  it("hides the hint when an error is also present (error takes precedence)", () => {
    render(<Input label="Price" hint="Enter in USD" error="Required" />);
    expect(screen.queryByText("Enter in USD")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("marks the input as required via aria-required when the required prop is set", () => {
    render(<Input label="Name" required />);
    expect(screen.getByLabelText(/name/i)).toHaveAttribute("aria-required", "true");
  });

  it("calls onChange when the user types", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Input label="Search" onChange={handleChange} />);
    await user.type(screen.getByLabelText(/search/i), "hello");
    expect(handleChange).toHaveBeenCalled();
  });

  it("associates the label with the input via htmlFor and id", () => {
    render(<Input label="Item Name" />);
    const input = screen.getByLabelText(/item name/i);
    expect(input.id).toBeTruthy();
    // getByLabelText already confirms the association
  });
});
