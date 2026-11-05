import { hexOf } from "./taxonomy";
import type { PhotoKey, ProductImage, SiteImage } from "./types";

/**
 * DEMO ONLY. Stock photos from Unsplash (free to use under the Unsplash License) so the owner can see the
 * finished look before real photography exists. They are hot-linked, never committed.
 *
 * Used only when Sanity is not configured. Set NEXT_PUBLIC_DEMO_IMAGES=off to get drawn placeholders instead
 * (CI does this so tests never depend on a third-party host). Remove this file once real photos are in the CMS.
 */
export const demoImagesOn = !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_DEMO_IMAGES !== "off";

const BASE = "https://images.unsplash.com/photo-";

/** Photo ids chosen to match each product's colour. */
const PRODUCT_PHOTO: Record<string, string> = {
  "VS-1001": "1679006831648-7c9ea12e5807", // green silk
  "VS-1002": "1610189337543-1c5d8e64f574", // yellow, orange and red
  "VS-1003": "1617627143750-d86bc21e42bb", // pink and gold
  "VS-1004": "1729146768775-3662af38016e", // white with gold
  "VS-1005": "1610189012906-4c0aa9b9781e", // blue
  "VS-1006": "1724856605022-106d6dd6e842", // maroon-red with gold work
  "VS-1007": "1641699862936-be9f49b1c38d", // dark with gold border
  "VS-1008": "1610030469983-98e550d6193c", // purple silk
  "VS-1009": "1655288828238-21d86ec971c3", // white kurta
  "VS-1010": "1759906760638-eeffcb471e53", // red bridal lehenga
};

/** Detail crops from the same photo (focal point and zoom), kept below face level. */
const SLOT_CROP: Record<PhotoKey, string> = {
  full: "fit=crop&w=1080&h=1350",
  pallu: "fit=crop&crop=focalpoint&fp-x=.3&fp-y=.75&fp-z=1.6&w=1080&h=1350",
  border: "fit=crop&crop=focalpoint&fp-x=.5&fp-y=.92&fp-z=2.4&w=1080&h=1350",
  blouse: "fit=crop&crop=focalpoint&fp-x=.5&fp-y=.55&fp-z=1.9&w=1080&h=1350",
  texture: "fit=crop&crop=focalpoint&fp-x=.5&fp-y=.7&fp-z=4&w=1080&h=1350",
  extra: "fit=crop&w=1080&h=1350",
};

const blurFor = (family: string) =>
  `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="8" height="10"><rect width="8" height="10" fill="${hexOf(family)}"/></svg>`).toString("base64")}`;

export function demoProductImage(sku: string, slot: PhotoKey, family: string): Pick<ProductImage, "url" | "blur"> | null {
  const id = PRODUCT_PHOTO[sku];
  if (!demoImagesOn || !id) return null;
  return { url: `${BASE}${id}?auto=format&q=75&${SLOT_CROP[slot]}`, blur: blurFor(family) };
}

const site = (id: string, alt: string, crop = "fit=crop&w=1440&h=1080"): SiteImage | undefined =>
  demoImagesOn ? { url: `${BASE}${id}?auto=format&q=75&${crop}`, alt } : undefined;

export const demoSite = {
  hero: () => site("1717585679395-bbe39b5fb6bc", "Folded silk and cotton sarees in bright colours", "fit=crop&w=1440&h=1200"),
  // The only photo on the shop's own Google Business Profile (a designer blouse; there is no storefront photo yet)
  shop: (): SiteImage | undefined =>
    demoImagesOn
      ? {
          url: "https://lh3.googleusercontent.com/grass-cs/AABkmLe9QWe3d6ApRQVApkhi7_M8N0tUVni7_zX7XiPl7pZkOXMvYfiS_81JabkN5c5qlAEleL45zEj4mvpb9A_ooxFMTWcSRucDIA3VitQewZEMWZ48Tn1b7tkSCeA90EG7y37kX6ij=w1200-h900-k-no",
          alt: "Designer blouse from Sri Vasthra Designers Boutique, photo from the shop's Google profile",
        }
      : undefined,
  about: () => site("1773218373348-34db6bb11662", "Handloom textiles hanging on display", "fit=crop&w=1200&h=900"),
  tile: (occasion: string) => {
    const id = {
      wedding: "1759906760638-eeffcb471e53",
      festive: "1617627143750-d86bc21e42bb",
      party: "1610030469983-98e550d6193c",
      puja: "1724856605022-106d6dd6e842",
      office: "1610189012906-4c0aa9b9781e",
      casual: "1729146768775-3662af38016e",
    }[occasion];
    return id ? site(id, "", "fit=crop&w=480&h=600") : undefined;
  },
};
