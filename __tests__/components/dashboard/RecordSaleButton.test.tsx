import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordSaleButton } from "@/components/dashboard/RecordSaleButton";

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/dashboard/sales",
}));

const productNoSizes = {
  id: "prod-1",
  name: "Franco Chain",
  sellingPrice: 45,
  quantity: 10,
  sizes: [],
};

const productWithSizes = {
  id: "prod-2",
  name: "Gold Ring",
  sellingPrice: 80,
  quantity: 30,
  sizes: [
    { size: "6", quantity: 10 },
    { size: "7", quantity: 5 },
    { size: "8", quantity: 0 }, // out-of-stock — should not appear in options
  ],
};

beforeEach(() => {
  mockRefresh.mockClear();
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

/** Returns a `within` scope for the dialog so hidden-element queries work consistently. */
async function openModal(user: ReturnType<typeof userEvent.setup>, products = [productNoSizes]) {
  render(<RecordSaleButton availableProducts={products} />);
  await user.click(screen.getByRole("button", { name: /record sale/i }));
  return within(screen.getByRole("dialog", { hidden: true }));
}

describe("RecordSaleButton", () => {
  describe("trigger button", () => {
    it("renders the Record Sale button", () => {
      render(<RecordSaleButton availableProducts={[productNoSizes]} />);
      expect(screen.getByRole("button", { name: /record sale/i })).toBeInTheDocument();
    });

    it("is disabled when no products are available", () => {
      render(<RecordSaleButton availableProducts={[]} />);
      expect(screen.getByRole("button", { name: /record sale/i })).toBeDisabled();
    });
  });

  describe("modal open/close", () => {
    it("opens the modal when Record Sale is clicked", async () => {
      const user = userEvent.setup();
      render(<RecordSaleButton availableProducts={[productNoSizes]} />);
      await user.click(screen.getByRole("button", { name: /record sale/i }));
      expect(screen.getByRole("dialog", { hidden: true })).toBeInTheDocument();
    });

    it("closes the modal when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const modal = await openModal(user);
      await user.click(modal.getByRole("button", { name: /cancel/i, hidden: true }));
      // After close the dialog loses its open attribute
      expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
    });
  });

  describe("product without sizes", () => {
    it("does not render the Size select for a product with no sizes", async () => {
      const user = userEvent.setup();
      const modal = await openModal(user);
      expect(modal.queryByLabelText(/^size$/i)).not.toBeInTheDocument();
    });

    it("submits sale data without a size field", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const modal = await openModal(user);
      await user.click(modal.getByRole("button", { name: /save sale/i, hidden: true }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/sales",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining('"productId":"prod-1"'),
          })
        );
      });
    });
  });

  describe("product with sizes", () => {
    it("renders the Size select for a sized product", async () => {
      const user = userEvent.setup();
      const modal = await openModal(user, [productWithSizes]);
      expect(modal.getByLabelText(/^size$/i)).toBeInTheDocument();
    });

    it("only shows sizes with stock > 0", async () => {
      const user = userEvent.setup();
      const modal = await openModal(user, [productWithSizes]);
      const sizeSelect = modal.getByLabelText(/^size$/i) as HTMLSelectElement;
      const options = Array.from(sizeSelect.options).map((o) => o.value);
      expect(options).toContain("6");
      expect(options).toContain("7");
      expect(options).not.toContain("8"); // 0 quantity
    });

    it("shows an error and does not submit when no size is selected", async () => {
      const user = userEvent.setup();
      const modal = await openModal(user, [productWithSizes]);
      await user.click(modal.getByRole("button", { name: /save sale/i, hidden: true }));
      expect(await screen.findByText(/please select a size/i)).toBeInTheDocument();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("includes the selected size in the API payload", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const modal = await openModal(user, [productWithSizes]);
      await user.selectOptions(modal.getByLabelText(/^size$/i), "6");
      await user.click(modal.getByRole("button", { name: /save sale/i, hidden: true }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/sales",
          expect.objectContaining({
            body: expect.stringContaining('"size":"6"'),
          })
        );
      });
    });
  });

  describe("product selection", () => {
    it("pre-fills the sale price with the first product's selling price", async () => {
      const user = userEvent.setup();
      const modal = await openModal(user, [productNoSizes, productWithSizes]);
      const priceInput = modal.getByLabelText(/sale price/i) as HTMLInputElement;
      expect(priceInput.value).toBe("45");
    });

    it("updates the sale price when a different product is selected", async () => {
      const user = userEvent.setup();
      const modal = await openModal(user, [productNoSizes, productWithSizes]);
      await user.selectOptions(modal.getByLabelText(/item sold/i), "prod-2");
      const priceInput = modal.getByLabelText(/sale price/i) as HTMLInputElement;
      expect(priceInput.value).toBe("80");
    });
  });

  describe("API error handling", () => {
    it("displays an error message when the API returns an error", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Insufficient stock" }),
      });

      const modal = await openModal(user);
      await user.click(modal.getByRole("button", { name: /save sale/i, hidden: true }));
      expect(await screen.findByText(/insufficient stock/i)).toBeInTheDocument();
    });

    it("refreshes the router on successful submission", async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      const modal = await openModal(user);
      await user.click(modal.getByRole("button", { name: /save sale/i, hidden: true }));
      await waitFor(() => expect(mockRefresh).toHaveBeenCalledTimes(1));
    });
  });
});
