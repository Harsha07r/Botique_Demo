"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { events } from "@/lib/analytics";
import { applyFilters, FILTER_KEYS, parseFilters, type FilterKey } from "@/lib/shop-filter";
import { AVAILABILITY, CATEGORIES, COLOURS, labelOf, OCCASIONS, PRICE_BANDS, SORTS } from "@/lib/taxonomy";
import type { ProductCard as Card } from "@/lib/types";
import { ProductCard } from "./product-card";
import { Sheet } from "./sheet";
import { WhatsAppButton } from "./whatsapp-button";

const PAGE = 12;

type Option = { value: string; label: string; hex?: string };
const GROUPS: Record<FilterKey, { title: string; options: readonly Option[] }> = {
  category: { title: "Category", options: CATEGORIES },
  occasion: { title: "Occasion", options: OCCASIONS },
  colour: { title: "Colour", options: COLOURS },
  price: { title: "Price", options: PRICE_BANDS },
  availability: { title: "Availability", options: AVAILABILITY },
};

export function ShopClient({ all }: { all: Card[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const f = parseFilters(sp);
  const [open, setOpen] = useState<FilterKey | "sort" | "search" | null>(null);

  const results = useMemo(() => applyFilters(all, f), [all, f.category, f.occasion, f.colour, f.price, f.availability, f.sort, f.q]); // eslint-disable-line react-hooks/exhaustive-deps
  const signature = [f.category, f.occasion, f.colour, f.price, f.availability, f.sort, f.q].join("|");
  const activeCount = FILTER_KEYS.filter((k) => f[k]).length + (f.q ? 1 : 0);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const clearAll = () => router.replace(pathname, { scroll: false });

  const choose = (key: FilterKey, value: string) => {
    setParam(key, value);
    if (value) events.filterUse(key, value);
    setOpen(null);
  };

  return (
    <div>
      {/* Pinned filter bar */}
      <div className="sticky z-20 border-b border-line bg-cream/95 backdrop-blur" style={{ top: "calc(56px + var(--safe-top))" }}>
        <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-2" role="toolbar" aria-label="Filters and sort">
          <button type="button" className="chip" data-active={Boolean(f.q)} onClick={() => setOpen("search")}>
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            {f.q ? `“${f.q}”` : "Search"}
          </button>
          <button type="button" className="chip" onClick={() => setOpen("sort")}>
            Sort: {labelOf(SORTS, f.sort).replace(" first", "")}
          </button>
          {FILTER_KEYS.map((k) => (
            <button key={k} type="button" className="chip" data-active={Boolean(f[k])} onClick={() => setOpen(k)} aria-haspopup="dialog">
              {f[k] ? labelOf(GROUPS[k].options, f[k]) : GROUPS[k].title}
              <span aria-hidden className="text-xs">▾</span>
            </button>
          ))}
          {activeCount > 0 && (
            <button type="button" className="chip border-maroon text-maroon" onClick={clearAll}>Clear all</button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <p className="text-sm text-muted" aria-live="polite" data-testid="result-count">
          {results.length} {results.length === 1 ? "piece" : "pieces"}
        </p>

        {results.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-paper p-6 text-center ring-1 ring-line">
            <p className="text-lg font-semibold">Nothing matches these filters</p>
            <p className="mt-1 text-muted">We often have pieces that are not on the site yet. Tell us what you want.</p>
            <div className="mt-4 grid gap-2">
              <button type="button" className="btn btn-outline" onClick={clearAll}>Clear all filters</button>
              <WhatsAppButton
                sku="none"
                source="shop_empty"
                label="Ask us on WhatsApp"
                message={`Hi, I'm looking for ${[f.colour && labelOf(COLOURS, f.colour), f.category ? labelOf(CATEGORIES, f.category) : "a saree", f.occasion && `for ${labelOf(OCCASIONS, f.occasion)}`, f.price && `(${labelOf(PRICE_BANDS, f.price)})`].filter(Boolean).join(" ")}. Can you help?`}
              />
            </div>
          </div>
        ) : (
          <Results key={signature} items={results} />
        )}
      </div>

      {FILTER_KEYS.map((k) => (
        <Sheet key={k} open={open === k} onClose={() => setOpen((o) => (o === k ? null : o))} title={GROUPS[k].title}>
          <OptionList options={GROUPS[k].options} value={f[k]} anyLabel="Any" onPick={(v) => choose(k, v)} />
        </Sheet>
      ))}
      <Sheet open={open === "sort"} onClose={() => setOpen((o) => (o === "sort" ? null : o))} title="Sort by">
        <OptionList
          options={SORTS}
          value={f.sort}
          onPick={(v) => {
            setParam("sort", v === "new" ? "" : v);
            events.filterUse("sort", v);
            setOpen(null);
          }}
        />
      </Sheet>
      <Sheet open={open === "search"} onClose={() => setOpen((o) => (o === "search" ? null : o))} title="Search">
        <SearchForm
          initial={f.q}
          onSubmit={(term) => {
            setParam("q", term);
            if (term) events.search(term, applyFilters(all, { ...f, q: term }).length);
            setOpen(null);
          }}
        />
      </Sheet>
    </div>
  );
}

function Results({ items }: { items: Card[] }) {
  const [shown, setShown] = useState(PAGE);
  const sentinel = useRef<HTMLDivElement>(null);
  const more = shown < items.length;

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !more || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setShown((n) => n + PAGE);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [more, shown]);

  return (
    <>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4" data-testid="product-grid">
        {items.slice(0, shown).map((p, i) => (
          <ProductCard key={p.sku} p={p} priority={i < 4} source="shop" />
        ))}
      </div>
      {more && (
        <div ref={sentinel} className="mt-8 grid justify-items-center gap-3">
          <p className="text-sm text-muted">Showing {shown} of {items.length}</p>
          <button type="button" className="btn btn-outline" onClick={() => setShown((n) => n + PAGE)}>Show more</button>
        </div>
      )}
    </>
  );
}

function OptionList({ options, value, anyLabel, onPick }: { options: readonly Option[]; value: string; anyLabel?: string; onPick: (v: string) => void }) {
  const all: Option[] = anyLabel ? [{ value: "", label: anyLabel }, ...options] : [...options];
  return (
    <ul role="radiogroup" className="grid">
      {all.map((o) => {
        const checked = o.value === value;
        return (
          <li key={o.value || "any"}>
            <button
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onPick(o.value)}
              className="tap flex w-full items-center gap-3 border-b border-line/60 py-3 text-left text-lg"
            >
              <span aria-hidden className={`grid size-6 place-items-center rounded-full border-2 ${checked ? "border-maroon" : "border-line"}`}>
                {checked && <span className="size-3 rounded-full bg-maroon" />}
              </span>
              {o.hex && <span aria-hidden className="size-5 rounded-full ring-1 ring-black/20" style={{ background: o.hex }} />}
              <span className={checked ? "font-semibold" : ""}>{o.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SearchForm({ initial, onSubmit }: { initial: string; onSubmit: (t: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v.trim());
      }}
      className="grid gap-3 pb-3"
    >
      <label htmlFor="shop-q" className="text-sm font-semibold">Name, colour, weave or SKU</label>
      <input
        id="shop-q"
        type="search"
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="e.g. kanjivaram, green, VS-1004"
        enterKeyHint="search"
        autoComplete="off"
        className="min-h-12 rounded-xl border-2 border-line px-4 text-base"
      />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-maroon flex-1">Search</button>
        {initial && <button type="button" className="btn btn-outline" onClick={() => onSubmit("")}>Clear</button>}
      </div>
    </form>
  );
}
