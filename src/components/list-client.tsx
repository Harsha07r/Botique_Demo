"use client";

import Link from "next/link";
import { enquiryActions, useEnquiryList } from "@/lib/enquiry-store";
import { formatPrice } from "@/lib/format";
import { listMessage } from "@/lib/whatsapp";
import { useSite } from "./site-context";
import { WhatsAppButton } from "./whatsapp-button";

export function ListClient() {
  const items = useEnquiryList();
  const { shopName, origin } = useSite();

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-2xl bg-paper p-6 text-center ring-1 ring-line">
        <p className="text-lg font-semibold">Your enquiry list is empty</p>
        <p className="mt-1 text-muted">Tap “Add to list” on pieces you like, then send them all in one WhatsApp message.</p>
        <Link href="/shop" className="btn btn-maroon mt-4">Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <ul className="mt-4 grid gap-3" data-testid="list-items">
        {items.map((i) => (
          <li key={i.sku + i.colour} className="flex items-center gap-3 rounded-xl bg-paper p-3 ring-1 ring-line">
            <div className="min-w-0 flex-1">
              <Link href={`/p/${i.sku}`} className="block font-semibold leading-snug">{i.name}</Link>
              <p className="text-sm text-muted">{i.sku} · {i.colour}</p>
              <p className="font-semibold">{formatPrice(i.price)}</p>
            </div>
            <button type="button" onClick={() => enquiryActions.remove(i.sku, i.colour)} className="tap rounded-full px-3 text-sm font-semibold text-maroon underline" aria-label={`Remove ${i.name} (${i.colour}) from list`}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div data-sticky-bar className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper px-3 pt-2" style={{ paddingBottom: "calc(0.5rem + var(--safe-bottom))" }}>
        <div className="mx-auto flex max-w-xl gap-2">
          <WhatsAppButton
            sku="list"
            source="enquiry_list"
            extra={{ items: items.length }}
            label="Send list on WhatsApp"
            message={listMessage(shopName, items, origin)}
            className="flex-[2] whitespace-nowrap px-3 text-[0.95rem]"
          />
          <button type="button" className="btn btn-outline flex-1 px-3 text-[0.95rem]" onClick={() => enquiryActions.clear()}>Clear</button>
        </div>
      </div>
    </div>
  );
}
