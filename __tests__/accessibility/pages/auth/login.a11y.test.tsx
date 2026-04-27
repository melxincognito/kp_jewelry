import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import LoginPage from "@/app/(auth)/login/page";

// WCAG references:
//   1.3.1 Info and Relationships — form inputs have programmatic labels
//   2.4.4 Link Purpose — links describe their destination
//   3.3.2 Labels or Instructions — form fields labelled before input
//   4.1.2 Name, Role, Value — form has an accessible name; submit button named

describe("Login Page – accessibility (WCAG 2.1)", () => {
  it("has no axe violations", async () => {
    const { container } = render(<LoginPage />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has a form with an accessible name (WCAG 4.1.2)", () => {
    render(<LoginPage />);
    expect(screen.getByRole("form", { name: /sign in/i })).toBeInTheDocument();
  });

  it("email input has a programmatic label (WCAG 1.3.1)", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("password input has a programmatic label (WCAG 1.3.1)", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("submit button has an accessible name (WCAG 4.1.2)", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("Google sign-in button has an accessible name (WCAG 4.1.2)", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("registration link has descriptive text (WCAG 2.4.4)", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /create one/i })).toBeInTheDocument();
  });

  it("email input has type=email for correct virtual keyboard on mobile (WCAG 1.3.5)", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("type", "email");
  });

  it("password input has type=password so it is masked (WCAG 1.3.5)", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/password/i)).toHaveAttribute("type", "password");
  });
});
