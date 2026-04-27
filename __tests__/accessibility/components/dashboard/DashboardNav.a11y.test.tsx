import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

// WCAG references:
//   2.4.1 Bypass Blocks — navigation landmark present
//   2.4.4 Link Purpose — nav links have descriptive labels
//   4.1.2 Name, Role, Value — unread badge provides programmatic count
//
// Note: the `region` axe rule is disabled for standalone component tests because
// testing a nav in isolation (outside a full page) always triggers it — the rule
// is validated at the page level, not the component level.

const axeOptions = { rules: { region: { enabled: false } } };

describe("DashboardNav – accessibility (WCAG 2.1)", () => {
  it("has no axe violations with no unread messages", async () => {
    render(<DashboardNav />);
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });

  it("has no axe violations with unread message count", async () => {
    render(<DashboardNav unreadCount={5} />);
    expect(await axe(document.body, axeOptions)).toHaveNoViolations();
  });

  it("nav links are present and named (WCAG 2.4.4)", () => {
    render(<DashboardNav />);
    expect(screen.getByRole("link", { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inventory/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sales/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /messages/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /users/i })).toBeInTheDocument();
  });

  it("sign out button has an accessible name (WCAG 4.1.2)", () => {
    render(<DashboardNav />);
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("logo link points to the home page (WCAG 2.4.4)", () => {
    render(<DashboardNav />);
    const logoLink = screen.getByRole("link", { name: /kp jewelry/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });
});
