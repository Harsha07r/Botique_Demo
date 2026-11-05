"use client";

import { useState } from "react";

/**
 * A Google Maps iframe costs about 400 KB of JavaScript. Load it only when asked, and always
 * offer a plain link so the map works without it.
 */
export function MapFacade({ query }: { query: string }) {
  const [on, setOn] = useState(false);
  const q = encodeURIComponent(query);
  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-line">
      <div className="relative aspect-[4/3] w-full bg-sand sm:aspect-[16/9]">
        {on ? (
          <iframe
            title="Shop location on Google Maps"
            src={`https://www.google.com/maps?q=${q}&output=embed`}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <button
            type="button"
            onClick={() => setOn(true)}
            className="absolute inset-0 grid place-items-center text-center"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, rgb(0 0 0 / .04) 0 1px, transparent 1px 28px), repeating-linear-gradient(90deg, rgb(0 0 0 / .04) 0 1px, transparent 1px 28px)" }}
          >
            <span className="grid justify-items-center gap-2 px-4">
              <svg aria-hidden width="36" height="36" viewBox="0 0 24 24" fill="#7a1f3d"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" /></svg>
              <span className="btn btn-maroon">Show map</span>
            </span>
          </button>
        )}
      </div>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${q}`}
        target="_blank"
        rel="noopener noreferrer"
        className="tap flex items-center justify-center bg-paper text-sm font-semibold text-maroon underline"
      >
        Open in Google Maps for directions
      </a>
    </div>
  );
}
