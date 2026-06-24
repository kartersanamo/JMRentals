import type { NextConfig } from "next";

const isDockerBuild = process.env.DOCKER_BUILD === "1";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jm.kartersanamo.com";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com",
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://api.stripe.com",
      "frame-src https://js.stripe.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: isDockerBuild,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "react-map-gl",
      "mapbox-gl",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
