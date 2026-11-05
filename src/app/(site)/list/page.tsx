import type { Metadata } from "next";
import { ListClient } from "@/components/list-client";

export const metadata: Metadata = { title: "Your enquiry list", robots: { index: false, follow: true } };

export default function ListPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-4xl font-bold">Enquiry list</h1>
      <p className="mt-2 text-muted">One WhatsApp message with every piece below. We reply with availability and delivery.</p>
      <ListClient />
    </div>
  );
}
