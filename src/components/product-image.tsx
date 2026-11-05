import Image from "next/image";
import { hexOf } from "@/lib/taxonomy";

interface Props {
  image: { url?: string; blur?: string; alt: string; label?: string };
  colourFamily: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * Always renders a 4:5 box. Real photo when uploaded, otherwise a drawn placeholder
 * (no image files are committed to the repo).
 */
export function ProductImage({ image, colourFamily, sizes, priority, className = "" }: Props) {
  return (
    <div className={`relative aspect-[4/5] w-full overflow-hidden bg-sand ${className}`}>
      {image.url ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={72}
          placeholder={image.blur ? "blur" : "empty"}
          blurDataURL={image.blur}
          className="object-cover"
        />
      ) : (
        <Placeholder hex={hexOf(colourFamily)} alt={image.alt} label={image.label} />
      )}
    </div>
  );
}

function Placeholder({ hex, alt, label }: { hex: string; alt: string; label?: string }) {
  return (
    <div
      role="img"
      aria-label={alt}
      className="absolute inset-0 flex items-end justify-center p-3"
      style={{
        backgroundColor: hex,
        backgroundImage:
          "repeating-linear-gradient(45deg, rgb(255 255 255 / .09) 0 10px, transparent 10px 20px), linear-gradient(180deg, rgb(255 255 255 / .12), rgb(0 0 0 / .18))",
      }}
    >
      <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">{label ? `Photo needed: ${label}` : "Photo coming soon"}</span>
    </div>
  );
}
