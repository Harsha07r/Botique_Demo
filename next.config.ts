import path from "node:path";
import type { NextConfig } from "next";

const config: NextConfig = {
  // A stray lockfile higher up the OneDrive tree made Next guess the wrong root
  outputFileTracingRoot: path.resolve(__dirname),
  turbopack: { root: path.resolve(__dirname) },
  poweredByHeader: false,
  // Most visitors are first-time Instagram arrivals on 4G: inline the ~8 KB of CSS instead of a blocking request
  experimental: { inlineCss: true },
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Product photos are 4:5; these widths cover 360-430px phones at 1x-3x.
    deviceSizes: [360, 414, 480, 640, 828, 1080, 1440],
    imageSizes: [96, 160, 240, 320],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default config;
