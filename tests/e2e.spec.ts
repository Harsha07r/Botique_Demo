import { expect, test, type Page } from "@playwright/test";

const WA = /^https:\/\/wa\.me\/919876500000\?text=/;
// Wait for hydration before tapping: clicks that land before React attaches do nothing.
test.beforeEach(async ({ page }) => {
  const goto = page.goto.bind(page);
  page.goto = (async (url: string, opts?: Parameters<typeof goto>[1]) => {
    const res = await goto(url, opts);
    await page.waitForLoadState("networkidle");
    return res;
  }) as typeof page.goto;
});

const waText = (href: string | null) => decodeURIComponent((href ?? "").split("?text=")[1] ?? "");

async function noSidewaysScroll(page: Page) {
  // On a phone, content wider than the screen widens the layout viewport. Both numbers must stay at 375.
  const [inner, scroll] = await page.evaluate(() => [window.innerWidth, document.documentElement.scrollWidth]);
  expect({ inner, scroll }, "page must not scroll sideways").toEqual({ inner: 375, scroll: 375 });
}

test.describe("browse", () => {
  test("home shows hero, occasion row and new arrivals without sideways scroll", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Shop by occasion" })).toBeVisible();
    await expect(page.getByTestId("product-card").first()).toBeVisible();
    await noSidewaysScroll(page);
  });

  test("occasion tile opens the shop already filtered", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Wedding" }).click();
    await expect(page).toHaveURL(/occasion=wedding/);
    await expect(page.getByTestId("result-count")).toHaveText("5 pieces");
    await noSidewaysScroll(page);
  });

  test("shop lists the catalogue and the cards link to product pages", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByTestId("result-count")).toHaveText("10 pieces");
    await page.getByTestId("product-card").first().getByRole("link").first().click();
    await expect(page).toHaveURL(/\/p\/VS-\d+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("header menu reaches every key page", async ({ page }) => {
    await page.goto("/");
    for (const [label, url] of [
      ["About us", /\/about/],
      ["Visit and contact", /\/contact/],
      ["Delivery and returns", /\/policies/],
    ] as const) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page.getByRole("dialog").getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(url);
    }
    await page.goto("/contact");
    await expect(page.getByRole("link", { name: /^Call / })).toBeVisible();
    await noSidewaysScroll(page);
  });
});

test.describe("filter", () => {
  test("occasion, availability, price, colour and search narrow the list and can be cleared", async ({ page }) => {
    await page.goto("/shop");
    const count = page.getByTestId("result-count");

    await page.getByRole("button", { name: /^Occasion/ }).click();
    await page.getByRole("radio", { name: "Wedding" }).click();
    await expect(count).toHaveText("5 pieces");
    await expect(page).toHaveURL(/occasion=wedding/);

    await page.getByRole("button", { name: /^Availability/ }).click();
    await page.getByRole("radio", { name: "Made to order" }).click();
    await expect(count).toHaveText("2 pieces");

    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(count).toHaveText("10 pieces");

    await page.getByRole("button", { name: /^Price/ }).click();
    await page.getByRole("radio", { name: "Under ₹3,000" }).click();
    await expect(count).toHaveText("2 pieces");

    await page.getByRole("button", { name: "Clear all" }).click();
    await page.getByRole("button", { name: /^Colour/ }).click();
    await page.getByRole("radio", { name: "Green" }).click();
    await expect(count).toHaveText("1 piece");

    await page.getByRole("button", { name: "Clear all" }).click();
    await page.getByRole("button", { name: "Search" }).click();
    await page.getByRole("searchbox").fill("kanjivaram");
    await page.getByRole("dialog").getByRole("button", { name: "Search" }).click();
    await expect(count).toHaveText("1 piece");
    await expect(page.getByTestId("product-card")).toHaveAttribute("data-sku", "VS-1001");
  });

  test("sort sheet reorders by price", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: /^Sort:/ }).click();
    await page.getByRole("radio", { name: "Price: low to high" }).click();
    await expect(page.getByTestId("product-card").first()).toHaveAttribute("data-sku", "VS-1005"); // Rs 1,800
  });

  test("filter bar stays pinned while scrolling", async ({ page }) => {
    await page.goto("/shop");
    await page.evaluate(() => window.scrollTo(0, 600));
    const top = await page.getByRole("toolbar", { name: "Filters and sort" }).evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeLessThan(120);
    expect(top).toBeGreaterThanOrEqual(0);
  });

  test("no matches offers a WhatsApp enquiry", async ({ page }) => {
    await page.goto("/shop?colour=black&occasion=puja");
    await expect(page.getByText("Nothing matches these filters")).toBeVisible();
    const href = await page.getByRole("link", { name: "Ask us on WhatsApp" }).getAttribute("href");
    expect(href).toMatch(WA);
  });
});

