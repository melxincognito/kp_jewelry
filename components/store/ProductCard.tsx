"use client";

import Image from "next/image";
import NextLink from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Badge } from "@/components/ui/Badge";
import type { Product } from "@/app/generated/prisma";
import type { ProductStatus } from "@/types/enums";

interface ProductCardProps {
  product: Product;
}

const statusVariant: Record<ProductStatus, "status-available" | "status-reserved" | "status-sold"> = {
  AVAILABLE: "status-available",
  RESERVED: "status-reserved",
  SOLD: "status-sold",
};

const statusLabel: Record<ProductStatus, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
};

export function ProductCard({ product }: ProductCardProps) {
  const images: string[] = JSON.parse(product.images || "[]");
  const firstImage = images[0] ?? null;
  const styles: string[] = JSON.parse(product.styles || "[]");

  const statusText = statusLabel[product.status as ProductStatus] ?? product.status;
  const typeText = product.jewelryType.replace("_", " ").toLowerCase();

  return (
    <Card
      component={NextLink}
      href={`/shop/${product.id}`}
      aria-label={`${product.name} — $${product.sellingPrice.toFixed(2)} — ${statusText}`}
      sx={{
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        "&:hover": { borderColor: "rgba(122,92,16,0.4)" },
        transition: "border-color 0.15s",
      }}
    >
      <CardActionArea sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        {/* Image */}
        <Box
          sx={{
            position: "relative",
            aspectRatio: "1",
            bgcolor: "#ddd6cc",
            overflow: "hidden",
          }}
        >
          {firstImage ? (
            <Image
              src={firstImage}
              alt={`${product.name}, ${typeText}, ${statusText}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ objectFit: "cover", transition: "transform 0.3s" }}
            />
          ) : (
            <Box
              aria-hidden="true"
              sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "2rem", opacity: 0.2 }}
            >
              💎
            </Box>
          )}
          {product.status !== "AVAILABLE" && (
            <Box sx={{ position: "absolute", top: 8, left: 8 }}>
              <Badge variant={statusVariant[product.status as ProductStatus]}>
                {statusLabel[product.status as ProductStatus]}
              </Badge>
            </Box>
          )}
        </Box>

        {/* Info */}
        <CardContent sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              "&:hover": { color: "primary.main" },
              transition: "color 0.15s",
            }}
          >
            {product.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
              ${product.sellingPrice.toFixed(2)}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.5, textTransform: "capitalize" }}>
              {typeText}
            </Typography>
          </Box>
          {styles.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.25 }}>
              {styles.slice(0, 2).map((style) => (
                <Badge key={style} variant="gold">
                  <Typography sx={{ fontSize: "0.6rem" }}>{style}</Typography>
                </Badge>
              ))}
              {styles.length > 2 && (
                <Badge variant="outline">
                  <Typography sx={{ fontSize: "0.6rem" }}>+{styles.length - 2}</Typography>
                </Badge>
              )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
