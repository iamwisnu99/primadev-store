import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://store.primadev.id"),
  title: {
    default: "Primadev Digital Technology | Toko Lisensi Software Digital Resmi & Bergaransi",
    template: "%s | Primadev Digital Technology",
  },
  description: "Toko resmi pembelian lisensi software digital dari PT Primadev Digital Technology. Beli lisensi aplikasi bisnis, kasir POS, dan automasi marketing original dengan aktivasi instan otomatis 24/7 dan garansi resmi.",
  applicationName: "Primadev Digital Technology",
  appleWebApp: {
    title: "Primadev Digital Technology",
    statusBarStyle: "default",
  },
  authors: [{ name: "PT Primadev Digital Technology", url: "https://primadev.id" }],
  generator: "Next.js",
  keywords: [
    "Primadev Digital Technology",
    "Primadev Store",
    "PT Primadev Digital Technology",
    "Beli Lisensi Software",
    "Toko Lisensi Digital Resmi",
    "Lisensi Aplikasi Bisnis",
    "Aplikasi Struk SPBU Android",
    "KasirQ POS Kasir UMKM",
    "WA Direct Automation Pro",
    "Software House Banyumas Jawa Tengah",
    "Aktivasi Otomatis 24 Jam",
    "Perpanjang Lisensi Software",
    "Cek Lisensi Software Resmi",
    "Lisensi Bergaransi Resmi Kemenkumham"
  ],
  alternates: {
    canonical: "https://store.primadev.id",
    languages: {
      "id-ID": "https://store.primadev.id",
      "en-US": "https://store.primadev.id"
    }
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  category: "technology",
  classification: "Software Store & Digital Licensing",
  openGraph: {
    type: "website",
    siteName: "Primadev Digital Technology",
    title: "Primadev Digital Technology | Toko Lisensi Software Digital Resmi & Bergaransi",
    description: "Beli lisensi aplikasi bisnis, kasir POS, dan automasi original dengan aktivasi instan otomatis 24/7, bergaransi resmi dari PT Primadev Digital Technology.",
    url: "https://store.primadev.id",
    locale: "id_ID",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/primadev_light.png",
        width: 1200,
        height: 630,
        alt: "Primadev Digital Technology - Toko Lisensi Software Digital Resmi"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Primadev Digital Technology | Toko Lisensi Software Digital Resmi & Bergaransi",
    description: "Beli lisensi aplikasi bisnis & marketing original dengan aktivasi instan otomatis 24/7.",
    images: ["/primadev_light.png"],
    creator: "@primadev_id"
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  manifest: "/site.webmanifest"
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://store.primadev.id/#organization",
      "name": "PT Primadev Digital Technology",
      "alternateName": [
        "Primadev Digital Technology",
        "Primadev Store",
        "Primadev"
      ],
      "url": "https://primadev.id",
      "logo": "https://store.primadev.id/primadev_light.png",
      "sameAs": [
        "https://instagram.com/primadev.id",
        "https://tiktok.com/@primadev.id"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+62-838-2952-0561",
        "contactType": "customer service",
        "email": "support.primadev@gmail.com",
        "areaServed": "ID",
        "availableLanguage": ["Indonesian", "English"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Wangon",
        "addressLocality": "Kecamatan Wangon, Kabupaten Banyumas",
        "addressRegion": "Jawa Tengah",
        "postalCode": "53176",
        "addressCountry": "ID"
      }
    },
    {
      "@type": "WebSite",
      "@id": "https://store.primadev.id/#website",
      "url": "https://store.primadev.id",
      "name": "Primadev Digital Technology",
      "alternateName": [
        "Primadev",
        "PT Primadev Digital Technology",
        "Primadev Store"
      ],
      "description": "Toko resmi lisensi software digital dari PT Primadev Digital Technology dengan aktivasi instan 24/7.",
      "publisher": {
        "@id": "https://store.primadev.id/#organization"
      },
      "inLanguage": ["id-ID", "en-US"]
    },
    {
      "@type": "FAQPage",
      "@id": "https://store.primadev.id/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Bagaimana cara mendapatkan License Key setelah pembayaran?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "License Key akan langsung muncul di layar sukses setelah transaksi terverifikasi dan otomatis dikirimkan ke alamat email Anda."
          }
        },
        {
          "@type": "Question",
          "name": "Apakah bisa memperpanjang lisensi sebelum masa aktif habis?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bisa. Anda cukup membuka menu 'Perpanjang Lisensi', memasukkan License Key Anda saat ini, dan memilih durasi perpanjangan. Masa aktif akan otomatis terakumulasi."
          }
        },
        {
          "@type": "Question",
          "name": "Metode pembayaran apa saja yang didukung?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Kami mendukung QRIS (semua e-wallet dan m-banking), Virtual Account (BCA, BRI, BNI, Mandiri, Permata, CIMB Niaga), GoPay, ShopeePay, DANA, OVO, dan Alfamart/Indomaret."
          }
        },
        {
          "@type": "Question",
          "name": "Apakah saya mendapatkan invoice resmi?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Ya, invoice digital berformat PDF dengan rincian transaksi lengkap dapat diunduh langsung di halaman pembayaran sukses dan juga dilampirkan dalam email konfirmasi."
          }
        }
      ]
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
