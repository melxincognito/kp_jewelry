import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Select } from "@/components/ui/Select";

// WCAG references:
//   1.3.1 Info and Relationships — select has a programmatic label
//   3.3.1 Error Identification — errors described in text
//   3.3.2 Labels or Instructions — label present and associated

const options = [
  { value: "ring", label: "Ring" },
  { value: "necklace", label: "Necklace" },
  { value: "bracelet", label: "Bracelet" },
];

describe("Select – accessibility (WCAG 2.1)", () => {
  it("has no axe violations with a label", async () => {
    const { container } = render(<Select label="Jewelry Type" options={options} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations in error state", async () => {
    const { container } = render(
      <Select label="Jewelry Type" options={options} error="Please select a type" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations when required", async () => {
    const { container } = render(
      <Select label="Jewelry Type" options={options} required />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has a visible label associated with the control (WCAG 1.3.1)", () => {
    render(<Select label="Jewelry Type" options={options} />);
    expect(screen.getByLabelText(/jewelry type/i)).toBeInTheDocument();
  });

  it("displays error text so the problem is described in text (WCAG 3.3.1)", () => {
    render(<Select label="Jewelry Type" options={options} error="Selection required" />);
    expect(screen.getByText("Selection required")).toBeVisible();
  });
});
