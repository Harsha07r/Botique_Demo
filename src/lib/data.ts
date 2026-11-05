import { createClient } from "next-sanity";
import seed from "../../data/products.seed.json";
import { defaultAbout, defaultContact, defaultHome, defaultPolicies, defaultSettings } from "./defaults";
import { demoProductImage } from "./demo-images";
import { buildAlt } from "./format";
import { hasSanity } from "./site";
import {
  PHOTO_SLOTS,
  type HomeContent,
  type PageContent,
  type PhotoKey,
  type Product,
  type ProductCard,
  type ProductImage,
  type SiteImage,
  type SiteSettings,
} from "./types";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "missing-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-01-01",
  useCdn: true,
  perspective: "published",
});

/** Pages refresh within ~60s of a publish; the webhook (see README) makes it instant. */
export const REVALIDATE_SECONDS = 60;
export const CMS_TAG = "sanity";

function fetchCms<T>(query: string, params: Record<string, unknown> = {}) {
  return client.fetch<T>(query, params, { next: { revalidate: REVALIDATE_SECONDS, tags: [CMS_TAG] } });
}

/** Ask the Sanity CDN for a bounded size so the Next.js optimiser never downloads a 10 MB original. */
const sized = (url: string) => `${url}?w=1440&fit=max`;

const imgProjection = `{ "url": asset->url, "blur": asset->metadata.lqip }`;

/* ------------------------------ products ------------------------------ */

interface RawProduct extends Omit<Product, "images" | "colourOptions" | "occasions"> {
  colourOptions?: string[] | null;
  occasions?: string[] | null;
  photos?: Partial<Record<PhotoKey, { url?: string; blur?: string } | null>> | null;
}

const PRODUCT_FIELDS = `
  sku, name, category, occasions, colourFamily, colourName, colourOptions, fabric, weave, length,
  blouseIncluded, care, description, price, availability, featured,
  "addedOn": coalesce(addedOn, string(_createdAt)),
  "photos": {
    "full": photos.full ${imgProjection},
    "pallu": photos.pallu ${imgProjection},
    "border": photos.border ${imgProjection},
    "blouse": photos.blouse ${imgProjection},
    "texture": photos.texture ${imgProjection},
    "extra": photos.extra ${imgProjection}
  }`;

// Defence in depth: the Studio blocks publishing with fewer than 3 photos, and the site refuses to show it too.
const PUBLISHABLE = `_type == "product" && defined(sku) && defined(photos.full.asset) && defined(photos.pallu.asset) && defined(photos.border.asset)`;

function toProduct(raw: RawProduct): Product {
  const base = {
    name: raw.name,
    fabric: raw.fabric,
    colourName: raw.colourName,
  };
  const images: ProductImage[] = [];
  for (const slot of PHOTO_SLOTS) {
    const p = raw.photos?.[slot.key];
    if (raw.photos && !p?.url) continue;
    // Seed/demo mode (no photos object at all): show the first five slots as placeholders
    if (!raw.photos && (slot.key === "extra")) continue;
    const demo = !raw.photos ? demoProductImage(raw.sku, slot.key, raw.colourFamily) : null;
    images.push({
      key: slot.key,
      label: slot.label,
      url: p?.url ? sized(p.url) : demo?.url,
      blur: p?.blur ?? demo?.blur,
      alt: buildAlt(base, slot.label),
    });
  }
  return {
    ...raw,
    colourOptions: raw.colourOptions?.length ? raw.colourOptions : [raw.colourName],
    occasions: raw.occasions ?? [],
    addedOn: String(raw.addedOn).slice(0, 10),
    images,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSanity) {
    return (seed as unknown as RawProduct[]).map(toProduct).sort((a, b) => b.addedOn.localeCompare(a.addedOn));
  }
  const rows = await fetchCms<RawProduct[]>(`*[${PUBLISHABLE}] | order(coalesce(addedOn, string(_createdAt)) desc) { ${PRODUCT_FIELDS} }`);
  return rows.map(toProduct);
}

export async function getProduct(sku: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.sku.toLowerCase() === sku.toLowerCase()) ?? null;
}

