import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { SendMessageForm } from "@/components/messages/SendMessageForm";
import type { Metadata } from "next";
import type { ProductStatus } from "@/types/enums";

const statusVariant: Record<
  ProductStatus,
  "status-available" | "status-reserved" | "status-sold"
> = {
  AVAILABLE: "status-available",
  RESERVED: "status-reserved",
  SOLD: "status-sold",
};

const statusLabel: Record<ProductStatus, string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  SOLD: "Sold",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return { title: "Not Found" };
  return { title: product.name };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, session] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    auth(),
  ]);

  if (!product) notFound();

  const images: string[] = JSON.parse(product.images || "[]");
  const styles: string[] = JSON.parse(product.styles || "[]");

  // Find the store owner (first ADMIN user) to message
  const owner = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square bg-[var(--black-soft)] rounded-sm overflow-hidden">
            {images[0] ? (
              <Image
                src={images[0]}
                alt={`${product.name} — main photo`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div aria-hidden="true" className="flex items-center justify-center h-full text-5xl opacity-20">
                💎
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2" role="list" aria-label="Additional photos">
              {images.slice(1).map((img, i) => (
                <div
                  key={i}
                  role="listitem"
                  className="relative aspect-square bg-[var(--black-soft)] rounded-sm overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`${product.name} — photo ${i + 2}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={statusVariant[product.status]}>
                {statusLabel[product.status]}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {product.jewelryType.replace("_", " ").toLowerCase()}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--white)] mb-1">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-[var(--gold)]">
              ${product.sellingPrice.toFixed(2)}
            </p>
          </div>

          {styles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {styles.map((style) => (
                <Badge key={style} variant="gold">
                  {style}
                </Badge>
              ))}
            </div>
          )}

          {product.description && (
            <p className="text-sm text-[var(--white-dim)] leading-relaxed">
              {product.description}
            </p>
          )}

          <hr className="divider-gold" />

          {/* Contact / Message section */}
          {product.status === "SOLD" ? (
            <p className="text-sm text-[var(--white-dim)]/60 italic">
              This item has been sold.
            </p>
          ) : session && owner ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs tracking-[0.2em] text-[var(--gold)] uppercase">
                Interested?
              </p>
              <p className="text-xs text-[var(--white-dim)]">
                Send a message to coordinate payment and pickup.
              </p>
              <SendMessageForm
                productId={product.id}
                recipientId={owner.id}
              />
            </div>
          ) : !session ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs tracking-[0.2em] text-[var(--gold)] uppercase">
                Interested?
              </p>
              <p className="text-sm text-[var(--white-dim)]">
                <a href="/register" className="text-[var(--gold)] hover:underline">
                  Create a free account
                </a>{" "}
                or{" "}
                <a href="/login" className="text-[var(--gold)] hover:underline">
                  sign in
                </a>{" "}
                to send a message to the seller.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
