import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export const metadata = {
  title: "Checkout Pembelian Lisensi | Primadev Store",
  description: "Halaman checkout dan pembayaran lisensi software resmi Primadev Store.",
  robots: {
    index: false,
    follow: false
  }
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '120px 24px', textAlign: 'center' }}>Memuat checkout...</div>}>
      <CheckoutClient />
    </Suspense>
  );
}

