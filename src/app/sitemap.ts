import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts();
  return [
    ...["", "/shop", "/about", "/contact", "/policies"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const })),
    ...products.map((p) => ({ url: `${base}/p/${p.sku}`, lastModified: p.addedOn, changeFrequency: "weekly" as const })),
  ];
}
