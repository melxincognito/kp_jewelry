import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { LoadingSpinner, PageLoader } from "@/components/ui/LoadingSpinner";

// WCAG references:
//   1.3.1 Info and Relationships — decorative elements marked to not confuse assistive tech
//   2.4.3 Focus Order — loading overlays don't trap focus unexpectedly

describe("LoadingSpinner – accessibility (WCAG 2.1)", () => {
  it("has no axe violations", async () => {
    const { container } = render(<LoadingSpinner />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("PageLoader – accessibility (WCAG 2.1)", () => {
  it("has no axe violations", async () => {
    const { container } = render(<PageLoader />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