export function toCard(p: Product): ProductCard {
  const cover = p.images[0];
  return {
    sku: p.sku,
    name: p.name,
    category: p.category,
    occasions: p.occasions,
    colourFamily: p.colourFamily,
    colourName: p.colourName,
    price: p.price,
    availability: p.availability,
    featured: p.featured,
    addedOn: p.addedOn,
    image: { url: cover?.url, blur: cover?.blur, alt: cover?.alt ?? p.name },
  };
}

/* --------------------------- site content --------------------------- */

interface RawImage {
  url?: string;
  blur?: string;
  alt?: string;
}
const toSiteImage = (i: RawImage | null | undefined, fallbackAlt: string): SiteImage | undefined =>
  i?.url ? { url: `${i.url}?w=1440&fit=max`, blur: i.blur, alt: i.alt || fallbackAlt } : undefined;

const siteImg = (field: string) => `"${field}": ${field} { "url": asset->url, "blur": asset->metadata.lqip, alt }`;

export async function getSettings(): Promise<SiteSettings> {
  if (!hasSanity) return defaultSettings;
  const raw = await fetchCms<(Partial<SiteSettings> & { shopPhoto?: RawImage }) | null>(
    `*[_id == "siteSettings"][0]{ shopName, fullName, mapCid, tagline, whatsappNumber, phone, email, instagram, address, mapQuery, hours, deliveryInfo, reviews, ${siteImg("shopPhoto")} }`,
  );
  if (!raw) return defaultSettings;
  return {
    shopName: raw.shopName || defaultSettings.shopName,
    fullName: raw.fullName || defaultSettings.fullName,
    mapCid: raw.mapCid || defaultSettings.mapCid,
    googleRating: defaultSettings.googleRating,
    tagline: raw.tagline || defaultSettings.tagline,
    whatsappNumber: raw.whatsappNumber || defaultSettings.whatsappNumber,
    phone: raw.phone || defaultSettings.phone,
    email: raw.email || undefined,
    instagram: raw.instagram || undefined,
    address: raw.address || defaultSettings.address,
    mapQuery: raw.mapQuery || raw.address || defaultSettings.mapQuery,
    hours: raw.hours?.length ? raw.hours : defaultSettings.hours,
    deliveryInfo: raw.deliveryInfo?.length ? raw.deliveryInfo : defaultSettings.deliveryInfo,
    reviews: raw.reviews?.length ? raw.reviews : [],
    shopPhoto: toSiteImage(raw.shopPhoto, "Our shop in Tanuku"),
  };
}

export async function getHome(): Promise<HomeContent> {
  if (!hasSanity) return defaultHome;
  const raw = await fetchCms<
    (Partial<Omit<HomeContent, "heroImage" | "occasionTiles">> & {
      heroImage?: RawImage;
      occasionTiles?: { title: string; occasion: string; image?: RawImage }[];
    }) | null
  >(`*[_id == "homePage"][0]{ heroTitle, heroSubtitle, heroCta, ${siteImg("heroImage")}, occasionTiles[]{ title, occasion, ${siteImg("image")} } }`);
  if (!raw) return defaultHome;
  return {
    heroTitle: raw.heroTitle || defaultHome.heroTitle,
    heroSubtitle: raw.heroSubtitle || defaultHome.heroSubtitle,
    heroCta: raw.heroCta || defaultHome.heroCta,
    heroImage: toSiteImage(raw.heroImage, raw.heroTitle || "Vastrika"),
    occasionTiles: raw.occasionTiles?.length
      ? raw.occasionTiles.map((t) => ({ title: t.title, occasion: t.occasion, image: toSiteImage(t.image, t.title) }))
      : defaultHome.occasionTiles,
  };
}

const PAGE_DEFAULTS = { aboutPage: defaultAbout, contactPage: defaultContact, policyPage: defaultPolicies } as const;
export type PageId = keyof typeof PAGE_DEFAULTS;

export async function getPage(id: PageId): Promise<PageContent> {
  const fallback = PAGE_DEFAULTS[id];
  if (!hasSanity) return fallback;
  const raw = await fetchCms<(Omit<PageContent, "image"> & { image?: RawImage }) | null>(
    `*[_id == $id][0]{ title, intro, body, ${siteImg("image")} }`,
    { id },
  );
  if (!raw) return fallback;
  return {
    title: raw.title || fallback.title,
    intro: raw.intro || fallback.intro,
    body: raw.body?.length ? raw.body : fallback.body,
    image: toSiteImage(raw.image, raw.title || ""),
  };
}
