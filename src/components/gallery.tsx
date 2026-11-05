"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductImage as Img } from "@/lib/types";
import { ProductImage } from "./product-image";

interface Props {
  images: Img[];
  colourFamily: string;
}

export function Gallery({ images, colourFamily }: Props) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: false, align: "start", containScroll: "trimSnaps" });
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    if (!embla) return;
    const sync = () => setIndex(embla.selectedScrollSnap());
    embla.on("select", sync);
    return () => {
      embla.off("select", sync);
    };
  }, [embla]);

  const go = useCallback((i: number) => embla?.scrollTo(i), [embla]);
  const current = images[index] ?? images[0];

  return (
    <div>
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden" role="group" aria-roledescription="carousel" aria-label="Product photos">
          <div className="flex touch-pan-y">
            {images.map((img, i) => (
              <div key={img.key} className="min-w-0 flex-[0_0_100%]" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${images.length}: ${img.label}`}>
                <button
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  className="block w-full cursor-zoom-in"
                  aria-label={`Zoom photo: ${img.label}`}
                >
                  <ProductImage image={img} colourFamily={colourFamily} priority={i === 0} sizes="(max-width: 768px) 100vw, 520px" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white" aria-hidden>
          {index + 1} / {images.length}
        </span>
      </div>

      <p className="mt-2 text-center text-sm font-medium text-muted" aria-live="polite">{current.label}</p>
      <div className="mt-1 flex justify-center">
        {images.map((img, i) => (
          <button key={img.key} type="button" onClick={() => go(i)} aria-label={`Show ${img.label}`} aria-current={i === index} className="tap grid place-items-center">
            <span className={`block h-2.5 rounded-full transition-all ${i === index ? "w-6 bg-maroon" : "w-2.5 bg-line"}`} />
          </button>
        ))}
      </div>

      {zoomOpen && <Lightbox images={images} start={index} colourFamily={colourFamily} onClose={() => setZoomOpen(false)} onIndex={go} />}
    </div>
  );
}

function Lightbox({ images, start, colourFamily, onClose, onIndex }: { images: Img[]; start: number; colourFamily: string; onClose: () => void; onIndex: (i: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(start);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);

  // keep the zoomed photo centred when toggling
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [zoomed, i]);

  const img = images[i];
  const step = (d: number) => {
    const n = (i + d + images.length) % images.length;
    setI(n);
    setZoomed(false);
    onIndex(n);
  };

  return (
    <dialog ref={ref} className="lightbox" aria-label={`Zoomed photo: ${img.label}`} onClose={onClose}>
      <div className="flex h-full flex-col text-white">
        <div className="flex items-center justify-between px-3 pt-[max(0.5rem,var(--safe-top))]">
          <span className="text-sm font-medium" aria-live="polite">{img.label} ({i + 1}/{images.length})</span>
          <button type="button" onClick={onClose} className="tap rounded-full px-4 text-sm font-semibold">Close</button>
        </div>
        <div ref={scroller} className="min-h-0 flex-1 overflow-auto overscroll-contain" style={{ touchAction: "pan-x pan-y pinch-zoom" }}>
          <div className="grid min-h-full min-w-full place-items-center">
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
              className={zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}
              style={{ width: zoomed ? "min(260vw, 1800px)" : "min(100vw, calc((100dvh - 150px) * 0.8))" }}
            >
              {img.url ? (
                <span className="relative block aspect-[4/5] w-full">
                  <Image src={img.url} alt={img.alt} fill sizes={zoomed ? "1800px" : "100vw"} quality={80} className="object-contain" />
                </span>
              ) : (
                <ProductImage image={img} colourFamily={colourFamily} sizes="100vw" />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 pb-[max(0.75rem,var(--safe-bottom))] pt-2">
          <button type="button" onClick={() => step(-1)} className="btn border-white/60 text-white">Previous</button>
          <button type="button" onClick={() => setZoomed((z) => !z)} className="btn border-white/60 text-white">{zoomed ? "Zoom out" : "Zoom in"}</button>
          <button type="button" onClick={() => step(1)} className="btn border-white/60 text-white">Next</button>
        </div>
      </div>
    </dialog>
  );
}
