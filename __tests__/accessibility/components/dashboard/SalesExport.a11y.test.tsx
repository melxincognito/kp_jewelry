// jsPDF uses TextEncoder / canvas APIs not available in jsdom — mock the whole module.
jest.mock("jspdf", () => ({ default: jest.fn() }));
jest.mock("jspdf-autotable", () => jest.fn());

import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { SalesExport, type SaleRow } from "@/components/dashboard/SalesExport";

// WCAG references:
//   4.1.2 Name, Role, Value — export buttons have accessible names

const rows: SaleRow[] = [
  { item: "Gold Ring", buyer: "jane@example.com", salePrice: 90, profit: 40, date: "2024-01-15", notes: "" },
];

describe("SalesExport – accessibility (WCAG 2.1)", () => {
  it("has no axe violations", async () => {
    const { container } = render(
      <SalesExport rows={rows} totalRevenue={90} totalProfit={40} label="This Month" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no axe violations with empty rows", async () => {
    const { container } = render(
      <SalesExport rows={[]} totalRevenue={0} totalProfit={0} label="All Time" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("export buttons have accessible names (WCAG 4.1.2)", () => {
    render(
      <SalesExport rows={rows} totalRevenue={90} totalProfit={40} label="This Month" />,
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveAccessibleName();
    });
  });
});
