import { Suspense } from "react";
import ThankyouClient from "./ThankyouClient";

export default function ThankyouPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '120px 24px', textAlign: 'center' }}>Memuat status pesanan...</div>}>
      <ThankyouClient />
    </Suspense>
  );
}
