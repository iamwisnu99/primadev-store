import { Suspense } from "react";
import WaitingPaymentClient from "./WaitingPaymentClient";

export const metadata = {
  title: "Menunggu Pembayaran | Primadev Store",
  description: "Instruksi dan verifikasi pembayaran lisensi software Primadev Store.",
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

