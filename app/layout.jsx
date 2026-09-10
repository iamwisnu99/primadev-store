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
    default: "Primadev Store | Toko Lisensi Software Digital Resmi & Bergaransi",
    template: "%s | Primadev Store",
  },
  description: "Toko resmi lisensi software Primadev Digital Technology. Beli lisensi aplikasi bisnis, kasir POS, dan otomasi marketing original dengan aktivasi instan otomatis 24/7 dan garansi resmi.",
  applicationName: "Primadev Store",
  authors: [{ name: "Primadev Digital Technology", url: "https://primadev.id" }],
  keywords: [
    "Primadev Store",
    "Beli Lisensi Software",
    "Lisensi Aplikasi Bisnis",
    "Aplikasi Struk SPBU",
    "WA Blaster Pro",
    "Software House Indonesia",
    "Aktivasi Otomatis 24 Jam"
  ],
  openGraph: {
    type: "website",
    siteName: "Primadev Store",
    title: "Primadev Store — Toko Lisensi Software Digital Resmi",
    description: "Beli lisensi aplikasi bisnis & marketing original, aktivasi instan otomatis 24/7, bergaransi resmi.",
    url: "https://store.primadev.id",
    locale: "id_ID",
    images: [{ url: "/primadev_light.png", width: 1200, height: 630, alt: "Primadev Store" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Primadev Store — Toko Lisensi Software Digital Resmi",
    description: "Beli lisensi aplikasi bisnis & marketing original, aktivasi instan otomatis 24/7.",
    images: ["/primadev_light.png"]
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

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
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
