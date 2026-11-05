"use client";

import { useSyncExternalStore } from "react";
import type { EnquiryItem } from "./whatsapp";

const KEY = "vastrika.enquiry.v1";
const EMPTY: EnquiryItem[] = [];
let cache: EnquiryItem[] | null = null;
const listeners = new Set<() => void>();

function read(): EnquiryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function snapshot(): EnquiryItem[] {
  if (cache === null) cache = read();
  return cache;
}

function write(next: EnquiryItem[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode: list still works for this page view */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export const enquiryActions = {
  /** One line per SKU + colour. Returns false if it was already on the list. */
  add(item: EnquiryItem): boolean {
    const list = snapshot();
    if (list.some((i) => i.sku === item.sku && i.colour === item.colour)) return false;
    write([...list, item]);
    return true;
  },
  remove(sku: string, colour: string) {
    write(snapshot().filter((i) => !(i.sku === sku && i.colour === colour)));
  },
  clear() {
    write([]);
  },
};

export function useEnquiryList(): EnquiryItem[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}
