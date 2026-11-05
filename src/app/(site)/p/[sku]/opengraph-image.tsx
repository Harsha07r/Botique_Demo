import { ImageResponse } from "next/og";
import { getProduct } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { hexOf } from "@/lib/taxonomy";

export const alt = "Product preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 60;

export default async function Image({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const p = await getProduct(sku);
  const cover = p?.images[0]?.url;
  // Satori cannot read webp/avif: ask the Sanity CDN for a 4:5 jpg crop
  const photo = cover ? `${cover.split("?")[0]}?w=504&h=630&fit=crop&fm=jpg&q=80` : undefined;
  const hex = hexOf(p?.colourFamily ?? "maroon");

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#fbf6ee" }}>
        <div style={{ display: "flex", width: 504, height: 630, background: hex }}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} width={504} height={630} alt="" style={{ objectFit: "cover" }} />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px", flex: 1, color: "#2a1a1f" }}>
          <div style={{ fontSize: 30, color: "#7a1f3d", fontWeight: 700, letterSpacing: 4 }}>{"VASTRIKA · TANUKU"}</div>
          <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.1, marginTop: 24 }}>{p?.name ?? "Vastrika"}</div>
          {p && <div style={{ fontSize: 32, marginTop: 14, color: "#66555a" }}>{p.colourName}</div>}
          {p && <div style={{ fontSize: 64, fontWeight: 700, marginTop: 28, color: "#7a1f3d" }}>{formatPrice(p.price)}</div>}
          {p && <div style={{ fontSize: 28, marginTop: 24, color: "#0b7a3b", fontWeight: 600 }}>{`Enquire on WhatsApp · SKU ${p.sku}`}</div>}
        </div>
      </div>
    ),
    size,
  );
}
