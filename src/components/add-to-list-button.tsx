"use client";

import { useEffect, useState } from "react";
import { events } from "@/lib/analytics";
import { enquiryActions } from "@/lib/enquiry-store";
import type { EnquiryItem } from "@/lib/whatsapp";

interface Props {
  item: EnquiryItem;
  source: string;
  variant?: "full" | "icon";
  className?: string;
}

export function AddToListButton({ item, source, variant = "full", className = "" }: Props) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 2000);
    return () => clearTimeout(t);
  }, [done]);

  const onClick = () => {
    const added = enquiryActions.add(item);
    if (added) events.addToList(item.sku, source);
    setDone(true);
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={done ? `${item.name} added to enquiry list` : `Add ${item.name} to enquiry list`}
        className={`tap grid place-items-center rounded-full bg-white/95 text-maroon shadow ring-1 ring-black/10 ${className}`}
      >
        <span aria-hidden className="text-xl font-semibold leading-none">{done ? "✓" : "+"}</span>
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`btn btn-outline ${className}`} aria-live="polite">
      {done ? "Added ✓" : "Add to list"}
    </button>
  );
}
