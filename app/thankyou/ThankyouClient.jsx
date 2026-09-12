"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Toast from "@/components/Toast";
import { CheckCircle2, Copy, FileText, ArrowRight, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

export default function ThankyouClient() {
  const searchParams = useSearchParams();
  const rawOrderId = searchParams.get('orderId') || searchParams.get('order_id');
  const rawKey = searchParams.get('key') || searchParams.get('licenseKey');

  // Check if a key is a real generated key (starts with PRIMA- and is not placeholder)
  const isValidKey = (k) => Boolean(
    k &&
    typeof k === 'string' &&
    k.trim().length > 6 &&
    k.trim() !== 'PRIMA-XXXX-XXXX-XXXX' &&
    k.trim() !== 'undefined' &&
    k.trim() !== 'null'
  );

  const [orderId, setOrderId] = useState(() => {
    if (rawOrderId && rawOrderId !== '-') return rawOrderId.trim();
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('primadev_last_order_id') || '-';
    }
    return '-';
  });

  const [licenseKey, setLicenseKey] = useState(() => {
    if (isValidKey(rawKey)) return rawKey.trim();
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('primadev_last_license_key');
      if (isValidKey(saved)) return saved.trim();
    }
    return '';
  });

  const [loading, setLoading] = useState(!isValidKey(licenseKey));
  const [fetchError, setFetchError] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  const pollCountRef = useRef(0);

  // If licenseKey is not ready yet, automatically fetch from backend using orderId
  useEffect(() => {
    if (isValidKey(licenseKey)) {
      setLoading(false);
      return;
    }

    const currentOrderId = (orderId && orderId !== '-')
      ? orderId
      : (rawOrderId || (typeof window !== 'undefined' ? sessionStorage.getItem('primadev_last_order_id') : null));

    if (!currentOrderId || currentOrderId === '-') {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let timerId = null;

    const fetchLicense = async () => {
      try {
        const res = await fetch('/api/public_order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify_payment',
            orderId: currentOrderId
          })
        });

        const data = await res.json();
        if (!isMounted) return;

        if (data.key && isValidKey(data.key)) {
          setLicenseKey(data.key.trim());
          setLoading(false);
          setFetchError("");
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('primadev_last_license_key', data.key.trim());
          }
          return;
        }

        // Retry polling up to 6 times (~12 seconds total)
        if (pollCountRef.current < 6) {
          pollCountRef.current += 1;
          timerId = setTimeout(fetchLicense, 2000);
        } else {
          setLoading(false);
          setFetchError("Lisensi Anda telah aktif dan telah dikirimkan ke alamat email Anda.");
        }
      } catch (err) {
        console.error("Gagal mengambil license key:", err);
        if (isMounted) {
          if (pollCountRef.current < 3) {
            pollCountRef.current += 1;
            timerId = setTimeout(fetchLicense, 2000);
          } else {
            setLoading(false);
            setFetchError("Gagal memuat otomatis. Silakan periksa kotak masuk email Anda.");
          }
        }
      }
    };

    fetchLicense();

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [licenseKey, orderId, rawOrderId]);

  const copyKey = () => {
    if (!licenseKey || !isValidKey(licenseKey)) return;
    navigator.clipboard.writeText(licenseKey);
    setToastMsg("License Key berhasil disalin!");
    setShowToast(true);
  };

  const invoiceParam = isValidKey(licenseKey)
    ? licenseKey
    : (orderId && orderId !== '-' ? orderId : (rawOrderId || ''));

  const invoiceUrl = invoiceParam ? `/api/invoice?id=${encodeURIComponent(invoiceParam)}` : '#';

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

          <div className="license-key-text" style={{ minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '15px', fontWeight: 500 }}>
                <Loader2 className="animate-spin" size={18} color="#036EFD" />
                <span>Memuat License Key Anda...</span>
              </span>
            ) : isValidKey(licenseKey) ? (
              licenseKey
            ) : (
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                {fetchError || "Tercatat di sistem (Cek kotak masuk email Anda)"}
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={copyKey}
            disabled={!isValidKey(licenseKey)}
            style={{ margin: '8px auto 0', opacity: isValidKey(licenseKey) ? 1 : 0.6 }}
          >
            <Copy size={15} />
            <span>Salin License Key</span>
          </button>
        </div>

        {fetchError && !isValidKey(licenseKey) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(3, 110, 253, 0.08)', border: '1px solid rgba(3, 110, 253, 0.25)', color: 'var(--color-text)', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', marginTop: '16px', textAlign: 'left' }}>
            <AlertCircle size={16} color="#036EFD" style={{ flexShrink: 0 }} />
            <span>{fetchError}</span>
          </div>
        )}

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
          {invoiceUrl !== '#' ? (
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <FileText size={16} />
              <span>Unduh Invoice (PDF)</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="btn-secondary"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            >
              <FileText size={16} />
              <span>Invoice Sedang Diproses...</span>
            </button>
          )}
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

