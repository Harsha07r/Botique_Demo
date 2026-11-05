import { defineField, defineType } from "sanity";
import { AVAILABILITY, CATEGORIES, COLOURS, OCCASIONS } from "../../src/lib/taxonomy";

/** 4:5 portrait check, read from the asset id (image-<hash>-<w>x<h>-<ext>) so no extra fetch is needed. */
function ratioOk(value: unknown): true | string {
  const ref = (value as { asset?: { _ref?: string } } | undefined)?.asset?._ref;
  if (!ref) return true;
  const m = /-(\d+)x(\d+)-/.exec(ref);
  if (!m) return true;
  const ratio = Number(m[1]) / Number(m[2]);
  return Math.abs(ratio - 0.8) <= 0.02 ? true : `Photo must be 4:5 portrait (for example 1600 x 2000). This one is ${m[1]} x ${m[2]}.`;
}

const photo = (name: string, title: string, description: string, required: boolean) =>
  defineField({
    name,
    title,
    description,
    type: "image",
    options: { hotspot: false },
    validation: (Rule) =>
      required
        ? [Rule.required().error(`${title} photo is required. Every product needs at least 3 photos before it can be published.`), Rule.custom(ratioOk)]
        : Rule.custom(ratioOk),
  });

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "details", title: "Details" },
    { name: "photos", title: "Photos" },
  ],
  fields: [
    defineField({
      name: "sku",
      title: "SKU",
      group: "basics",
      type: "string",
      description: "Short code used in the link: yoursite.com/p/VS-1001. Letters, numbers and dashes only. Do not change after sharing the link.",
      validation: (Rule) =>
        Rule.required()
          .regex(/^[A-Za-z0-9-]{3,20}$/, { name: "sku", invert: false })
          .error("Use 3 to 20 letters, numbers or dashes, e.g. VS-1011")
          .custom(async (value, ctx) => {
            if (!value) return true;
            const id = (ctx.document?._id ?? "").replace(/^drafts\./, "");
            const client = ctx.getClient({ apiVersion: "2025-01-01" });
            const n = await client.fetch<number>(
              `count(*[_type=="product" && sku==$sku && !(_id in [$id, "drafts." + $id])])`,
              { sku: value, id },
            );
            return n === 0 ? true : "Another product already uses this SKU.";
          }),
    }),
    defineField({ name: "name", title: "Name", group: "basics", type: "string", validation: (R) => R.required().max(80) }),
    defineField({
      name: "category",
      title: "Category",
      group: "basics",
      type: "string",
      options: { list: CATEGORIES.map((c) => ({ title: c.label, value: c.value })) },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "occasions",
      title: "Occasions",
      group: "basics",
      type: "array",
      of: [{ type: "string" }],
      options: { list: OCCASIONS.map((o) => ({ title: o.label, value: o.value })), layout: "grid" },
      validation: (R) => R.required().min(1).unique(),
    }),
    defineField({ name: "price", title: "Price (₹)", group: "basics", type: "number", validation: (R) => R.required().integer().min(1) }),
    defineField({
      name: "availability",
      title: "Availability",
      group: "basics",
      type: "string",
      initialValue: "in_stock",
      options: { list: AVAILABILITY.map((a) => ({ title: a.label, value: a.value })), layout: "radio" },
      validation: (R) => R.required(),
    }),
    defineField({ name: "featured", title: "Featured on home page", group: "basics", type: "boolean", initialValue: false }),

    defineField({
      name: "colourFamily",
      title: "Colour family",
      group: "details",
      type: "string",
      description: "Used by the Colour filter in the shop.",
      options: { list: COLOURS.map((c) => ({ title: c.label, value: c.value })) },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "colourName",
      title: "Colour name",
      group: "details",
      type: "string",
      description: "What you would say to a customer, e.g. Peacock Green.",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "colourOptions",
      title: "Other colours available",
      group: "details",
      type: "array",
      of: [{ type: "string" }],
      description: "Optional. Customers can pick one and it goes in the WhatsApp message. Include the main colour name as well.",
    }),
    defineField({ name: "fabric", title: "Fabric", group: "details", type: "string", validation: (R) => R.required() }),
    defineField({ name: "weave", title: "Weave / work", group: "details", type: "string", description: "e.g. Kanjivaram handloom, Pochampally ikat", validation: (R) => R.required() }),
    defineField({ name: "length", title: "Saree length (metres)", group: "details", type: "number", description: "Leave empty for items that are not sarees.", validation: (R) => R.min(1).max(10) }),
    defineField({ name: "blouseIncluded", title: "Blouse piece included", group: "details", type: "boolean", initialValue: true }),
    defineField({ name: "care", title: "Care instructions", group: "details", type: "text", rows: 3, validation: (R) => R.required() }),
    defineField({ name: "description", title: "Short description", group: "details", type: "text", rows: 3, validation: (R) => R.max(280) }),
    defineField({ name: "addedOn", title: "Added on", group: "details", type: "date", description: "Controls “New arrivals”. Defaults to the creation date if empty." }),

    defineField({
      name: "photos",
      title: "Photos",
      group: "photos",
      type: "object",
      description:
        "Product only: no models, faces, hands or mannequins. Same plain backdrop and soft light. 4:5 portrait. True colours. The first three are required.",
      options: { collapsible: false },
      fields: [
        photo("full", "1. Full piece", "Whole piece laid flat or draped on the backdrop.", true),
        photo("pallu", "2. Pallu", "The pallu end.", true),
        photo("border", "3. Border", "Close view of the border.", true),
        photo("blouse", "4. Blouse piece", "The blouse piece (optional).", false),
        photo("texture", "5. Texture close-up", "Macro of the weave (optional).", false),
        photo("extra", "6. Extra view", "Anything else worth showing (optional).", false),
      ],
    }),
  ],
  orderings: [
    { title: "Newest", name: "newest", by: [{ field: "addedOn", direction: "desc" }] },
    { title: "SKU", name: "sku", by: [{ field: "sku", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name", sku: "sku", availability: "availability", media: "photos.full" },
    prepare: ({ title, sku, availability, media }) => ({ title, subtitle: `${sku} · ${availability}`, media }),
  },
});
