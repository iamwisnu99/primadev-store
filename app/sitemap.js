import { getProductsFromDb } from "@/lib/firebaseAdmin";

export default async function sitemap() {
  const baseUrl = "https://store.primadev.id";
  const lastModified = new Date();

  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${baseUrl}/renew`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/check-license`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${baseUrl}/support`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7
    }
  ];

  const productPages = [];
  try {
    const products = await getProductsFromDb();
    const productKeys = Object.keys(products || {});

    // Ensure known product IDs are always covered even if DB is cold
    const allKeys = new Set([...productKeys, "struk-spbu", "kasir_q", "wa-direct"]);

    for (const key of allKeys) {
      productPages.push({
        url: `${baseUrl}/product/${encodeURIComponent(key)}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.9
      });
    }
  } catch (err) {
    console.error("[SITEMAP GENERATION ERROR]:", err);
  }

  return [...staticPages, ...productPages];
}
