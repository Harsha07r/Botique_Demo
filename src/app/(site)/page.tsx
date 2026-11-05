import Image from "next/image";
import Link from "next/link";
import { MapFacade } from "@/components/map-facade";
import { ProductCard } from "@/components/product-card";
import { getHome, getProducts, getSettings, toCard } from "@/lib/data";
import { hexOf } from "@/lib/taxonomy";

export const revalidate = 60;

function Stars({ n }: { n: number }) {
  return (
    <span role="img" aria-label={`${n} out of 5 stars`} className="text-gold">
      {"★".repeat(n)}
      <span className="text-line">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default async function HomePage() {
  const [home, products, s] = await Promise.all([getHome(), getProducts(), getSettings()]);
  const arrivals = products.slice(0, 8).map(toCard);
  const featured = products.find((p) => p.featured) ?? products[0];

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-maroon text-white">
        {home.heroImage && (
          <Image
            src={home.heroImage.url}
            alt={home.heroImage.alt}
            fill
            priority
            sizes="100vw"
            quality={70}
            placeholder={home.heroImage.blur ? "blur" : "empty"}
            blurDataURL={home.heroImage.blur}
            className="-z-10 object-cover opacity-45"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ backgroundImage: "radial-gradient(circle at 85% 10%, rgb(184 137 59 / .35), transparent 45%), repeating-linear-gradient(45deg, rgb(255 255 255 / .04) 0 12px, transparent 12px 24px)" }}
        />
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#f3d9a4]">Tanuku, Andhra Pradesh</p>
          <h1 className="mt-2 max-w-xl text-[2.1rem] font-bold leading-[1.1] sm:text-5xl">{home.heroTitle}</h1>
          <p className="mt-3 max-w-md text-base text-white/90">{home.heroSubtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop?sort=new" className="btn bg-white text-maroon-deep">{home.heroCta}</Link>
            {featured && <Link href={`/p/${featured.sku}`} className="btn border-white/80 text-white">Featured piece</Link>}
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section aria-labelledby="occ" className="pt-8">
        <h2 id="occ" className="px-4 text-2xl font-semibold">Shop by occasion</h2>
        <ul className="rail hide-scrollbar mt-3 pb-1">
          {home.occasionTiles.map((t) => (
            <li key={t.occasion + t.title} className="w-[38vw] max-w-44 min-w-32">
              <Link href={`/shop?occasion=${t.occasion}`} className="group block">
                <span className="relative block aspect-[4/5] overflow-hidden rounded-xl ring-1 ring-line" style={{ backgroundColor: hexOf(occasionColour(t.occasion)) }}>
                  {t.image && (
                    <Image src={t.image.url} alt="" fill sizes="176px" quality={65} className="object-cover" placeholder={t.image.blur ? "blur" : "empty"} blurDataURL={t.image.blur} />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 pt-8 text-lg font-semibold text-white">{t.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* New arrivals */}
      <section aria-labelledby="new" className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex items-end justify-between">
          <h2 id="new" className="text-2xl font-semibold">New arrivals</h2>
          <Link href="/shop?sort=new" className="tap flex items-center text-sm font-semibold text-maroon underline">View all</Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {arrivals.map((p, i) => (
            <ProductCard key={p.sku} p={p} priority={i < 2} source="home" />
          ))}
        </div>
      </section>

      {/* Trust */}
      <section aria-labelledby="trust" className="mx-auto mt-12 max-w-6xl px-4">
        <h2 id="trust" className="text-2xl font-semibold">Visit us in Tanuku</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div className="grid gap-4">
            {s.shopPhoto ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-line">
                <Image src={s.shopPhoto.url} alt={s.shopPhoto.alt} fill sizes="(max-width:768px) 100vw, 560px" quality={70} className="object-cover" placeholder={s.shopPhoto.blur ? "blur" : "empty"} blurDataURL={s.shopPhoto.blur} />
              </div>
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-sand p-6 text-center text-sm text-muted ring-1 ring-line">
                Real shop photo goes here (upload it in Shop details).
              </div>
            )}
            <MapFacade query={s.mapQuery} />
          </div>
          <div className="grid content-start gap-6">
            <div>
              <h3 className="text-xl font-semibold">What customers say</h3>
              <ul className="mt-3 grid gap-3">
                {s.reviews.map((r) => (
                  <li key={r.name + r.text} className="rounded-xl bg-paper p-4 ring-1 ring-line">
                    <Stars n={r.rating} />
                    <p className="mt-1">“{r.text}”</p>
                    <p className="mt-2 text-sm text-muted">{r.name}{r.source ? ` · ${r.source}` : ""}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Delivery</h3>
              <ul className="mt-2 grid gap-2 text-[0.95rem]">
                {s.deliveryInfo.map((d) => (
                  <li key={d} className="flex gap-2"><span aria-hidden className="text-gold">✦</span>{d}</li>
                ))}
              </ul>
              <Link href="/policies" className="tap mt-1 inline-flex items-center text-sm font-semibold text-maroon underline">Delivery and return policy</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function occasionColour(o: string) {
  return ({ wedding: "red", festive: "yellow", party: "purple", puja: "maroon", office: "blue", casual: "green" } as Record<string, string>)[o] ?? "maroon";
}
