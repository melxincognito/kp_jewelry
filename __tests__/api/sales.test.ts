/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { POST } from "@/app/api/sales/route";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  db: {
    product: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
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
  return new NextRequest("http://localhost/api/sales", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const productNoSizes = {
  id: "prod-1",
  name: "Franco Chain",
  sellingPrice: 45,
  quantity: 5,
  status: "AVAILABLE",
  sizes: [],
};

const productWithSizes = {
  id: "prod-2",
  name: "Gold Ring",
  sellingPrice: 80,
  quantity: 10,
  status: "AVAILABLE",
  sizes: [
    { id: "sz-1", productId: "prod-2", size: "6", quantity: 3 },
    { id: "sz-2", productId: "prod-2", size: "7", quantity: 0 },
  ],
};

const createdSale = {
  id: "sale-1",
  productId: "prod-1",
  salePrice: 45,
  soldAt: new Date("2024-06-01"),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/sales", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue(makeAdminSession());
    db.product.findUnique.mockResolvedValue(productNoSizes);
    db.user.findUnique.mockResolvedValue(null);
    db.$transaction.mockImplementation((fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        productSize: { updateMany: jest.fn().mockResolvedValue({}) },
        product: { update: jest.fn().mockResolvedValue({}) },
        sale: { create: jest.fn().mockResolvedValue(createdSale) },
      })
    );
  });

  describe("authentication", () => {
    it("returns 401 when there is no session", async () => {
      auth.mockResolvedValueOnce(null);
      const res = await POST(post({ productId: "prod-1", salePrice: 45, soldAt: "2024-06-01" }));
      expect(res.status).toBe(401);
    });

    it("returns 401 when the user is not ADMIN", async () => {
      auth.mockResolvedValueOnce({ user: { role: "USER", id: "u1" } });
      const res = await POST(post({ productId: "prod-1", salePrice: 45, soldAt: "2024-06-01" }));
      expect(res.status).toBe(401);
    });
  });

  describe("validation", () => {
    it("returns 400 when productId is missing", async () => {
      const res = await POST(post({ salePrice: 45, soldAt: "2024-06-01" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when salePrice is zero", async () => {
      const res = await POST(post({ productId: "prod-1", salePrice: 0, soldAt: "2024-06-01" }));
      expect(res.status).toBe(400);
    });

    it("returns 400 when soldAt is missing", async () => {
      const res = await POST(post({ productId: "prod-1", salePrice: 45 }));
      expect(res.status).toBe(400);
    });

    it("returns 400 for an invalid buyer email", async () => {
      const res = await POST(
        post({ productId: "prod-1", salePrice: 45, soldAt: "2024-06-01", buyerEmail: "not-an-email" })
      );
      expect(res.status).toBe(400);
    });
  });

  describe("product checks", () => {
    it("returns 404 when the product does not exist", async () => {
      db.product.findUnique.mockResolvedValueOnce(null);
      const res = await POST(post({ productId: "ghost", salePrice: 45, soldAt: "2024-06-01" }));
      expect(res.status).toBe(404);
    });

    it("returns 400 when the product is out of stock", async () => {
      db.product.findUnique.mockResolvedValueOnce({ ...productNoSizes, quantity: 0 });
      const res = await POST(post({ productId: "prod-1", salePrice: 45, soldAt: "2024-06-01" }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/out of stock/i);
    });

    it("returns 400 when product is already marked SOLD", async () => {
      db.product.findUnique.mockResolvedValueOnce({ ...productNoSizes, status: "SOLD" });
      const res = await POST(post({ productId: "prod-1", salePrice: 45, soldAt: "2024-06-01" }));
      expect(res.status).toBe(400);
    });
  });

  describe("size handling", () => {
    it("returns 400 when a sized product receives no size", async () => {
      db.product.findUnique.mockResolvedValueOnce(productWithSizes);
      const res = await POST(post({ productId: "prod-2", salePrice: 80, soldAt: "2024-06-01" }));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/select a size/i);
    });

    it("returns 400 when the selected size is not found on the product", async () => {
      db.product.findUnique.mockResolvedValueOnce(productWithSizes);
      const res = await POST(
        post({ productId: "prod-2", size: "9", salePrice: 80, soldAt: "2024-06-01" })
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/not found/i);
    });

    it("returns 400 when the selected size is out of stock", async () => {
      db.product.findUnique.mockResolvedValueOnce(productWithSizes);
      const res = await POST(
        post({ productId: "prod-2", size: "7", salePrice: 80, soldAt: "2024-06-01" }) // qty: 0
      );
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/out of stock/i);
    });

    it("accepts a valid size with stock", async () => {
      db.product.findUnique.mockResolvedValueOnce(productWithSizes);
      const res = await POST(
        post({ productId: "prod-2", size: "6", salePrice: 80, soldAt: "2024-06-01" })
      );
      expect(res.status).toBe(201);
    });

    it("calls productSize.updateMany to decrement the size stock", async () => {
      db.product.findUnique.mockResolvedValueOnce(productWithSizes);
      const sizeUpdateMany = jest.fn().mockResolvedValue({});
      db.$transaction.mockImplementationOnce((fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          productSize: { updateMany: sizeUpdateMany },
          product: { update: jest.fn().mockResolvedValue({}) },
          sale: { create: jest.fn().mockResolvedValue(createdSale) },
        })
      );

      await POST(post({ productId: "prod-2", size: "6", salePrice: 80, soldAt: "2024-06-01" }));
      expect(sizeUpdateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { productId: "prod-2", size: "6" },
          data: { quantity: { decrement: 1 } },
        })
      );
    });

    it("does not call productSize.updateMany for a product without sizes", async () => {
      const sizeUpdateMany = jest.fn().mockResolvedValue({});
      db.$transaction.mockImplementationOnce((fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          productSize: { updateMany: sizeUpdateMany },
          product: { update: jest.fn().mockResolvedValue({}) },
          sale: { create: jest.fn().mockResolvedValue(createdSale) },
        })
      );

      await POST(post({ productId: "prod-1", salePrice: 45, soldAt: "2024-06-01" }));
      expect(sizeUpdateMany).not.toHaveBeenCalled();
    });
  });

  describe("successful sale", () => {
    it("returns 201 with the created sale", async () => {
      const res = await POST(post({ productId: "prod-1", salePrice: 45, soldAt: "2024-06-01" }));
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.id).toBe("sale-1");
    });

    it("decrements the product quantity in the transaction", async () => {
      const productUpdate = jest.fn().mockResolvedValue({});
      db.$transaction.mockImplementationOnce((fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          productSize: { updateMany: jest.fn().mockResolvedValue({}) },
          product: { update: productUpdate },
          sale: { create: jest.fn().mockResolvedValue(createdSale) },
        })
      );

      await POST(post({ productId: "prod-1", salePrice: 45, soldAt: "2024-06-01" }));
      expect(productUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "prod-1" },
          data: expect.objectContaining({ quantity: 4 }), // 5 - 1
        })
      );
    });

    it("marks the product as SOLD when the last unit is sold", async () => {
      db.product.findUnique.mockResolvedValueOnce({ ...productNoSizes, quantity: 1 });
      const productUpdate = jest.fn().mockResolvedValue({});
      db.$transaction.mockImplementationOnce((fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          productSize: { updateMany: jest.fn().mockResolvedValue({}) },
          product: { update: productUpdate },
          sale: { create: jest.fn().mockResolvedValue(createdSale) },
        })
      );

      await POST(post({ productId: "prod-1", salePrice: 45, soldAt: "2024-06-01" }));
      expect(productUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ quantity: 0, status: "SOLD" }),
        })
      );
    });

    it("accepts an empty string for buyerEmail (in-person sale)", async () => {
      const res = await POST(
        post({ productId: "prod-1", salePrice: 45, soldAt: "2024-06-01", buyerEmail: "" })
      );
      expect(res.status).toBe(201);
    });
  });
});
