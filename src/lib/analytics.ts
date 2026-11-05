import { track } from "@vercel/analytics";

type Props = Record<string, string | number | boolean | null>;

/** Never throws: analytics must not break an enquiry. */
export function trackEvent(name: string, props?: Props) {
  try {
    track(name, props);
  } catch {
    /* ignore */
  }
}

export const events = {
  whatsappClick: (sku: string, source: string, extra?: Props) =>
    trackEvent("whatsapp_click", { sku, source, ...extra }),
  addToList: (sku: string, source: string) => trackEvent("add_to_list", { sku, source }),
  search: (term: string, results: number) => trackEvent("search", { term, results }),
  filterUse: (filter: string, value: string) => trackEvent("filter_use", { filter, value }),
};
