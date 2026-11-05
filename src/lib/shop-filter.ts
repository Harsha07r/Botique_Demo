import { AVAILABILITY, CATEGORIES, COLOURS, OCCASIONS, PRICE_BANDS, SORTS } from "./taxonomy";
import type { ProductCard } from "./types";

export interface Filters {
  category: string;
  occasion: string;
  colour: string;
  price: string;
  availability: string;
  sort: string;
  q: string;
}

export const FILTER_KEYS = ["category", "occasion", "colour", "price", "availability"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

type Read = { get(name: string): string | null };

const valid = (list: readonly { value: string }[], v: string | null) => (v && list.some((x) => x.value === v) ? v : "");

/** Unknown or tampered values are dropped, so a bad link never produces an empty shop. */
export function parseFilters(sp: Read): Filters {
  return {
    category: valid(CATEGORIES, sp.get("category")),
    occasion: valid(OCCASIONS, sp.get("occasion")),
    colour: valid(COLOURS, sp.get("colour")),
    price: valid(PRICE_BANDS, sp.get("price")),
    availability: valid(AVAILABILITY, sp.get("availability")),
    sort: valid(SORTS, sp.get("sort")) || "new",
    q: (sp.get("q") ?? "").trim().slice(0, 60),
  };
}

export function applyFilters(all: ProductCard[], f: Filters): ProductCard[] {
  const band = PRICE_BANDS.find((b) => b.value === f.price);
  const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  const out = all.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.occasion && !p.occasions.includes(f.occasion)) return false;
    if (f.colour && p.colourFamily !== f.colour) return false;
    if (f.availability && p.availability !== f.availability) return false;
    if (band && !(p.price >= band.min && p.price < band.max)) return false;
    if (terms.length) {
      const hay = `${p.name} ${p.sku} ${p.colourName} ${p.category.replace("-", " ")} ${p.occasions.join(" ")}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
  const soldLast = (a: ProductCard, b: ProductCard) => Number(a.availability === "sold_out") - Number(b.availability === "sold_out");
  switch (f.sort) {
    case "price-asc": return out.sort((a, b) => soldLast(a, b) || a.price - b.price);
    case "price-desc": return out.sort((a, b) => soldLast(a, b) || b.price - a.price);
    case "featured": return out.sort((a, b) => soldLast(a, b) || Number(b.featured) - Number(a.featured) || b.addedOn.localeCompare(a.addedOn));
    default: return out.sort((a, b) => soldLast(a, b) || b.addedOn.localeCompare(a.addedOn));
  }
}
