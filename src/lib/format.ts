const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
export const formatPrice = (n: number) => `₹${inr.format(n)}`;

export const AVAILABILITY_LABEL = {
  in_stock: "In stock",
  made_to_order: "Made to order",
  sold_out: "Sold out",
} as const;

/** Alt text built from fabric, colour and product name, per photo slot. */
export function buildAlt(p: { name: string; fabric: string; colourName: string }, label: string) {
  return `${p.name}, ${p.colourName.toLowerCase()} ${p.fabric.toLowerCase()}: ${label.toLowerCase()}`;
}
