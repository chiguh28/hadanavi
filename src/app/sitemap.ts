import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hadanavi.vercel.app";

  const skinTypes = ["dry", "oily", "combination", "sensitive", "normal"];
  const concerns = [
    "dryness",
    "pores",
    "acne",
    "dullness",
    "spots",
    "aging",
    "redness",
    "oiliness",
  ];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shindan`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guide/skincare-basics`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const skinTypePages: MetadataRoute.Sitemap = skinTypes.map((type) => ({
    url: `${baseUrl}/skin-type/${type}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const concernPages: MetadataRoute.Sitemap = concerns.map((concern) => ({
    url: `${baseUrl}/concern/${concern}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...skinTypePages, ...concernPages];
}
