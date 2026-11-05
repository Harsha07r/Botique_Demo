"use client";

import { events } from "@/lib/analytics";
import { waLink } from "@/lib/whatsapp";
import { useSite } from "./site-context";

interface Props {
  message: string;
  /** SKU for single-item enquiries; "list" for the enquiry list; "general" for the contact page */
  sku: string;
  source: string;
  label?: string;
  className?: string;
  extra?: Record<string, string | number | boolean | null>;
}

export function WhatsAppIcon() {
  return (
    <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.45 1.33-2 1.4-.52.07-1.17.1-1.9-.12a17 17 0 0 1-1.72-.64c-3.03-1.3-5-4.35-5.15-4.55-.15-.2-1.23-1.63-1.23-3.1s.78-2.2 1.05-2.5c.28-.3.6-.37.8-.37h.58c.18 0 .43-.07.67.52.25.6.85 2.07.93 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.3-.13.6.17.3.77 1.27 1.65 2.05 1.13 1 2.08 1.32 2.38 1.47.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.57.35.08.12.08.72-.17 1.42Z" />
    </svg>
  );
}

export function WhatsAppButton({ message, sku, source, label = "Enquire on WhatsApp", className = "", extra }: Props) {
  const { whatsappNumber } = useSite();
  return (
    <a
      href={waLink(whatsappNumber, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-wa ${className}`}
      onClick={() => events.whatsappClick(sku, source, extra)}
    >
      <WhatsAppIcon />
      {label}
    </a>
  );
}
