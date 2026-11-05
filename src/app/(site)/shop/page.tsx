import type { Metadata } from "next";
import { ShopClient } from "@/components/shop-client";
import { getProducts, toCard } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop sarees and ethnic wear",
  description: "Browse silk and cotton sarees, kurta sets and lehengas. Filter by occasion, colour and price, then enquire on WhatsApp.",
  alternates: { canonical: "/shop" },
};

// Reading searchParams in the client component makes this route render per request,
// so deep links like /shop?occasion=wedding arrive pre-filtered in the HTML.
// Product data is still served from the 60-second CMS cache.
export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const all = (await getProducts()).map(toCard);
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-5">
        <h1 className="text-3xl font-bold">Shop</h1>
      </div>
      <ShopClient all={all} />
    </>
  );
}
