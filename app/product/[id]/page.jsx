import { notFound } from "next/navigation";
import { getProductById } from "@/lib/firebaseAdmin";
import ProductDetailClient from "./ProductDetailClient";

export const revalidate = 60;

const KNOWN_PRODUCT_FALLBACKS = {
  "struk-spbu": {
    name: "Struk SPBU Generator Android",
    category: "Android App",
    platform: "Android",
    description: "Aplikasi pencetak struk dan nota SPBU otomatis untuk Android. Mendukung printer thermal Bluetooth dan berbagai jenis SPBU.",
    price: { monthly: 80000, yearly: 860000 }
  },
  "kasir_q": {
    name: "KasirQ POS Kasir UMKM",
    category: "Android App",
    platform: "Android",
    description: "Aplikasi kasir Point of Sale (POS) cepat dan praktis untuk toko, retail, dan UMKM.",
    price: { monthly: 50000, yearly: 500000 }
  },
  "wa-direct": {
    name: "WA Direct & Automation Pro",
    category: "Android & Extension",
    platform: "Android / Web",
    description: "Aplikasi kirim pesan WhatsApp langsung tanpa simpan kontak dan automasi follow-up pelanggan.",
    price: { monthly: 45000, yearly: 450000 }
  }
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = (await getProductById(id)) || KNOWN_PRODUCT_FALLBACKS[id];

  if (!product) {
    return {
      title: "Produk Software Tidak Ditemukan | Primadev Store",
      description: "Halaman produk software tidak ditemukan di katalog Primadev Store."
    };
  }

  const productName = product.name || "Software License";
  const desc = product.description || product.shortDesc || `Beli lisensi resmi ${productName} original bergaransi dari PT Primadev Digital Technology dengan aktivasi instan 24/7.`;
  const canonicalUrl = `https://store.primadev.id/product/${encodeURIComponent(id)}`;

  return {
    title: `${productName} | Beli Lisensi Resmi`,
    description: desc,
    keywords: [
      productName,
      `Lisensi ${productName}`,
      `Beli Lisensi ${productName}`,
      "Primadev Store",
      "Software Digital Resmi",
      "PT Primadev Digital Technology"
    ],
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      type: "website",
      title: `${productName} | Beli Lisensi Resmi - Primadev Store`,
      description: desc,
      url: canonicalUrl,
      images: [
        {
          url: "/primadev_light.png",
          width: 1200,
          height: 630,
          alt: `${productName} - Primadev Store`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${productName} | Primadev Store`,
      description: desc,
      images: ["/primadev_light.png"]
    }
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = (await getProductById(id)) || KNOWN_PRODUCT_FALLBACKS[id];

  if (!product) {
    notFound();
  }

  const prices = product.price || {};
  const minPrice = Math.min(...Object.values(prices).filter((v) => Number(v) > 0));
  const offers = Object.entries(prices)
    .filter(([_, val]) => Number(val) > 0)
    .map(([plan, val]) => ({
      "@type": "Offer",
      "name": `Lisensi ${plan === "yearly" ? "Tahunan" : plan === "lifetime" ? "Lifetime" : "Bulanan"}`,
      "price": val,
      "priceCurrency": "IDR",
      "availability": "https://schema.org/InStock",
      "url": `https://store.primadev.id/checkout?app=${encodeURIComponent(id)}&plan=${plan}`,
      "seller": {
        "@type": "Organization",
        "name": "PT Primadev Digital Technology"
      }
    }));

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": ["Product", "SoftwareApplication"],
    "name": product.name,
    "description": product.description || product.shortDesc || `Lisensi resmi aplikasi ${product.name}`,
    "operatingSystem": product.platform || "Android",
    "applicationCategory": "BusinessApplication",
    "offers": offers.length > 0 ? offers : {
      "@type": "Offer",
      "price": minPrice > 0 ? minPrice : 80000,
      "priceCurrency": "IDR",
      "availability": "https://schema.org/InStock"
    },
    "brand": {
      "@type": "Brand",
      "name": "Primadev Digital Technology"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient id={id} product={product} />
    </>
  );
}
