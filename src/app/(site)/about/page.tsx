import type { Metadata } from "next";
import Image from "next/image";
import { PageBody } from "@/components/page-body";
import { getPage } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = { title: "About us", alternates: { canonical: "/about" } };

export default async function AboutPage() {
  const page = await getPage("aboutPage");
  return (
    <article className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      {page.intro && <p className="mt-2 text-lg text-muted">{page.intro}</p>}
      {page.image && (
        <div className="relative mt-6 aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-line">
          <Image src={page.image.url} alt={page.image.alt} fill sizes="(max-width:672px) 100vw, 672px" priority quality={70} className="object-cover" placeholder={page.image.blur ? "blur" : "empty"} blurDataURL={page.image.blur} />
        </div>
      )}
      <div className="mt-6"><PageBody body={page.body} /></div>
    </article>
  );
}
