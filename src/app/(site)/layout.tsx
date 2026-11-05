import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { SiteProvider } from "@/components/site-context";
import { BRAND } from "@/lib/brand";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const origin = siteUrl();
  return (
    <SiteProvider value={{ shopName: s.shopName, whatsappNumber: s.whatsappNumber, origin }}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-3">
        Skip to content
      </a>
      <Header shopName={s.shopName} />
      <main id="main">{children}</main>
      <Footer s={s} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ClothingStore",
          name: s.fullName ?? s.shopName,
          geo: { "@type": "GeoCoordinates", latitude: BRAND.lat, longitude: BRAND.lng },
          url: origin,
          address: { "@type": "PostalAddress", streetAddress: s.address, addressLocality: "Tanuku", addressRegion: "Andhra Pradesh", postalCode: "534211", addressCountry: "IN" },
          ...(s.phone ? { telephone: s.phone } : {}),
          ...(s.instagram ? { sameAs: [`https://instagram.com/${s.instagram.replace(/^@/, "")}`] } : {}),
        }}
      />
      <Analytics />
    </SiteProvider>
  );
}
