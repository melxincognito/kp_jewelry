import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Save Changes</Button>);
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button", { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled and not clickable when loading is true", async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Submit</Button>);

    const btn = screen.getByRole("button", { name: /submit/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy");
    await user.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: /disabled/i })).toBeDisabled();
  });

  it("renders a loading spinner when loading is true", () => {
    render(<Button loading>Loading</Button>);
    // The spinner is aria-hidden so we look for the hidden element inside the button
    const btn = screen.getByRole("button", { name: /loading/i });
    const spinner = btn.querySelector("[aria-hidden='true']");
    expect(spinner).toBeInTheDocument();
  });

  it("does not render a spinner when not loading", () => {
    render(<Button>No Spinner</Button>);
    const btn = screen.getByRole("button", { name: /no spinner/i });
    expect(btn.querySelector("[aria-hidden='true']")).not.toBeInTheDocument();
  });

  it("forwards type=submit to the underlying button element", () => {
    render(<Button type="submit">Submit Form</Button>);
    expect(screen.getByRole("button", { name: /submit form/i })).toHaveAttribute("type", "submit");
  });
});
