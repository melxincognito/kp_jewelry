import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterSidebar } from "@/components/store/FilterSidebar";

// Provide controllable mock values for next/navigation
const mockPush = jest.fn();
let mockParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockParams,
  usePathname: () => "/shop",
}));

beforeEach(() => {
  mockPush.mockClear();
  mockParams = new URLSearchParams();
});

describe("FilterSidebar", () => {
  describe("accessibility", () => {
    it("renders the aside with an accessible label", () => {
      render(<FilterSidebar availableStyles={[]} />);
      expect(screen.getByRole("complementary", { name: /product filters/i })).toBeInTheDocument();
    });

    it("renders Sort, Availability, and Category filter groups", () => {
      render(<FilterSidebar availableStyles={[]} />);
      expect(screen.getByText("Sort")).toBeInTheDocument();
      expect(screen.getByText("Availability")).toBeInTheDocument();
      expect(screen.getByText("Category")).toBeInTheDocument();
    });

    it("all filter buttons have aria-pressed attributes", () => {
      render(<FilterSidebar availableStyles={[]} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((btn) => {
        expect(btn).toHaveAttribute("aria-pressed");
      });
    });
  });

  describe("Sort filter", () => {
    it("marks Newest as pressed by default (no sort param in URL)", () => {
      render(<FilterSidebar availableStyles={[]} />);
      expect(screen.getByRole("button", { name: /newest/i })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: /price: low to high/i })).toHaveAttribute("aria-pressed", "false");
    });

    it("marks the active sort from URL params as pressed", () => {
      mockParams = new URLSearchParams("sort=price_asc");
      render(<FilterSidebar availableStyles={[]} />);
      expect(screen.getByRole("button", { name: /price: low to high/i })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: /newest/i })).toHaveAttribute("aria-pressed", "false");
    });

    it("navigates with the sort param when a sort option is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterSidebar availableStyles={[]} />);
      await user.click(screen.getByRole("button", { name: /price: high to low/i }));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("sort=price_desc"));
    });
  });

  describe("Availability filter", () => {
    it("marks All as pressed by default", () => {
      render(<FilterSidebar availableStyles={[]} />);
      expect(screen.getByRole("button", { name: /^all$/i })).toHaveAttribute("aria-pressed", "true");
    });

    it("navigates with status=AVAILABLE when Available is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterSidebar availableStyles={[]} />);
      await user.click(screen.getByRole("button", { name: /^available$/i }));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("status=AVAILABLE"));
    });
  });

  describe("Style tags", () => {
    it("does not render the Style section when availableStyles is empty", () => {
      render(<FilterSidebar availableStyles={[]} />);
      expect(screen.queryByText("Style")).not.toBeInTheDocument();
    });

    it("renders style chip buttons when availableStyles are provided", () => {
      render(<FilterSidebar availableStyles={["Cubano", "Franco"]} />);
      expect(screen.getByRole("button", { name: /cubano/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /franco/i })).toBeInTheDocument();
    });

    it("marks a style as pressed when it is active in the URL", () => {
      mockParams = new URLSearchParams("style=Cubano");
      render(<FilterSidebar availableStyles={["Cubano", "Franco"]} />);
      expect(screen.getByRole("button", { name: /cubano/i })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: /franco/i })).toHaveAttribute("aria-pressed", "false");
    });

    it("appends a style param when an inactive style chip is clicked", async () => {
      const user = userEvent.setup();
      render(<FilterSidebar availableStyles={["Cubano", "Franco"]} />);
      await user.click(screen.getByRole("button", { name: /cubano/i }));
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("style=Cubano"));
    });
  });

  describe("Clear filters button", () => {
    it("does not render when no filters are active", () => {
      render(<FilterSidebar availableStyles={[]} />);
      expect(screen.queryByRole("button", { name: /clear all filters/i })).not.toBeInTheDocument();
    });

    it("appears when a status filter is active", () => {
      mockParams = new URLSearchParams("status=AVAILABLE");
      render(<FilterSidebar availableStyles={[]} />);
      expect(screen.getByRole("button", { name: /clear all filters/i })).toBeInTheDocument();
    });

    it("navigates to /shop with no params when Clear is clicked", async () => {
      const user = userEvent.setup();
      mockParams = new URLSearchParams("type=RING");
      render(<FilterSidebar availableStyles={[]} />);
      await user.click(screen.getByRole("button", { name: /clear all filters/i }));
      expect(mockPush).toHaveBeenCalledWith("/shop");
    });
  });
});
