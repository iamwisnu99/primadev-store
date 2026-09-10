export default function robots() {
  const baseUrl = "https://store.primadev.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/checkout",
          "/waiting-payment",
          "/thankyou"
        ]
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "anthropic-ai",
          "Claude-Web",
          "PerplexityBot",
          "Google-Extended",
          "Cohere-ai",
          "CCBot",
          "OAI-SearchBot",
          "Diffbot",
          "Bytespider"
        ],
        allow: [
          "/",
          "/llms.txt",
          "/llms-full.txt",
          "/renew",
          "/check-license",
          "/support",
          "/product/"
        ],
        disallow: [
          "/api/",
          "/checkout",
          "/waiting-payment",
          "/thankyou"
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
