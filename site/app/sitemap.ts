import type { MetadataRoute } from "next";
import { getSiteUrl, PUBLIC_ROUTES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = getSiteUrl();
    const lastModified = new Date();
    return PUBLIC_ROUTES.map((route) => ({
        url: `${baseUrl}${route === "/" ? "" : route}`,
        lastModified,
        changeFrequency: route === "/" || route === "/planos" ? "weekly" : "monthly",
        priority: route === "/" ? 1 : route === "/planos" ? 0.9 : 0.5,
    }));
}
