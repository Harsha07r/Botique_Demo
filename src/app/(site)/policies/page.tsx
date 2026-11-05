import type { Metadata } from "next";
import { PageBody } from "@/components/page-body";
import { getPage } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = { title: "Delivery and returns", alternates: { canonical: "/policies" } };

export default async function PoliciesPage() {
  const page = await getPage("policyPage");
  return (
    <article className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      {page.intro && <p className="mt-2 text-lg text-muted">{page.intro}</p>}
      <div className="mt-6"><PageBody body={page.body} /></div>
    </article>
  );
}
