import { Suspense } from "react";
import WaitingPaymentClient from "./WaitingPaymentClient";

export const metadata = {
  title: "Menunggu Pembayaran | Primadev Digital Technology",
  description: "Instruksi dan verifikasi pembayaran lisensi software Primadev Digital Technology.",
  robots: {
    index: false,
    follow: false
  }
};

export default function WaitingPaymentPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '120px 24px', textAlign: 'center' }}>Memuat instruksi pembayaran...</div>}>
      <WaitingPaymentClient />
    </Suspense>
  );
}

