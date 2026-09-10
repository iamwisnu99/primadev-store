import SupportClient from "./SupportClient";

export const metadata = {
  title: "Pusat Bantuan & Layanan Pelanggan | Primadev Store",
  description: "Hubungi tim teknis dan layanan pelanggan PT Primadev Digital Technology untuk kendala aktivasi lisensi, status pembayaran, atau konsultasi aplikasi.",
  keywords: [
    "Bantuan Primadev Store",
    "Customer Support Primadev",
    "Kontak Primadev",
    "WhatsApp Support Primadev",
    "Bantuan Aktivasi Lisensi",
    "Customer Service Software"
  ],
  alternates: {
    canonical: "https://store.primadev.id/support"
  },
  openGraph: {
    title: "Pusat Bantuan & Layanan Pelanggan | Primadev Store",
    description: "Layanan bantuan teknis dan customer service 24/7 resmi dari PT Primadev Digital Technology.",
    url: "https://store.primadev.id/support",
    images: [{ url: "/primadev_light.png", width: 1200, height: 630, alt: "Bantuan Primadev Store" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Pusat Bantuan & Customer Support | Primadev Store",
    description: "Hubungi tim pengembang dan customer support resmi Primadev Digital Technology.",
    images: ["/primadev_light.png"]
  }
};

const supportJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Pusat Bantuan & Layanan Pelanggan Primadev",
  "url": "https://store.primadev.id/support",
  "description": "Formulir tiket bantuan resmi dan kontak WhatsApp PT Primadev Digital Technology.",
  "mainEntity": {
    "@type": "Organization",
    "name": "PT Primadev Digital Technology",
    "telephone": "+62-838-2952-0561",
    "email": "support.primadev@gmail.com",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+62-838-2952-0561",
      "contactType": "customer support",
      "availableLanguage": ["Indonesian", "English"]
    }
  }
};

export default function SupportPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(supportJsonLd) }}
      />
      <SupportClient />
    </>
  );
}
