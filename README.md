# Sri Vasthra Designers Boutique (site name: Sri Vasthra)

Mobile-first boutique site for a saree and ethnic-wear shop in Tanuku, Andhra Pradesh. Visitors mostly arrive
from Instagram on phones. The goal is a WhatsApp enquiry that already names the exact item. There is no online
payment in phase 1.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 4 · Sanity (CMS) · Vercel (hosting and
Analytics) · Playwright (tests). The Next.js docs this was built against ship inside `node_modules/next/dist/docs`.

---

## For the owner: how to add a product

You do this in the CMS, called the Studio, at **`https://your-site/studio`**. No developer needed.

1. Sign in at `/studio` with the Google or email account you were invited with.
2. Click **Products**, then the **+** (new product) button.
3. **Basics tab.** Fill in:
   - **SKU**: a short unique code, e.g. `VS-1011`. This becomes the link `your-site/p/VS-1011`. Never change it
     after you have shared the link.
   - **Name**, **Category**, **Occasions** (tick all that fit), **Price (₹)**.
   - **Availability**: In stock, Made to order, or Sold out.
   - **Featured**: tick to promote it on the home page.
4. **Details tab.** Colour family (for the Colour filter) and colour name (what you would say to a customer),
   optional **Other colours available**, fabric, weave, saree length in metres (leave empty for non-sarees),
   blouse piece included, care instructions, and a one or two line description.
5. **Photos tab.** Upload in this fixed order: **1 Full piece, 2 Pallu, 3 Border** (all three are required),
   then 4 Blouse piece, 5 Texture close-up, 6 Extra (optional). Photos must be 4:5 portrait. The Studio refuses
   anything else. The alt text for screen readers is written automatically from the fabric, colour and name.
6. Click **Publish**. If anything is missing, Studio shows a red message and the button stays disabled. In
   particular a product with fewer than 3 photos **cannot be published**.
7. Within about a minute the product appears in the shop, on `/p/VS-1011`, and in the sitemap. (Instantly if
   you set up the optional webhook below.)

To mark something sold out: open the product, set Availability to **Sold out**, Publish. It stays visible, moves
to the end of the list and the WhatsApp message changes to "when will you have something similar?".

Other things you can edit without a developer: **Home page** (hero, occasion tiles), **About page**,
**Contact page**, **Delivery and returns**, and **Shop details** (WhatsApp number, phone, address, opening hours,
reviews, shop photo).

### Using the link in Instagram

Every product has a short link, `https://your-site/p/{SKU}`: put it in your bio, a story link sticker or a
caption. When the link is shared in WhatsApp or Instagram DMs it shows a preview card with the photo, name,
colour and price. (Check a new link by sending it to yourself on WhatsApp.)

---

## For the developer

### Run it locally

```bash
npm install
npm run dev
```

With no environment variables the site runs on the 10 sample products in `data/products.seed.json`.

**Demo images:** in that mode the product galleries, hero, occasion tiles, shop photo and About photo are free
Unsplash stock photos, hot-linked (nothing is committed), chosen by colour in `src/lib/demo-images.ts`. They are
there so the owner can see the finished look. They are *not* product-only (most show models), and the pallu,
border, blouse and texture views are zoomed crops of the same photo. Delete `demo-images.ts` once real photos are
in. Set `NEXT_PUBLIC_DEMO_IMAGES=off` for drawn placeholders instead; CI and the Playwright tests do this so they
never depend on a third-party host. Demo images switch off automatically when a Sanity project is configured.

### Environment variables

Copy `.env.example` to `.env.local`. **Never commit real values**; `.env*` is git-ignored.

