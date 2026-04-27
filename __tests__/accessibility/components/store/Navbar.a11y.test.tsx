import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Navbar } from "@/components/store/Navbar";
import type { Session } from "next-auth";

// WCAG references:
//   2.1.1 Keyboard — mobile menu toggle operable by keyboard
//   2.4.1 Bypass Blocks — navigation landmark present
//   2.4.4 Link Purpose — links have descriptive text
//   4.1.2 Name, Role, Value — hamburger button has aria-label and aria-expanded

const guestSession = null;
const customerSession: Session = {
  user: { id: "u1", name: "Jane Doe", email: "jane@example.com", role: "CUSTOMER" },
  expires: "2099-01-01",
};
const adminSession: Session = {
  user: { id: "u2", name: "Admin", email: "admin@example.com", role: "ADMIN" },
  expires: "2099-01-01",
};

describe("Navbar – accessibility (WCAG 2.1)", () => {
  it("has no axe violations for guest (unauthenticated)", async () => {
    const { container } = render(<Navbar session={guestSession} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations for authenticated customer", async () => {
    const { container } = render(<Navbar session={customerSession} unreadCount={0} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations for admin user", async () => {
    const { container } = render(<Navbar session={adminSession} unreadCount={0} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with unread message badge", async () => {
    const { container } = render(<Navbar session={customerSession} unreadCount={3} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("uses a header landmark element (WCAG 2.4.1)", () => {
    render(<Navbar session={guestSession} />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });

  it("has a nav landmark with an accessible name (WCAG 2.4.6)", () => {
    render(<Navbar session={guestSession} />);
    expect(screen.getByRole("navigation", { name: /main navigation/i })).toBeInTheDocument();
  });

  it("logo link has an accessible text label (WCAG 2.4.4)", () => {
    render(<Navbar session={guestSession} />);
    expect(screen.getByRole("link", { name: /kp jewelry/i })).toBeInTheDocument();
  });

  it("mobile menu button has aria-label (WCAG 4.1.2)", () => {
    render(<Navbar session={guestSession} />);
    expect(screen.getByRole("button", { name: /open menu|close menu/i })).toBeInTheDocument();
  });

  it("mobile menu button starts with aria-expanded=false (WCAG 4.1.2)", () => {
    render(<Navbar session={guestSession} />);
    expect(screen.getByRole("button", { name: /open menu/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("clicking mobile menu button opens the drawer (WCAG 2.1.1)", async () => {
    const user = userEvent.setup();
    render(<Navbar session={guestSession} />);
    await user.click(screen.getByRole("button", { name: /open menu/i }));
    // When the drawer opens, mobile navigation links become visible in the drawer
    expect(screen.getByRole("navigation", { name: /mobile navigation/i })).toBeInTheDocument();
  });

  it("unread messages link has an aria-label describing the count (WCAG 1.3.1)", () => {
    render(<Navbar session={customerSession} unreadCount={5} />);
    expect(
      screen.getByRole("link", { name: /messages, 5 unread/i }),
    ).toBeInTheDocument();
  });
});
