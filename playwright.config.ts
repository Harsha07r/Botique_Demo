import { defineConfig } from "@playwright/test";

const PORT = 3100;
const env = {
  NEXT_PUBLIC_WHATSAPP_NUMBER: "919876500000", // dummy number for tests only
  NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
  NEXT_PUBLIC_SANITY_PROJECT_ID: "", // tests run on data/products.seed.json
  NEXT_PUBLIC_DEMO_IMAGES: "off", // no third-party image host in tests
  ...(process.env.CI ? {} : { NEXT_DIST_DIR: ".next-test" }),
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // 375px wide phone, touch, 3x pixel ratio
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    trace: "retain-on-failure",
  },
  projects: [{ name: "mobile-375", use: { browserName: "chromium" } }],
  webServer: {
    // CI builds in an earlier step; locally the build happens here
    command: process.env.CI ? `npx next start -p ${PORT}` : `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env,
  },
});