| Variable | Public? | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | yes | Origin used in WhatsApp links and share previews. Falls back to the Vercel URL. |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` | yes | Turns the CMS on. Empty means sample data. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | yes | Fallback number if "Shop details" is not filled in. |
| `SANITY_REVALIDATE_SECRET` | **secret** | Verifies the optional publish webhook. |
| `SANITY_API_WRITE_TOKEN` | **secret** | Only for `npm run seed`, run on your machine. Not needed on Vercel. |

### Set up the CMS (one time, about 15 minutes)

1. Create a free project at <https://www.sanity.io/manage>. Note the **Project ID**. Dataset: `production`.
2. In the project's **API → CORS origins** add your site URL (and `http://localhost:3000`) with
   *Allow credentials* on. This is what lets `/studio` sign in.
3. Put the Project ID and dataset in `.env.local` and in Vercel's environment variables.
4. Open `/studio`. Fill in **Shop details** first (WhatsApp number is required), then Home, About, Contact,
   Delivery and returns.
5. *(Optional)* load the 10 sample products as **drafts** so the owner can see the shape of the data:

   ```bash
   SANITY_API_WRITE_TOKEN=<editor token from sanity.io/manage> npm run seed
   ```

   They arrive without photos, so none can go live until real photos are added (by design). Replace the sample
   details with real stock first.
6. *(Optional, for instant updates)* In Sanity: **API → Webhooks → Create**. URL
   `https://your-site/api/revalidate`, trigger on Create, Update and Delete, projection `{_type, _id}`, set a
   secret and use the same value for `SANITY_REVALIDATE_SECRET` in Vercel. Without it pages refresh within 60
   seconds anyway.
7. Invite the owner: **Members → Invite** (Editor role).

### How content reaches the site

- All CMS reads go through `src/lib/data.ts` with `revalidate: 60` and a `sanity` cache tag. Product, home, about,
  contact and policy pages are statically generated and re-generated at most once a minute (ISR); a new SKU is
  generated on its first visit.
- `/shop` renders per request so that links like `/shop?occasion=wedding` arrive already filtered in the HTML.
  It reads the same 60-second cache, so it does not hit the CMS on every visit.
- The shop sends every product (a small card each) to the browser and filters there. That is instant and fine up
  to roughly 1,000 products. Beyond that, move filtering to the server (`getProducts` and
  `src/lib/shop-filter.ts` are the two places to change). The grid only renders 12 cards at a time and adds more
  on scroll.
- Defence in depth: even if a product slipped through with fewer than 3 photos, the query that feeds the site
  filters it out.

### Instagram to WhatsApp flow

- `/p/{SKU}` is the product page itself (case-insensitive). Its `<title>`, Open Graph and Twitter tags, canonical
  URL and an `opengraph-image` card are generated per product: photo, name, colour, price and SKU.
- The WhatsApp message (see `src/lib/whatsapp.ts`):

  ```text
  Hi Sri Vasthra, I'd like to enquire about this:

  SKU: VS-1001
  Kanjivaram Zari Silk Saree
  Colour: Peacock Green
  Price: ₹18,500
  https://your-site/p/VS-1001

  Is it available?
  ```

