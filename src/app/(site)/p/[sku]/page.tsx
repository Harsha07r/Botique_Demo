import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityBadge } from "@/components/availability-badge";
import { Gallery } from "@/components/gallery";
import { JsonLd } from "@/components/json-ld";
import { ProductActions } from "@/components/product-actions";
import { ProductCard } from "@/components/product-card";
import { getProduct, getProducts, toCard } from "@/lib/data";
import { AVAILABILITY_LABEL, formatPrice } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { labelOf, CATEGORIES } from "@/lib/taxonomy";

export const revalidate = 60;
type Props = { params: Promise<{ sku: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ sku: p.sku }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const p = await getProduct(sku);
  if (!p) return { title: "Product not found", robots: { index: false } };
  const title = `${p.name} in ${p.colourName} | ${formatPrice(p.price)}`;
  const description = `${p.fabric}, ${p.weave}. ${AVAILABILITY_LABEL[p.availability]}. Enquire on WhatsApp with SKU ${p.sku}.`;
  return {
    title: { absolute: `${title} | Vastrika` },
    description,
    alternates: { canonical: `/p/${p.sku}` },
    // The image comes from opengraph-image.tsx in this folder (name, price and photo on one card)
    openGraph: { title, description, url: `/p/${p.sku}`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
    other: { "product:price:amount": String(p.price), "product:price:currency": "INR", "product:retailer_item_id": p.sku },
  };
}

export default async function ProductPage({ params }: Props) {
  const { sku } = await params;
  const [p, all] = await Promise.all([getProduct(sku), getProducts()]);
  if (!p) notFound();

  const related = all.filter((x) => x.sku !== p.sku && x.category === p.category).slice(0, 4).map(toCard);
  const origin = siteUrl();

  const rows: [string, string][] = [
    ["Fabric", p.fabric],
    ["Weave / work", p.weave],
    ...(p.length ? ([["Saree length", `${p.length} metres`]] as [string, string][]) : []),
    ["Blouse piece", p.blouseIncluded ? "Included" : "Not included"],
    ["Care", p.care],
    ["SKU", p.sku],
  ];

  return (
    <div className="mx-auto max-w-5xl px-0 pb-32 sm:px-4 sm:pt-6">
      <nav aria-label="Breadcrumb" className="px-4 py-2 text-sm text-muted sm:px-0">
        <Link href="/shop" className="underline">Shop</Link> /{" "}
        <Link href={`/shop?category=${p.category}`} className="underline">{labelOf(CATEGORIES, p.category)}</Link>
      </nav>
      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <Gallery images={p.images} colourFamily={p.colourFamily} />

        <div className="px-4 sm:px-0">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-bold leading-tight">{p.name}</h1>
            <AvailabilityBadge value={p.availability} className="mt-2 shrink-0" />
          </div>
          <p className="mt-1 text-2xl font-semibold text-maroon" data-testid="price">{formatPrice(p.price)}</p>
          {p.description && <p className="mt-3 text-muted">{p.description}</p>}

          <ProductActions sku={p.sku} name={p.name} price={p.price} availability={p.availability} colours={p.colourOptions} />

          <h2 className="mt-8 text-xl font-semibold">Details</h2>
          <dl className="mt-2 divide-y divide-line rounded-xl bg-paper ring-1 ring-line">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3 text-[0.95rem]">
                <dt className="font-semibold">{k}</dt>
                <dd className="text-muted">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-muted">
            Photographed in the same soft light for true colour. <Link href="/policies" className="underline">Delivery and returns</Link>
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="rel" className="mt-12 px-4 sm:px-0">
          <h2 id="rel" className="text-2xl font-semibold">More like this</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4">
            {related.map((r) => <ProductCard key={r.sku} p={r} source="related" />)}
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          sku: p.sku,
          name: p.name,
          description: p.description ?? `${p.fabric}, ${p.weave}`,
          color: p.colourName,
          material: p.fabric,
          ...(p.images[0]?.url ? { image: p.images.filter((i) => i.url).map((i) => i.url) } : {}),
          offers: {
            "@type": "Offer",
            url: `${origin}/p/${p.sku}`,
            priceCurrency: "INR",
            price: p.price,
            availability: p.availability === "sold_out" ? "https://schema.org/SoldOut" : p.availability === "made_to_order" ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
          },
        }}
      />
    </div>
  );
}
