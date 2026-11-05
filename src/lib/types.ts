export type Availability = "in_stock" | "made_to_order" | "sold_out";

export const PHOTO_SLOTS = [
  { key: "full", label: "Full piece" },
  { key: "pallu", label: "Pallu" },
  { key: "border", label: "Border" },
  { key: "blouse", label: "Blouse piece" },
  { key: "texture", label: "Texture close-up" },
  { key: "extra", label: "Extra view" },
] as const;
export type PhotoKey = (typeof PHOTO_SLOTS)[number]["key"];

export interface ProductImage {
  key: PhotoKey;
  label: string;
  /** undefined while the real photo has not been uploaded yet (placeholder shown) */
  url?: string;
  blur?: string;
  alt: string;
}

export interface Product {
  sku: string;
  name: string;
  category: string;
  occasions: string[];
  colourFamily: string;
  colourName: string;
  colourOptions: string[];
  fabric: string;
  weave: string;
  length?: number;
  blouseIncluded: boolean;
  care: string;
  description?: string;
  price: number;
  availability: Availability;
  featured: boolean;
  addedOn: string;
  images: ProductImage[];
}

/** Lightweight shape sent to the shop grid (keeps the payload small). */
export interface ProductCard {
  sku: string;
  name: string;
  category: string;
  occasions: string[];
  colourFamily: string;
  colourName: string;
  price: number;
  availability: Availability;
  featured: boolean;
  addedOn: string;
  image: { url?: string; blur?: string; alt: string };
}

export interface SiteImage {
  url: string;
  blur?: string;
  alt: string;
}

export interface SiteSettings {
  shopName: string;
  /** Full business name as on Google */
  fullName?: string;
  tagline: string;
  whatsappNumber: string;
  phone: string;
  email?: string;
  address: string;
  mapQuery: string;
  /** Google Maps place id: pins the exact listing */
  mapCid?: string;
  googleRating?: { score: number; count: number; url: string };
  instagram?: string;
  hours: { day: string; open: string }[];
  deliveryInfo: string[];
  reviews: { name: string; text: string; rating: number; source?: string }[];
  shopPhoto?: SiteImage;
}

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  heroImage?: SiteImage;
  occasionTiles: { title: string; occasion: string; image?: SiteImage }[];
}

/** Portable Text block (as stored by Sanity) */
export type RichBlock = { _type: string; _key: string; [k: string]: unknown };

export interface PageContent {
  title: string;
  intro?: string;
  /** Paragraphs of plain text (defaults) or Sanity Portable Text blocks */
  body: string[] | RichBlock[];
  image?: SiteImage;
}
