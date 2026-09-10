"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/Toast";
import { CheckCircle2, Copy, FileText, Download, ArrowRight, ShieldCheck } from "lucide-react";

export default function ThankyouClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '-';
  const licenseKey = searchParams.get('key') || 'PRIMA-XXXX-XXXX-XXXX';

  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setToastMsg("License Key berhasil disalin!");
    setShowToast(true);
  };

  return (
    <div className="status-page-wrapper">
      <div className="status-card" style={{ maxWidth: '680px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', marginBottom: '20px' }}>
          <CheckCircle2 size={36} />
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Pembayaran Berhasil!</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: 1.5 }}>
          Terima kasih atas pesanan Anda. Akses lisensi software Anda telah diaktifkan secara otomatis.
        </p>

        {/* LICENSE KEY BOX */}
        <div className="license-reveal-card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            LICENSE KEY ANDA
          </div>
          <div className="license-key-text">{licenseKey}</div>
          <button
            type="button"
            className="btn-primary"
            onClick={copyKey}
            style={{ margin: '8px auto 0' }}
          >
            <Copy size={15} />
            <span>Salin License Key</span>
          </button>
        </div>

        {/* ACTIVATION STEPS */}
        <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', textAlign: 'left', margin: '24px 0' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#036EFD" />
            <span>Panduan Aktivasi Software</span>
          </h4>
          <ol style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>Buka aplikasi software Primadev yang telah Anda unduh.</li>
            <li>Masuk ke menu <strong>Pengaturan / Aktivasi Lisensi</strong>.</li>
            <li>Tempelkan (Paste) <strong>License Key</strong> di atas dan klik <strong>Aktivasi</strong>.</li>
            <li>Aplikasi akan langsung terbuka dalam versi Full Premium.</li>
          </ol>
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`/api/invoice?id=${licenseKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <FileText size={16} />
            <span>Unduh Invoice (PDF)</span>
          </a>
          <Link href="/#catalog" className="btn-primary">
            <span>Ke Halaman Utama</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}
