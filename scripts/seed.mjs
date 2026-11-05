// Loads data/products.seed.json into Sanity as DRAFT products (no photos), so the owner can see them in the
// Studio, add the photos, and publish. Run once:
//
//   SANITY_API_WRITE_TOKEN=... NEXT_PUBLIC_SANITY_PROJECT_ID=... npm run seed
//
// The token is read from the environment only. Never commit it.
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (an Editor token) first.");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2025-01-01", useCdn: false });
const products = JSON.parse(readFileSync(new URL("../data/products.seed.json", import.meta.url), "utf8"));

const tx = client.transaction();
for (const p of products) {
  const { colourOptions, ...rest } = p;
  tx.createOrReplace({
    _id: `drafts.product-${p.sku}`, // draft: cannot go live until 3 photos are uploaded
    _type: "product",
    ...rest,
    colourOptions: colourOptions.length ? colourOptions : undefined,
  });
}
const res = await tx.commit();
console.log(`Created or updated ${res.results.length} draft products in ${projectId}/${dataset}.`);
console.log("Open /studio, add the photos, then Publish each product.");
