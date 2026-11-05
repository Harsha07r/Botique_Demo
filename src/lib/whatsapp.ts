import { formatPrice } from "./format";

export interface EnquiryItem {
  sku: string;
  name: string;
  colour: string;
  price: number;
}

export const productUrl = (origin: string, sku: string) => `${origin}/p/${encodeURIComponent(sku)}`;

export function waLink(number: string, text: string) {
  const digits = number.replace(/\D/g, "");
  // Without a number WhatsApp opens its contact picker, which is a safe fallback.
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

const itemBlock = (i: EnquiryItem, origin: string) =>
  [`SKU: ${i.sku}`, i.name, `Colour: ${i.colour}`, `Price: ${formatPrice(i.price)}`, productUrl(origin, i.sku)].join("\n");

export function singleMessage(shopName: string, item: EnquiryItem, origin: string, soldOut = false) {
  const ask = soldOut ? "I see it is sold out. When will you have something similar?" : "Is it available?";
  return `Hi ${shopName}, I'd like to enquire about this:\n\n${itemBlock(item, origin)}\n\n${ask}`;
}

export function listMessage(shopName: string, items: EnquiryItem[], origin: string) {
  const blocks = items.map((i, n) => `${n + 1}.\n${itemBlock(i, origin)}`).join("\n\n");
  return `Hi ${shopName}, I'd like to enquire about these ${items.length} items:\n\n${blocks}\n\nPlease share availability and delivery details.`;
}
