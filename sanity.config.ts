import { defineConfig } from "sanity";
import { structureTool, type StructureBuilder } from "sanity/structure";
import { schemaTypes, SINGLETONS } from "./sanity/schemaTypes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "missing-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const single = (S: StructureBuilder, id: (typeof SINGLETONS)[number], title: string) =>
  S.listItem().title(title).id(id).child(S.document().schemaType(id).documentId(id).title(title));

export default defineConfig({
  name: "sri-vasthra",
  title: "Sri Vasthra",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Singletons cannot be created twice from the "+" menu
    templates: (templates) => templates.filter(({ schemaType }) => !(SINGLETONS as readonly string[]).includes(schemaType)),
  },
  document: {
    actions: (input, ctx) =>
      (SINGLETONS as readonly string[]).includes(ctx.schemaType)
        ? input.filter(({ action }) => action && !["unpublish", "delete", "duplicate"].includes(action))
        : input,
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Sri Vasthra")
          .items([
            S.documentTypeListItem("product").title("Products"),
            S.divider(),
            single(S, "homePage", "Home page"),
            single(S, "aboutPage", "About page"),
            single(S, "contactPage", "Contact page"),
            single(S, "policyPage", "Delivery and returns"),
            S.divider(),
            single(S, "siteSettings", "Shop details"),
          ]),
    }),
  ],
});
