import { Suspense } from "react";
import WaitingPaymentClient from "./WaitingPaymentClient";

export default function WaitingPaymentPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '120px 24px', textAlign: 'center' }}>Memuat instruksi pembayaran...</div>}>
      <WaitingPaymentClient />
    </Suspense>
  );
}
