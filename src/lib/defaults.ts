import { demoSite } from "./demo-images";
import type { HomeContent, PageContent, SiteSettings } from "./types";

/**
 * Fallback copy used until the owner fills in the matching document in the CMS
 * (and when Sanity is not configured, e.g. local dev and CI).
 */
export const defaultSettings: SiteSettings = {
  shopName: "Vastrika",
  tagline: "Elegance in Every Drape",
  // number from the shop's Google profile (Instagram bio lists it for WhatsApp)
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919949255429",
  phone: "+91 99492 55429",
  address: "Venkatarayapuram, Tanuku, Andhra Pradesh 534211",
  mapQuery: "Sri Vasthra Designers Boutique, Venkatarayapuram, Tanuku, Andhra Pradesh 534211",
  mapCid: "6640108360976342029",
  googleRating: { score: 4.9, count: 53, url: "https://www.google.com/maps?cid=6640108360976342029" },
  instagram: "vastrika_va",
  shopPhoto: demoSite.shop(),
  hours: [
    { day: "Monday", open: "9:45 am – 9:00 pm" },
    { day: "Tuesday", open: "9:45 am – 9:00 pm" },
    { day: "Wednesday", open: "9:45 am – 9:00 pm" },
    { day: "Thursday", open: "9:45 am – 9:00 pm" },
    { day: "Friday", open: "9:45 am – 9:00 pm" },
    { day: "Saturday", open: "9:45 am – 9:00 pm" },
    { day: "Sunday", open: "9:45 am – 9:00 pm" },
  ],
  deliveryInfo: [
    "We ship across India by insured courier.",
    "Tanuku and nearby towns: same-day or next-day delivery.",
    "Order is confirmed on WhatsApp. Payment details are shared there.",
  ],
  reviews: [
    { name: "Customer", text: "High quality sarees", rating: 5, source: "Google reviews" },
  ],
};

export const defaultHome: HomeContent = {
  heroTitle: "Sarees chosen with care, from our shop in Tanuku",
  heroSubtitle: "See the piece. Message us on WhatsApp. We reply with price, availability and delivery.",
  heroCta: "Shop new arrivals",
  heroImage: demoSite.hero(),
  occasionTiles: [
    { title: "Wedding", occasion: "wedding", image: demoSite.tile("wedding") },
    { title: "Festive", occasion: "festive", image: demoSite.tile("festive") },
    { title: "Party", occasion: "party", image: demoSite.tile("party") },
    { title: "Puja", occasion: "puja", image: demoSite.tile("puja") },
    { title: "Office", occasion: "office", image: demoSite.tile("office") },
    { title: "Everyday", occasion: "casual", image: demoSite.tile("casual") },
  ],
};

export const defaultAbout: PageContent = {
  title: "About Vastrika",
  intro: "A family-run saree and ethnic-wear shop in Tanuku, Andhra Pradesh.",
  image: demoSite.about(),
  body: [
    "Tell your shop's story here. Who started it, what you stock, and why customers return.",
    "Edit this page in the CMS under Pages, About.",
  ],
};

export const defaultContact: PageContent = {
  title: "Visit or contact us",
  intro: "Walk in, call, or send us a message on WhatsApp.",
  body: [],
};

export const defaultPolicies: PageContent = {
  title: "Delivery and returns",
  intro: "What to expect after you place an enquiry.",
  body: [
    "Delivery: Orders are dispatched within 2 working days of payment confirmation. Delivery takes 3 to 7 days across India. We share the courier tracking link on WhatsApp.",
    "Returns: If the piece differs from what we described, tell us on WhatsApp within 48 hours of delivery, with an unboxing video. We will arrange an exchange or refund.",
    "Not returnable: Made-to-order items, blouses stitched to your measurements, and pieces that have been washed, worn or altered.",
    "Colours: We photograph every piece in the same soft light to keep colours true. Screens differ slightly. Ask for a video call and we will show it live.",
  ],
};
