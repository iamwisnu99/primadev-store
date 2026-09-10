import CheckLicenseClient from "./CheckLicenseClient";

export const metadata = {
  title: "Cek Status & Masa Aktif Lisensi Software | Primadev Store",
  description: "Periksa keaslian lisensi, aplikasi terdaftar, status masa aktif, dan validitas kepemilikan software Primadev Digital Technology Anda secara online.",
  keywords: [
    "Cek Lisensi Software",
    "Validasi Lisensi Primadev",
    "Check License Key",
    "Status Lisensi Aplikasi",
    "Cek Masa Aktif Lisensi",
    "Primadev Store"
  ],
  alternates: {
    canonical: "https://store.primadev.id/check-license"
  },
  openGraph: {
    title: "Cek Status & Keaslian Lisensi Software | Primadev Store",
    description: "Periksa status keaslian, aplikasi terdaftar, dan sisa masa aktif lisensi software Anda.",
    url: "https://store.primadev.id/check-license",
    images: [{ url: "/primadev_light.png", width: 1200, height: 630, alt: "Cek Lisensi Primadev Store" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Cek Status & Keaslian Lisensi | Primadev Store",
    description: "Periksa keaslian dan masa berlaku lisensi aplikasi software Anda.",
    images: ["/primadev_light.png"]
  }
};

const checkLicenseJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Cek Status & Masa Aktif Lisensi Software",
  "url": "https://store.primadev.id/check-license",
  "description": "Layanan verifikasi status keaslian dan masa aktif lisensi software resmi PT Primadev Digital Technology.",
  "publisher": {
    "@type": "Organization",
    "name": "PT Primadev Digital Technology",
    "url": "https://primadev.id"
  }
};

export default function CheckLicensePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(checkLicenseJsonLd) }}
      />
      <CheckLicenseClient />
    </>
  );
}
