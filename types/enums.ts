// String literal types that replace Prisma enums (SQL Server does not support native enums).
// These are enforced at the application layer via Zod validations.

export type Role = "ADMIN" | "CUSTOMER";

export type JewelryType =
  | "NECKLACE"
  | "BRACELET"
  | "RING"
  | "EARRING"
  | "CHARM"
  | "NOSE_RING"
  | "CLIP"
  | "OTHER";

export type ProductStatus = "AVAILABLE" | "RESERVED" | "SOLD";
