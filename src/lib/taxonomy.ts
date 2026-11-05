export const CATEGORIES = [
  { value: "silk-sarees", label: "Silk sarees" },
  { value: "cotton-sarees", label: "Cotton sarees" },
  { value: "designer-sarees", label: "Designer sarees" },
  { value: "kurta-sets", label: "Kurta sets" },
  { value: "lehengas", label: "Lehengas" },
] as const;

export const OCCASIONS = [
  { value: "wedding", label: "Wedding" },
  { value: "festive", label: "Festive" },
  { value: "party", label: "Party" },
  { value: "puja", label: "Puja" },
  { value: "office", label: "Office" },
  { value: "casual", label: "Everyday" },
] as const;

/** hex is used for filter swatches and the placeholder artwork only */
export const COLOURS = [
  { value: "red", label: "Red", hex: "#B3202F" },
  { value: "maroon", label: "Maroon", hex: "#6E1A2E" },
  { value: "pink", label: "Pink", hex: "#E7A1B5" },
  { value: "orange", label: "Orange / Peach", hex: "#EE9B6B" },
  { value: "yellow", label: "Yellow", hex: "#D9A621" },
  { value: "green", label: "Green", hex: "#1F6B58" },
  { value: "blue", label: "Blue", hex: "#233E78" },
  { value: "purple", label: "Purple", hex: "#8F78B8" },
  { value: "white", label: "White / Ivory", hex: "#EFE6D3" },
  { value: "black", label: "Black", hex: "#1E1A1C" },
  { value: "gold", label: "Gold", hex: "#B8893B" },
  { value: "multi", label: "Multicolour", hex: "#8A5A9E" },
] as const;

export const PRICE_BANDS = [
  { value: "u3", label: "Under ₹3,000", min: 0, max: 3000 },
  { value: "3-8", label: "₹3,000 – ₹8,000", min: 3000, max: 8000 },
  { value: "8-15", label: "₹8,000 – ₹15,000", min: 8000, max: 15000 },
  { value: "15p", label: "₹15,000 and above", min: 15000, max: Infinity },
] as const;

export const AVAILABILITY = [
  { value: "in_stock", label: "In stock" },
  { value: "made_to_order", label: "Made to order" },
  { value: "sold_out", label: "Sold out" },
] as const;

export const SORTS = [
  { value: "new", label: "Newest first" },
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export const labelOf = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((x) => x.value === v)?.label ?? v;

export const hexOf = (family: string) => COLOURS.find((c) => c.value === family)?.hex ?? "#8A5A9E";
