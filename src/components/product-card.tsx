import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductCard as Card } from "@/lib/types";
import { AddToListButton } from "./add-to-list-button";
import { AvailabilityBadge } from "./availability-badge";
import { ProductImage } from "./product-image";

export function ProductCard({ p, priority = false, source = "grid" }: { p: Card; priority?: boolean; source?: string }) {
  return (
    <article className="relative flex flex-col" data-testid="product-card" data-sku={p.sku}>
      <Link href={`/p/${p.sku}`} className="block overflow-hidden rounded-xl bg-paper ring-1 ring-line" aria-label={`${p.name}, ${formatPrice(p.price)}`}>
        <ProductImage
          image={p.image}
          colourFamily={p.colourFamily}
          priority={priority}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </Link>
      <div className="absolute right-2 top-2">
        <AddToListButton variant="icon" source={source} item={{ sku: p.sku, name: p.name, colour: p.colourName, price: p.price }} />
      </div>
      <div className="mt-2 flex flex-1 flex-col gap-1 px-0.5">
        <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-snug">
          <Link href={`/p/${p.sku}`}>{p.name}</Link>
        </h3>
        <p className="text-sm text-muted">{p.colourName}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="font-semibold">{formatPrice(p.price)}</span>
          {p.availability !== "in_stock" && <AvailabilityBadge value={p.availability} />}
        </div>
      </div>
    </article>
  );
}
