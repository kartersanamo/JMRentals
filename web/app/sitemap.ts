import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://jm.kartersanamo.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/amenities",
    "/gallery",
    "/book",
    "/terms",
    "/privacy",
  ];

  const lastModified = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
