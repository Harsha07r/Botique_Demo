"use client";

import { useState } from "react";
import { AddToListButton } from "./add-to-list-button";
import { useSite } from "./site-context";
import { WhatsAppButton } from "./whatsapp-button";
import { singleMessage } from "@/lib/whatsapp";
import type { Availability } from "@/lib/types";

interface Props {
  sku: string;
  name: string;
  price: number;
  availability: Availability;
  colours: string[];
}

/** Colour picker (inline) plus the sticky enquiry bar. Both share the chosen colour. */
export function ProductActions({ sku, name, price, availability, colours }: Props) {
  const [colour, setColour] = useState(colours[0]);
  const { shopName, origin } = useSite();
  const item = { sku, name, colour, price };

  return (
    <>
      {colours.length > 1 && (
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Colour: <span className="font-normal" data-testid="chosen-colour">{colour}</span></legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {colours.map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={c === colour} onClick={() => setColour(c)}>
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div
        data-sticky-bar
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/98 px-3 pt-2 shadow-[0_-4px_16px_rgb(0_0_0/.08)]"
        style={{ paddingBottom: "calc(0.5rem + var(--safe-bottom))" }}
      >
        <div className="mx-auto flex max-w-xl gap-2">
          <WhatsAppButton
            sku={sku}
            source="product_page"
            extra={{ colour }}
            message={singleMessage(shopName, item, origin, availability === "sold_out")}
            className="flex-[2] whitespace-nowrap px-3 text-[0.95rem]"
          />
          <AddToListButton item={item} source="product_page" className="flex-1 px-3 text-[0.95rem]" />
        </div>
      </div>
    </>
  );
}
