import { defineArrayMember, defineField, defineType } from "sanity";
import { OCCASIONS } from "../../src/lib/taxonomy";

const imageWithAlt = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    description,
    type: "image",
    options: { hotspot: true },
    fields: [defineField({ name: "alt", title: "Alt text", type: "string", description: "Describe the photo for screen readers." })],
  });

const richText = defineField({
  name: "body",
  title: "Content",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading", value: "h2" },
      ],
      lists: [{ title: "Bullets", value: "bullet" }],
      marks: { decorators: [{ title: "Bold", value: "strong" }], annotations: [] },
    }),
  ],
});

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Shop details",
  type: "document",
  fields: [
    defineField({ name: "shopName", title: "Shop name", type: "string", initialValue: "Vastrika", validation: (R) => R.required() }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp number",
      type: "string",
      description: "Digits only with country code, e.g. 919876543210. Every enquiry goes here.",
      validation: (R) => R.required().regex(/^\d{11,14}$/, { name: "digits" }).error("Digits only, with country code (e.g. 919876543210)"),
    }),
    defineField({ name: "phone", title: "Phone number for the Call button", type: "string", description: "e.g. +91 98765 43210" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "instagram", title: "Instagram handle", type: "string", description: "Without @" }),
    defineField({ name: "address", title: "Shop address", type: "text", rows: 3, validation: (R) => R.required() }),
    defineField({ name: "mapQuery", title: "Map search text", type: "string", description: "What Google Maps should search for, e.g. “Vastrika Sarees, Tanuku”." }),
    defineField({
      name: "hours",
      title: "Opening hours",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "day", title: "Day", type: "string", options: { list: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] } }),
            defineField({ name: "open", title: "Hours", type: "string", description: "e.g. 10:00 am – 8:30 pm, or Closed" }),
          ],
          preview: { select: { title: "day", subtitle: "open" } },
        }),
      ],
    }),
    defineField({ name: "deliveryInfo", title: "Delivery info (short lines on the home page)", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "shopPhoto", title: "Real shop photo", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Alt text", type: "string" })] }),
    defineField({
      name: "reviews",
      title: "Customer reviews",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "name", title: "Customer name", type: "string", validation: (R) => R.required() }),
            defineField({ name: "text", title: "Review", type: "text", rows: 3, validation: (R) => R.required().max(300) }),
            defineField({ name: "rating", title: "Stars", type: "number", initialValue: 5, validation: (R) => R.required().min(1).max(5).integer() }),
            defineField({ name: "source", title: "Where from", type: "string", description: "e.g. Google, WhatsApp, Instagram" }),
          ],
          preview: { select: { title: "name", subtitle: "text" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Shop details" }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({ name: "heroTitle", title: "Hero headline", type: "string", validation: (R) => R.required().max(90) }),
    defineField({ name: "heroSubtitle", title: "Hero sub-line", type: "string", validation: (R) => R.max(160) }),
    defineField({ name: "heroCta", title: "Hero button text", type: "string" }),
    imageWithAlt("heroImage", "Hero image", "Product-only photo, ideally 4:5 portrait or 1:1."),
    defineField({
      name: "occasionTiles",
      title: "Occasion tiles",
      type: "array",
      description: "The swipeable row under the hero.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (R) => R.required() }),
            defineField({ name: "occasion", title: "Opens shop filtered by", type: "string", options: { list: OCCASIONS.map((o) => ({ title: o.label, value: o.value })) }, validation: (R) => R.required() }),
            imageWithAlt("image", "Tile image"),
          ],
          preview: { select: { title: "title", subtitle: "occasion", media: "image" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});

const simplePage = (name: string, title: string) =>
  defineType({
    name,
    title,
    type: "document",
    fields: [
      defineField({ name: "title", title: "Page title", type: "string", validation: (R) => R.required() }),
      defineField({ name: "intro", title: "Intro line", type: "string" }),
      richText,
      imageWithAlt("image", "Photo"),
    ],
    preview: { prepare: () => ({ title }) },
  });

export const aboutPage = simplePage("aboutPage", "About page");
export const contactPage = simplePage("contactPage", "Contact page");
export const policyPage = simplePage("policyPage", "Delivery and return policy");
