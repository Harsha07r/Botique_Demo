import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

export function Footer({ s }: { s: SiteSettings }) {
  return (
    <footer className="mt-12 border-t border-line bg-sand">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold text-maroon">{s.shopName}</p>
          <p className="mt-1 text-sm text-muted">{s.tagline}</p>
          <p className="mt-3 whitespace-pre-line text-sm">{s.address}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="grid gap-0.5 text-sm font-medium">
            {[["/shop", "Shop"], ["/about", "About us"], ["/contact", "Visit and contact"], ["/policies", "Delivery and returns"]].map(([href, label]) => (
              <li key={href}><Link href={href} className="tap flex items-center">{label}</Link></li>
            ))}
          </ul>
        </nav>
        <div className="text-sm">
          {s.phone && <p><a className="tap inline-flex items-center font-medium underline" href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}</a></p>}
          {s.instagram && (
            <p><a className="tap inline-flex items-center font-medium underline" href={`https://instagram.com/${s.instagram.replace(/^@/, "")}`} rel="noopener noreferrer">Instagram @{s.instagram.replace(/^@/, "")}</a></p>
          )}
          <p className="mt-3 text-muted">© {new Date().getFullYear()} {s.shopName}. No online payment: we confirm every order on WhatsApp.</p>
        </div>
      </div>
    </footer>
  );
}
