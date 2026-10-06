import { Suspense } from "react";
import RenewClient from "./RenewClient";

export const metadata = {
  title: "Perpanjang Masa Aktif Lisensi Software | Primadev Digital Technology",
  description: "Perpanjang masa aktif lisensi software Primadev Anda secara instan 24/7 tanpa kehilangan konfigurasi dan data aplikasi Anda.",
  keywords: [
    "Perpanjang Lisensi Software",
    "Renew Software License",
    "Perpanjangan Struk SPBU",
    "Perpanjangan KasirQ POS",
    "Primadev Digital Technology",
    "Aktivasi Lisensi Otomatis"
  ],
  alternates: {
    canonical: "https://store.primadev.id/renew"
  },
  openGraph: {
    title: "Perpanjang Masa Aktif Lisensi Software | Primadev Digital Technology",
    description: "Perpanjang masa aktif lisensi aplikasi bisnis Anda secara instan 24/7 tanpa reset konfigurasi.",
    url: "https://store.primadev.id/renew",
    images: [{ url: "/primadev_light.png", width: 1200, height: 630, alt: "Perpanjang Lisensi Primadev Digital Technology" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Perpanjang Masa Aktif Lisensi Software | Primadev Digital Technology",
    description: "Perpanjang masa aktif lisensi software Primadev secara instan dan otomatis.",
    images: ["/primadev_light.png"]
  }
};

const renewJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Perpanjang Masa Aktif Lisensi Software",
  "url": "https://store.primadev.id/renew",
  "description": "Portal perpanjangan masa aktif lisensi software resmi PT Primadev Digital Technology.",
  "publisher": {
    "@type": "Organization",
    "name": "PT Primadev Digital Technology",
    "url": "https://primadev.id"
  }
};

export default function RenewPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(renewJsonLd) }}
      />
      <Suspense fallback={
        <div className="status-page-wrapper">
          <div className="status-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '40px' }}>
            <div style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Memuat halaman perpanjangan...</div>
          </div>
        </div>
      }>
        <RenewClient />
      </Suspense>
    </>
  );
}
