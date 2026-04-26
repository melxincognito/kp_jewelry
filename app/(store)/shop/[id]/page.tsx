import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiLink from "@mui/material/Link";
import { Badge } from "@/components/ui/Badge";
import { SendMessageForm } from "@/components/messages/SendMessageForm";
import type { Metadata } from "next";
import type { ProductStatus } from "@/types/enums";

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return { title: "Not Found" };
  return { title: product.name };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, session] = await Promise.all([db.product.findUnique({ where: { id } }), auth()]);

  if (!product || !product.showOnStorefront) notFound();

  const images: string[] = JSON.parse(product.images || "[]");
  const styles: string[] = JSON.parse(product.styles || "[]");

  const owner = await db.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, sm: 3, lg: 4 }, py: 6 }}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 5 }}>
        {/* Images */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ position: "relative", aspectRatio: "1", bgcolor: "#ede9e3", borderRadius: 0.5, overflow: "hidden" }}>
            {images[0] ? (
              <Image src={images[0]} alt={`${product.name} — main photo`} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: "cover" }} priority />
            ) : (
              <Box aria-hidden="true" sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "3rem", opacity: 0.2 }}>
                💎
              </Box>
            )}
          </Box>
          {images.length > 1 && (
            <Box component="ul" role="list" aria-label="Additional photos" sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, listStyle: "none", p: 0, m: 0 }}>
              {images.slice(1).map((img, i) => (
                <Box key={i} component="li" role="listitem" sx={{ position: "relative", aspectRatio: "1", bgcolor: "#ede9e3", borderRadius: 0.5, overflow: "hidden" }}>
                  <Image src={img} alt={`${product.name} — photo ${i + 2}`} fill sizes="80px" style={{ objectFit: "cover" }} />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Details */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Badge variant={statusVariant[product.status as ProductStatus]}>{statusLabel[product.status as ProductStatus]}</Badge>
              <Badge variant="outline" className="capitalize">{product.jewelryType.replace("_", " ").toLowerCase()}</Badge>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
              {product.name}
            </Typography>
            <Typography sx={{ fontSize: "1.875rem", fontWeight: 700, color: "primary.main" }}>
              ${product.sellingPrice.toFixed(2)}
            </Typography>
          </Box>

          {styles.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {styles.map((style) => (
                <Badge key={style} variant="gold">{style}</Badge>
              ))}
            </Box>
          )}

          {product.description && (
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
              {product.description}
            </Typography>
          )}

          <Box component="hr" className="divider-gold" sx={{ border: "none" }} />

          {/* Contact / Message section */}
          {product.status === "SOLD" ? (
            <Typography variant="body2" sx={{ color: "text.secondary", opacity: 0.6, fontStyle: "italic" }}>
              This item has been sold.
            </Typography>
          ) : session && owner ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography sx={{ fontSize: "0.625rem", letterSpacing: "0.2em", color: "primary.main", textTransform: "uppercase" }}>
                Interested?
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Send a message to coordinate payment and pickup.
              </Typography>
              <SendMessageForm productId={product.id} recipientId={owner.id} />
            </Box>
          ) : !session ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography sx={{ fontSize: "0.625rem", letterSpacing: "0.2em", color: "primary.main", textTransform: "uppercase" }}>
                Interested?
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                <MuiLink href="/register" sx={{ color: "primary.main" }}>
                  Create a free account
                </MuiLink>{" "}
                or{" "}
                <MuiLink href="/login" sx={{ color: "primary.main" }}>
                  sign in
                </MuiLink>{" "}
                to send a message to the seller.
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}
