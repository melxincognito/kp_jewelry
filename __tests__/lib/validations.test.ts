import { productSchema, saleSchema, registerSchema, loginSchema } from "@/lib/validations";

// ── productSchema ─────────────────────────────────────────────────────────────

describe("productSchema", () => {
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

  it("accepts a valid product with required fields", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("accepts optional fields: sku, material, description, sizes", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      sku: "NKL-001",
      material: "Gold",
      description: "A beautiful chain",
      sizes: [{ size: "18 inch", quantity: 2 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing required name", () => {
    const { name: _, ...noName } = validProduct;
    const result = productSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  it("rejects a negative selling price", () => {
    const result = productSchema.safeParse({ ...validProduct, sellingPrice: -10 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid jewelry type", () => {
    const result = productSchema.safeParse({ ...validProduct, jewelryType: "PURSE" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid jewelry types", () => {
    const types = ["NECKLACE", "BRACELET", "RING", "EARRING", "CHARM", "NOSE_RING", "CLIP", "OTHER"];
    for (const jewelryType of types) {
      const result = productSchema.safeParse({ ...validProduct, jewelryType });
      expect(result.success).toBe(true);
    }
  });

  it("coerces string numbers to numbers for costMXN", () => {
    const result = productSchema.safeParse({ ...validProduct, costMXN: "350" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.costMXN).toBe(350);
  });

  it("rejects a size row with a blank label", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      sizes: [{ size: "", quantity: 5 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a size with a negative quantity", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      sizes: [{ size: "6", quantity: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it("defaults showOnStorefront to true when omitted", () => {
    const { showOnStorefront: _, ...noToggle } = validProduct;
    const result = productSchema.safeParse(noToggle);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.showOnStorefront).toBe(true);
  });
});

// ── saleSchema ────────────────────────────────────────────────────────────────

describe("saleSchema — from lib/validations", () => {
  const validSale = {
    productId: "clxyz123",
    salePrice: 45.0,
    soldAt: "2024-06-01",
  };

  it("accepts a valid sale with required fields", () => {
    const { saleSchema: localSchema } = require("@/lib/validations");
    const result = localSchema.safeParse(validSale);
    expect(result.success).toBe(true);
  });

  it("rejects a zero sale price", () => {
    const { saleSchema: localSchema } = require("@/lib/validations");
    const result = localSchema.safeParse({ ...validSale, salePrice: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid buyer email format", () => {
    const { saleSchema: localSchema } = require("@/lib/validations");
    const result = localSchema.safeParse({ ...validSale, buyerEmail: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("accepts an empty string for buyerEmail (in-person sale)", () => {
    const { saleSchema: localSchema } = require("@/lib/validations");
    const result = localSchema.safeParse({ ...validSale, buyerEmail: "" });
    expect(result.success).toBe(true);
  });
});

// ── registerSchema ────────────────────────────────────────────────────────────

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Melanie",
      email: "mel@example.com",
      password: "securepass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Mel",
      email: "mel@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email address", () => {
    const result = registerSchema.safeParse({
      name: "Mel",
      email: "not-valid",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});

// ── loginSchema ───────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  it("accepts a valid login", () => {
    const result = loginSchema.safeParse({ email: "mel@example.com", password: "anything" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "mel@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});
