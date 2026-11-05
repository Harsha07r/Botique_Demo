"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useEnquiryList } from "@/lib/enquiry-store";
import { Sheet } from "./sheet";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Visit and contact" },
  { href: "/policies", label: "Delivery and returns" },
];

export function Header({ shopName }: { shopName: string }) {
  const [menu, setMenu] = useState(false);
  const count = useEnquiryList().length;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur" style={{ paddingTop: "var(--safe-top)" }}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="tap flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-maroon">
          <Image src="/logo.jpg" alt="" width={40} height={40} priority className="size-10 rounded-full" />
          {shopName}
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1">
          <Link href="/shop" className="tap hidden items-center px-3 text-sm font-semibold sm:flex">Shop</Link>
          <Link href="/list" className="tap relative flex items-center gap-1 rounded-full px-3 text-sm font-semibold" aria-label={`Enquiry list, ${count} ${count === 1 ? "item" : "items"}`}>
            <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
            <span data-testid="list-count" className={count ? "grid min-w-5 place-items-center rounded-full bg-maroon px-1.5 text-xs font-bold text-white" : "sr-only"}>{count}</span>
          </Link>
          <button type="button" onClick={() => setMenu(true)} className="tap grid place-items-center rounded-full px-2" aria-label="Open menu" aria-haspopup="dialog">
            <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </nav>
      </div>
      <Sheet open={menu} onClose={() => setMenu(false)} title="Menu">
        <ul className="pb-2">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setMenu(false)} className="tap flex items-center border-b border-line/60 py-3 text-lg font-medium">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>
    </header>
  );
}
