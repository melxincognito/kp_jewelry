/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { POST } from "@/app/api/products/route";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    product: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/exchange-rate", () => ({
  getHistoricalRate: jest.fn().mockResolvedValue({ usdPerMxn: 0.058, mxnPerUsd: 17.24 }),
  mxnToUsd: jest.fn().mockReturnValue(20.3),
  toApiDate: jest.fn().mockReturnValue("2024-03-01"),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const { auth } = require("@/lib/auth");
const { db } = require("@/lib/db");

function makeAdminSession() {
  return { user: { role: "ADMIN", id: "admin-1" } };
}

function post(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validProduct = {
  name: "Cuban Link Necklace",
  costMXN: 350,
  purchaseDate: "2024-03-01",
  wholesalePrice: 25,
  sellingPrice: 45,
  jewelryType: "NECKLACE",
  quantity: 3,
  showOnStorefront: true,
};

const createdProduct = { id: "prod-1", ...validProduct, costUSD: 20.3, exchangeRate: 17.24 };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue(makeAdminSession());
    db.product.findFirst.mockResolvedValue(null); // no SKU conflicts by default
    db.product.create.mockResolvedValue(createdProduct);
  });

  describe("authentication", () => {
    it("returns 401 when there is no session", async () => {
      auth.mockResolvedValueOnce(null);
      const res = await POST(post(validProduct));
      expect(res.status).toBe(401);
    });

    it("returns 401 when the user is not an ADMIN", async () => {
      auth.mockResolvedValueOnce({ user: { role: "USER", id: "u1" } });
      const res = await POST(post(validProduct));
      expect(res.status).toBe(401);
    });
  });

  describe("validation", () => {
    it("returns 400 when the required name is missing", async () => {
      const { name: _, ...noName } = validProduct;
      const res = await POST(post(noName));
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid jewelry type", async () => {
      const res = await POST(post({ ...validProduct, jewelryType: "PURSE" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 for a negative selling price", async () => {
      const res = await POST(post({ ...validProduct, sellingPrice: -5 }));
      expect(res.status).toBe(400);
    });
  });

  describe("SKU uniqueness", () => {
    it("returns 400 when the SKU is already in use", async () => {
      db.product.findFirst.mockResolvedValueOnce({ id: "existing", sku: "NKL-001" });
      const res = await POST(post({ ...validProduct, sku: "NKL-001" }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/sku/i);
    });

    it("does not check for duplicate SKU when no SKU is submitted", async () => {
      const res = await POST(post(validProduct));
      expect(db.product.findFirst).not.toHaveBeenCalled();
      expect(res.status).toBe(201);
    });
  });

  describe("successful creation", () => {
    it("returns 201 with the created product", async () => {
      const res = await POST(post(validProduct));
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.id).toBe("prod-1");
    });

    it("calls db.product.create with the correct payload", async () => {
      await POST(post(validProduct));
      expect(db.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Cuban Link Necklace",
            jewelryType: "NECKLACE",
          }),
        })
      );
    });
  });

  describe("sized products", () => {
    it("uses the sum of size quantities as the product quantity", async () => {
      const productWithSizes = {
        ...validProduct,
        quantity: 0,
        sizes: [
          { size: "6", quantity: 5 },
          { size: "7", quantity: 3 },
        ],
      };
      await POST(post(productWithSizes));
      expect(db.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantity: 8 }),
        })
      );
    });

    it("includes nested sizes create when sizes are provided", async () => {
      const productWithSizes = {
        ...validProduct,
        sizes: [{ size: "M", quantity: 10 }],
      };
      await POST(post(productWithSizes));
      expect(db.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sizes: { create: [{ size: "M", quantity: 10 }] },
          }),
        })
      );
    });

    it("does not include sizes key when no sizes are submitted", async () => {
      await POST(post(validProduct));
      const callArg = db.product.create.mock.calls[0][0].data;
      expect(callArg).not.toHaveProperty("sizes");
    });
  });

  describe("exchange rate", () => {
    it("falls back gracefully when exchange rate API fails", async () => {
      const { getHistoricalRate } = require("@/lib/exchange-rate");
      getHistoricalRate.mockRejectedValueOnce(new Error("Network error"));

      const res = await POST(post(validProduct));
      // Should still succeed — falls back to raw costMXN
      expect(res.status).toBe(201);
    });
  });
});
