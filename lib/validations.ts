import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  costMXN: z.coerce.number().positive("Cost in pesos must be positive"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  shippingFees: z.coerce.number().min(0).default(0),
  wholesalePrice: z.coerce.number().positive("Wholesale price must be positive"),
  sellingPrice: z.coerce.number().positive("Selling price must be positive"),
  jewelryType: z.enum([
    "NECKLACE",
    "BRACELET",
    "RING",
    "EARRING",
    "CHARM",
    "NOSE_RING",
    "CLIP",
    "OTHER",
  ]),
  styles: z.array(z.string()).default([]),
  quantity: z.coerce.number().int().positive().default(1),
});

export const saleSchema = z.object({
  productId: z.string().min(1),
  salePrice: z.coerce.number().positive("Sale price must be positive"),
  buyerEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
  soldAt: z.string().min(1, "Sale date is required"),
});

export const messageSchema = z.object({
  productId: z.string().min(1),
  recipientId: z.string().min(1),
  body: z.string().min(1, "Message cannot be empty").max(2000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
