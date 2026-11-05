import type { Metadata } from "next";
import { MapFacade } from "@/components/map-facade";
import { PageBody } from "@/components/page-body";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getPage, getSettings } from "@/lib/data";

export const revalidate = 60;
export const metadata: Metadata = { title: "Visit and contact", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const [page, s] = await Promise.all([getPage("contactPage"), getSettings()]);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" });
  const tel = s.phone.replace(/[^\d+]/g, "");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-4xl font-bold">{page.title}</h1>
      {page.intro && <p className="mt-2 text-lg text-muted">{page.intro}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {tel && <a href={`tel:${tel}`} className="btn btn-maroon">Call {s.phone}</a>}
        <WhatsAppButton sku="general" source="contact_page" message={`Hi ${s.shopName}, I'd like to know more about your sarees.`} label="Message on WhatsApp" />
      </div>

      <section className="mt-8" aria-labelledby="find">
        <h2 id="find" className="text-2xl font-semibold">Find the shop</h2>
        <p className="mt-1 whitespace-pre-line">{s.address}</p>
        <div className="mt-3"><MapFacade query={s.mapQuery} /></div>
      </section>

      <section className="mt-8" aria-labelledby="hours">
        <h2 id="hours" className="text-2xl font-semibold">Opening hours</h2>
        <table className="mt-2 w-full overflow-hidden rounded-xl bg-paper text-left ring-1 ring-line">
          <caption className="sr-only">Opening hours by day</caption>
          <tbody className="divide-y divide-line">
            {s.hours.map((h) => (
              <tr key={h.day} className={h.day === today ? "bg-sand font-semibold" : ""}>
                <th scope="row" className="px-4 py-3 font-[inherit]">{h.day}{h.day === today && <span className="ml-2 text-xs font-bold text-maroon">Today</span>}</th>
                <td className="px-4 py-3">{h.open}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {page.body.length > 0 && <div className="mt-8"><PageBody body={page.body} /></div>}
    </div>
  );
}