- "Add to list" builds an **enquiry list** (kept in the browser's local storage, one line per SKU and colour).
  `/list` sends the whole list as one numbered WhatsApp message.
- Without a number set anywhere, `wa.me` opens WhatsApp's contact picker instead of messaging a stranger.

### Measurement

Vercel Analytics is mounted in the site layout. Custom events (`src/lib/analytics.ts`):

| Event | Properties |
|-------|-----------|
| `whatsapp_click` | `sku` (`list` for the enquiry list, `general` on Contact), `source`, `colour` / `items` |
| `add_to_list` | `sku`, `source` |
| `search` | `term`, `results` |
| `filter_use` | `filter` (category, occasion, colour, price, availability, sort), `value` |

Custom events require Vercel Analytics on a plan that supports them. Enable Web Analytics in the Vercel project
settings. Locally the script 404s, which is expected.

### Deploy (Vercel from GitHub)

1. Push to GitHub, then **Add New Project** in Vercel and import the repo. Framework: Next.js (auto-detected).
2. Add the environment variables above (Production and Preview).
3. Every pull request automatically gets a **preview deployment** and a comment with its URL (Vercel's GitHub
   integration; nothing to configure). Enable branch protection on `main` to require the CI checks below.
4. Add the production domain in **Settings → Domains** and set `NEXT_PUBLIC_SITE_URL` to it.

### Quality gates

`.github/workflows/ci.yml` runs on every pull request and push to `main`:

| Job | What it does |
|-----|--------------|
| Lint, types, build | `npm run lint`, `npm run typecheck`, `npm run build` |
| Playwright (375px) | 15 tests at a 375 x 812 touch viewport: browse, filters and sort sheet, pinned chip bar, product page, gallery and zoom, sticky buttons at 44px or more, WhatsApp link contents, enquiry list, share-preview tags, no sideways scroll |
| Lighthouse | `@lhci/cli` against four pages in mobile mode with a Slow-4G profile (`lighthouserc.json`). Accessibility, best practices and SEO must be 95 or more; LCP must be 2.0 s or less; performance below 0.95 raises a warning |

Run the tests locally with `npm run test:e2e` (it builds first; one-off Chromium download:
`npx playwright install chromium`).

Other guarantees: no image files are committed (placeholders are drawn in CSS, real photos live in Sanity);
secrets are only read from the environment; images are served as AVIF/WebP at sizes matched to 360 to 430px
phones with blur placeholders from Sanity's own low-quality preview.

### Measured performance (this repo, sample data, local machine)

Lighthouse (via `@lhci/cli` 0.15), mobile emulation, Chrome DevTools Slow-4G throttling + 4x CPU slowdown, median of 2 runs
(home, shop, product, contact): performance 0.94 to 0.98, accessibility 0.98 to 1, best practices 0.96,
SEO 1.0; LCP 1.1 to 1.6 s; CLS 0.

Read these numbers with care:

- They were measured against the sample catalogue **with no photographs**. The largest element on every page
  today is text. Once real product photos are in, LCP will be an image. `priority` loading and AVIF/WebP are in
  place, but **re-run Lighthouse on a deployed preview URL with real photos** before treating the 2.0 s target as
  met.
- Lighthouse's default *simulated* throttling is harsher and reported LCP of 2.3 to 2.9 s for the same pages
  while keeping the category scores at 0.94 to 0.97.
- Best practices is 0.96, not 1.0, locally because the Vercel Analytics script does not exist outside Vercel.
- Performance is borderline around 0.95 on home and shop. Most of the remaining cost is the React and Next
  runtime. If it dips on a deployed build, the first levers are fewer client components on the home page and
  trimming the `ShopClient` payload.

### Design decisions worth knowing

- Headings use one webfont weight (`display: optional`); body text uses the phone's own font. That keeps first
  paint fast and covers Telugu if you add it later.
- Bottom sheets (filters, sort, menu) use the native `<dialog>`, so focus trapping, Esc and inert background are
  free. They are portalled to `<body>`.
- The map is a click-to-load facade (a Google Maps iframe is about 400 KB) with an "Open in Google Maps" link
  that always works.
- Reduced motion is respected globally in `globals.css`. Safe-area insets are applied to the header and the
  sticky action bars.

### Project map

```text
data/products.seed.json     10 sample products (single source for fallback and `npm run seed`)
sanity/schemaTypes/         product + page schemas (3 required photos, 4:5 check, unique SKU)
sanity.config.ts            Studio config embedded at /studio, singletons for the page documents
src/lib/data.ts             all CMS reads, mapping, alt-text generation, sample-data fallback
src/lib/whatsapp.ts         message builders and wa.me links
src/lib/shop-filter.ts      pure filter/sort used on server and client
src/app/(site)/             pages: home, shop, p/[sku], list, about, contact, policies
src/app/api/revalidate/     optional signed webhook for instant refresh
tests/e2e.spec.ts           Playwright suite
```
