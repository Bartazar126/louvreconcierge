import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/site";

const routes = [
  "",
  "/fr",
  "/es",
  "/de",
  "/it",
  "/about",
  "/about-us",
  "/contact",
  "/faq",
  "/disclaimer",
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/payment-policy",
  "/cookie",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
