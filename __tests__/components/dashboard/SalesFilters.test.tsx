import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SalesFilters } from "@/components/dashboard/SalesFilters";

const mockPush = jest.fn();
let mockParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockParams,
  usePathname: () => "/dashboard/sales",
}));

beforeEach(() => {
  mockPush.mockClear();
  mockParams = new URLSearchParams();
});

describe("SalesFilters", () => {
  describe("accessibility", () => {
    it("renders a search landmark with an accessible label", () => {
      render(<SalesFilters />);
      expect(screen.getByRole("search", { name: /filter sales by date/i })).toBeInTheDocument();
    });

    it("renders the Date Range select with a label", () => {
      render(<SalesFilters />);
      expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
    });
  });

  describe("preset select", () => {
    it("defaults to All Time when no URL params are set", () => {
      render(<SalesFilters />);
      const select = screen.getByLabelText(/date range/i) as HTMLSelectElement;
      expect(select.value).toBe("all");
    });

    it("reads the active preset from URL params", () => {
      mockParams = new URLSearchParams("preset=last_month");
      render(<SalesFilters />);
      const select = screen.getByLabelText(/date range/i) as HTMLSelectElement;
      expect(select.value).toBe("last_month");
    });

    it("navigates with ?preset=this_week when This Week is selected", async () => {
      const user = userEvent.setup();
      render(<SalesFilters />);
      await user.selectOptions(screen.getByLabelText(/date range/i), "this_week");
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("preset=this_week"));
    });

    it("navigates to the base path with no params when All Time is selected", async () => {
      const user = userEvent.setup();
      mockParams = new URLSearchParams("preset=last_month");
      render(<SalesFilters />);
      await user.selectOptions(screen.getByLabelText(/date range/i), "all");
      expect(mockPush).toHaveBeenCalledWith("/dashboard/sales?");
    });

    it("renders all expected preset options", () => {
      render(<SalesFilters />);
      const select = screen.getByLabelText(/date range/i);
      const options = Array.from((select as HTMLSelectElement).options).map((o) => o.value);
      expect(options).toEqual(
        expect.arrayContaining([
          "all",
          "today",
          "this_week",
          "this_month",
          "last_month",
          "this_quarter",
          "last_quarter",
          "this_year",
          "last_year",
          "custom",
        ])
      );
    });
  });

  describe("custom date range", () => {
    it("does not show date inputs when preset is not custom", () => {
      render(<SalesFilters />);
      expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/end date/i)).not.toBeInTheDocument();
    });

    it("shows From/To date inputs and Apply button when custom is selected", async () => {
      const user = userEvent.setup();
      render(<SalesFilters />);
      await user.selectOptions(screen.getByLabelText(/date range/i), "custom");
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /apply/i })).toBeInTheDocument();
    });

    it("does not navigate immediately after selecting custom", async () => {
      const user = userEvent.setup();
      render(<SalesFilters />);
      await user.selectOptions(screen.getByLabelText(/date range/i), "custom");
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("navigates with preset=custom and from/to params when Apply is clicked", async () => {
      const user = userEvent.setup();
      render(<SalesFilters />);
      await user.selectOptions(screen.getByLabelText(/date range/i), "custom");
      await user.type(screen.getByLabelText(/start date/i), "2024-01-01");
      await user.type(screen.getByLabelText(/end date/i), "2024-01-31");
      await user.click(screen.getByRole("button", { name: /apply/i }));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("preset=custom"));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("from=2024-01-01"));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("to=2024-01-31"));
    });

    it("Apply button is disabled when neither from nor to is set", async () => {
      const user = userEvent.setup();
      render(<SalesFilters />);
      await user.selectOptions(screen.getByLabelText(/date range/i), "custom");
      expect(screen.getByRole("button", { name: /apply/i })).toBeDisabled();
    });
  });

  describe("Clear button", () => {
    it("does not render Clear when preset is all", () => {
      render(<SalesFilters />);
      expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();
    });

    it("renders Clear when a non-all preset is active", () => {
      mockParams = new URLSearchParams("preset=this_year");
      render(<SalesFilters />);
      expect(screen.getByRole("button", { name: /clear/i })).toBeInTheDocument();
    });

    it("navigates to base path and removes params when Clear is clicked", async () => {
      const user = userEvent.setup();
      mockParams = new URLSearchParams("preset=last_quarter");
      render(<SalesFilters />);
      await user.click(screen.getByRole("button", { name: /clear/i }));
      expect(mockPush).toHaveBeenCalledWith("/dashboard/sales");
    });
  });
});
