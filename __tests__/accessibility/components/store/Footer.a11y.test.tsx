import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Footer } from "@/components/store/Footer";

// WCAG references:
//   1.3.1 Info and Relationships — footer landmark present
//   2.4.1 Bypass Blocks — footer landmark separates content regions

describe("Footer – accessibility (WCAG 2.1)", () => {
  it("has no axe violations", async () => {
    const { container } = render(<Footer />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("uses a footer landmark element (WCAG 2.4.1)", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("has an accessible label on the footer landmark (WCAG 2.4.6)", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo", { name: /site footer/i })).toBeInTheDocument();
  });

  it("displays the brand name in the footer (WCAG 1.3.1)", () => {
    render(<Footer />);
    const brandElements = screen.getAllByText(/kp jewelry/i);
    expect(brandElements.length).toBeGreaterThan(0);
    expect(brandElements[0]).toBeInTheDocument();
  });
});
