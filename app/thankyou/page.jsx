import { Suspense } from "react";
import ThankyouClient from "./ThankyouClient";

export const metadata = {
  title: "Pembayaran Berhasil | Primadev Store",
  description: "Konfirmasi pembayaran sukses dan penerimaan license key software resmi Primadev Store.",
  robots: {
    index: false,
    follow: false
  }
};

export default function ThankyouPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '120px 24px', textAlign: 'center' }}>Memuat status pesanan...</div>}>
      <ThankyouClient />
    </Suspense>
  );
}

