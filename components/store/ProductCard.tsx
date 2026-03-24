import Image from "next/image";
import Link from "next/link";
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

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group flex flex-col bg-[var(--black-card)] border border-[var(--black-border)] rounded-sm overflow-hidden hover:border-[var(--gold)]/40 transition-colors"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[var(--black-soft)] overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-3xl opacity-20">
            💎
          </div>
        )}
        {/* Status overlay badge */}
        {product.status !== "AVAILABLE" && (
          <div className="absolute top-2 left-2">
            <Badge variant={statusVariant[product.status]}>
              {statusLabel[product.status]}
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2">
        <p className="text-sm font-medium text-[var(--white)] line-clamp-1 group-hover:text-[var(--gold)] transition-colors">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[var(--gold)]">
            ${product.sellingPrice.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--white-dim)]/50 capitalize">
            {product.jewelryType.replace("_", " ").toLowerCase()}
          </p>
        </div>
        {styles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {styles.slice(0, 2).map((style) => (
              <Badge key={style} variant="gold" className="text-[10px]">
                {style}
              </Badge>
            ))}
            {styles.length > 2 && (
              <Badge variant="outline" className="text-[10px]">
                +{styles.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