test.describe("product page", () => {
  test("shows details, availability, gallery and a sticky main action", async ({ page }) => {
    await page.goto("/p/VS-1001");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kanjivaram Zari Silk Saree");
    await expect(page.getByTestId("price")).toHaveText("₹18,500");
    await expect(page.getByText("In stock").first()).toBeVisible();
    const details = page.locator("dl");
    for (const k of ["Fabric", "Saree length", "Blouse piece", "Care"]) await expect(details.getByText(k, { exact: true })).toBeVisible();
    await expect(details.getByText("6.3 metres")).toBeVisible();

    // gallery: fixed photo order, jump via dots, zoom dialog
    await page.getByRole("button", { name: "Show Pallu" }).click();
    await expect(page.getByText("Pallu", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Zoom photo: Pallu" }).click();
    await expect(page.getByRole("dialog", { name: /Zoomed photo/ })).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();

    // sticky bar: pinned to the bottom after scrolling, tap targets at least 44px
    await page.evaluate(() => window.scrollTo(0, 400));
    const wa = page.getByRole("link", { name: "Enquire on WhatsApp" });
    const add = page.getByRole("button", { name: "Add to list" });
    for (const el of [wa, add]) {
      const box = (await el.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.y + box.height).toBeLessThanOrEqual(812);
      expect(box.y).toBeGreaterThan(812 - 120);
    }
    await noSidewaysScroll(page);
  });

  test("short link is case-insensitive and unknown SKUs 404", async ({ page }) => {
    const ok = await page.goto("/p/vs-1002");
    expect(ok?.status()).toBe(200);
    const missing = await page.goto("/p/NOPE-1");
    expect(missing?.status()).toBe(404);
  });

  test("share preview tags carry name, price and an image", async ({ request }) => {
    const html = await (await request.get("/p/VS-1004")).text();
    expect(html).toMatch(/property="og:title" content="[^"]*₹2,400/);
    expect(html).toMatch(/property="og:image" content="[^"]+opengraph-image/);
    expect(html).toMatch(/name="twitter:card" content="summary_large_image"/);
    expect(html).toContain('rel="canonical" href="http://localhost:3100/p/VS-1004"');
  });

  test("OG image endpoint renders a PNG", async ({ request, page }) => {
    await page.goto("/p/VS-1004");
    const src = await page.locator('meta[property="og:image"]').getAttribute("content");
    const res = await request.get(new URL(src!).pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});

test.describe("whatsapp", () => {
  test("enquiry link identifies the exact item: SKU, name, colour, price, link", async ({ page }) => {
    await page.goto("/p/VS-1001");
    let href = await page.getByRole("link", { name: "Enquire on WhatsApp" }).getAttribute("href");
    expect(href).toMatch(WA);
    let text = waText(href);
    expect(text).toContain("SKU: VS-1001");
    expect(text).toContain("Kanjivaram Zari Silk Saree");
    expect(text).toContain("Colour: Peacock Green");
    expect(text).toContain("Price: ₹18,500");
    expect(text).toContain("http://localhost:3100/p/VS-1001");

    // the chosen colour flows into the message
    await page.getByRole("button", { name: "Temple Maroon" }).click();
    href = await page.getByRole("link", { name: "Enquire on WhatsApp" }).getAttribute("href");
    text = waText(href);
    expect(text).toContain("Colour: Temple Maroon");
  });

  test("sold-out piece asks about similar stock", async ({ page }) => {
    await page.goto("/p/VS-1007");
    const text = waText(await page.getByRole("link", { name: "Enquire on WhatsApp" }).getAttribute("href"));
    expect(text).toContain("SKU: VS-1007");
    expect(text).toContain("sold out");
  });
});

test.describe("enquiry list", () => {
  test("add from shop and product page, send as one message, remove, persist", async ({ page }) => {
    await page.goto("/shop");
    await page.getByRole("button", { name: "Add Kanjivaram Zari Silk Saree to enquiry list" }).click();
    await expect(page.getByTestId("list-count")).toHaveText("1");

    await page.goto("/p/VS-1004");
    await page.getByRole("button", { name: "Add to list" }).click();
    await expect(page.getByRole("button", { name: "Added ✓" })).toBeVisible();
    await expect(page.getByTestId("list-count")).toHaveText("2");

    // adding the same SKU and colour again does not duplicate it
    await page.getByRole("button", { name: /Added|Add to list/ }).click();
    await expect(page.getByTestId("list-count")).toHaveText("2");

    await page.getByRole("link", { name: /Enquiry list, 2 items/ }).click();
    await expect(page).toHaveURL(/\/list/);
    await expect(page.getByTestId("list-items").getByRole("listitem")).toHaveCount(2);

    const href = await page.getByRole("link", { name: "Send list on WhatsApp" }).getAttribute("href");
    expect(href).toMatch(WA);
    const text = waText(href);
    expect(text).toContain("these 2 items");
    for (const s of ["SKU: VS-1001", "SKU: VS-1004", "http://localhost:3100/p/VS-1001", "http://localhost:3100/p/VS-1004", "Price: ₹2,400"]) {
      expect(text).toContain(s);
    }

    await page.reload(); // survives a reload
    await expect(page.getByTestId("list-items").getByRole("listitem")).toHaveCount(2);

    await page.getByRole("button", { name: /Remove Venkatagiri/ }).click();
    await expect(page.getByTestId("list-items").getByRole("listitem")).toHaveCount(1);
    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByText("Your enquiry list is empty")).toBeVisible();
  });
});
