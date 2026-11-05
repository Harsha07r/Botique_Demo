import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond } from "next/font/google";
import { BRAND } from "@/lib/brand";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// One weight, display:optional: the headline never repaints when the font arrives (keeps LCP at first paint). Body text uses the phone's own font (fast, and covers Telugu).
const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["700"], variable: "--nf-display", display: "optional" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${BRAND.full} | Sarees and ethnic wear, Tanuku`, template: `%s | ${BRAND.short}` },
  description: "Silk and cotton sarees, kurta sets and lehengas from Sri Vasthra Designers Boutique, Tanuku, Andhra Pradesh. Enquire on WhatsApp.",
  openGraph: { type: "website", siteName: BRAND.full, locale: "en_IN" },
  alternates: { canonical: "./" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#7a1f3d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={display.variable}>
      <body>{children}</body>
    </html>
  );
}
