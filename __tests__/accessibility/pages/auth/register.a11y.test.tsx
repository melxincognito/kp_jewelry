import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import RegisterPage from "@/app/(auth)/register/page";

// WCAG references:
//   1.3.1 Info and Relationships — form inputs have programmatic labels
//   2.4.4 Link Purpose — links describe their destination
//   3.3.2 Labels or Instructions — password hint is visible before submission
//   3.3.4 Error Prevention — confirm password field prevents mis-typed passwords
//   4.1.2 Name, Role, Value — form and submit button have accessible names

describe("Register Page – accessibility (WCAG 2.1)", () => {
  it("has no axe violations", async () => {
    const { container } = render(<RegisterPage />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has a form with an accessible name (WCAG 4.1.2)", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("form", { name: /create account/i })).toBeInTheDocument();
  });

  it("full name input has a programmatic label (WCAG 1.3.1)", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it("email input has a programmatic label (WCAG 1.3.1)", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("password input has a programmatic label (WCAG 1.3.1)", () => {
    render(<RegisterPage />);
    const passwordInputs = screen.getAllByLabelText(/password/i);
    expect(passwordInputs.length).toBeGreaterThanOrEqual(1);
  });

  it("password hint is shown before submission to prevent errors (WCAG 3.3.2)", () => {
    render(<RegisterPage />);
    expect(screen.getByText(/minimum 8 characters/i)).toBeVisible();
  });

  it("confirm password field requires the user to re-type their password (WCAG 3.3.4)", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("submit button has an accessible name (WCAG 4.1.2)", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("Google sign-in button has an accessible name (WCAG 4.1.2)", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("sign-in link describes its destination (WCAG 2.4.4)", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("email input type is email for correct virtual keyboard (WCAG 1.3.5)", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/^email/i)).toHaveAttribute("type", "email");
  });

  it("password field enforces minimum length via HTML attribute (WCAG 3.3.2)", () => {
    render(<RegisterPage />);
    const passwordInput = screen.getByLabelText(/^password/i);
    expect(passwordInput).toHaveAttribute("minlength", "8");
  });
});
