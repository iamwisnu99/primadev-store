"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Copy,
  CheckCircle,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  LifeBuoy
} from "lucide-react";

function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="toast-notification">
      <CheckCircle size={16} color="#22c55e" />
      <span>{message}</span>
    </div>
  );
}

function CountdownTimer({ initialSeconds = 86400 }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="timer-pill">
      <Clock size={15} />
      <span>Sisa Waktu Pembayaran: {pad(hours)}:{pad(minutes)}:{pad(seconds)}</span>
    </div>
  );
}

export default function WaitingPaymentClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [chargeData, setChargeData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [checkStatusText, setCheckStatusText] = useState("");

  const pollIntervalRef = useRef(null);

  const copyText = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setToastMsg(`${label} berhasil disalin!`);
    setShowToast(true);
  };

  const formatRupiah = (num) => {
    if (!num) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const verifyPayment = useCallback(async (isManual = false) => {
    if (!orderId || isCancelled) return;
    if (isManual) setChecking(true);

    try {
      const res = await fetch('/api/public_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_payment',
          orderId
        })
      });

      const data = await res.json();

      // If already paid and active
      if (data.isSuccess || data.status === 'success') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        sessionStorage.removeItem('primadev_last_charge');
        router.push(`/thankyou?orderId=${orderId}&key=${data.key || ''}`);
        return;
      }

      // If marked cancelled / expired / fraud_denied — stop polling
      if (
        data.status === 'cancelled' || data.isCancelled ||
        data.status === 'expired' || data.status === 'fraud_denied'
      ) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        sessionStorage.removeItem('primadev_last_charge');
        setIsCancelled(true);
        return;
      }

      if (isManual) {
        setCheckStatusText("Pembayaran belum terdeteksi. Silakan selesaikan pembayaran lalu coba lagi.");
        setTimeout(() => setCheckStatusText(""), 4000);
      }
    } catch (e) {
      console.error("Gagal verifikasi pembayaran:", e);
      if (isManual) {
        setCheckStatusText("Gagal memeriksa status pembayaran. Coba lagi beberapa saat.");
        setTimeout(() => setCheckStatusText(""), 4000);
      }
    } finally {
      if (isManual) setChecking(false);
    }
  }, [orderId, isCancelled, router]);

  const handleCancelOrder = async () => {
    if (!orderId) return;
    setCancelling(true);

    try {
      const res = await fetch('/api/public_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel_transaction',
          orderId
        })
      });

      const data = await res.json();
      if (data.status === 'cancelled' || data.isCancelled) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        sessionStorage.removeItem('primadev_last_charge');
        setIsCancelled(true);
        setShowCancelModal(false);
        setToastMsg("Transaksi berhasil dibatalkan.");
        setShowToast(true);
      } else {
        throw new Error(data.error || "Gagal membatalkan transaksi.");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setToastMsg(err.message || "Gagal membatalkan transaksi.");
      setShowToast(true);
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    // 1. Read cached charge response from sessionStorage if available
    try {
      const saved = sessionStorage.getItem('primadev_last_charge');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.order_id === orderId) {
          setChargeData(parsed);
        }
      }
    } catch (e) {
      console.error("Error reading session charge:", e);
    }

    // 2. Start active real-time polling every 4 seconds
    pollIntervalRef.current = setInterval(() => {
      verifyPayment(false);
    }, 4000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [orderId, verifyPayment]);

  if (!orderId) {
    return (
      <div className="status-page-wrapper">
        <div className="status-card" style={{ maxWidth: '480px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>ID Order Tidak Ditemukan</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '12px 0 24px' }}>
            Parameter pesanan tidak valid atau sesi telah berakhir.
          </p>
          <Link href="/#catalog" className="btn-primary" style={{ width: '100%' }}>
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  // CANCELLED STATE VIEW
  if (isCancelled) {
    return (
      <div className="status-page-wrapper">
        <div className="status-card" style={{ maxWidth: '520px', padding: '40px 32px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#ef4444'
          }}>
            <XCircle size={36} />
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: 'var(--color-text)' }}>
            Transaksi Dibatalkan
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            Pesanan dengan ID <strong style={{ fontFamily: 'monospace', color: 'var(--color-text)' }}>{orderId}</strong> telah dibatalkan. Anda dapat membuat pesanan baru kapan saja.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/#catalog" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center' }}>
              <ShoppingBag size={17} />
              <span>Pesan Ulang Lisensi</span>
            </Link>
            <Link href="/support" className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '14px', justifyContent: 'center' }}>
              <LifeBuoy size={16} />
              <span>Butuh Bantuan? Hubungi Kami</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const vaNumbers = chargeData?.va_numbers || [];
  const qrAction = chargeData?.actions?.find(a => a.name === 'generate-qr-code');
  const deeplink = chargeData?.mobile_url || chargeData?.actions?.find(a => a.name === 'deeplink-redirect')?.url;
  const paymentCode = chargeData?.payment_code;
  const grossAmount = chargeData?.gross_amount;

  const isMandiri =
    chargeData?.payment_method === 'mandiri' ||
    chargeData?.payment_type === 'echannel' ||
    vaNumbers[0]?.bank === 'mandiri' ||
    Boolean(chargeData?.biller_code) ||
    Boolean(chargeData?.bill_key);

  const billerCode = chargeData?.biller_code || '70012';
  const billKey = chargeData?.bill_key || vaNumbers.find(v => v.bank === 'mandiri')?.va_number || vaNumbers[0]?.va_number || '';

  return (
    <div className="status-page-wrapper">
      <div className="status-card">
        {/* TIMER PILL */}
        <CountdownTimer initialSeconds={86400} />

        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Selesaikan Pembayaran</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14.5px', marginBottom: '20px' }}>
          Silakan lakukan pembayaran sesuai nominal dan instruksi di bawah ini:
        </p>

        {/* ORDER & AMOUNT SUMMARY BOX */}
        <div style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '16px 20px',
          textAlign: 'left',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>ID Transaksi:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>{orderId}</strong>
              <button
                type="button"
                onClick={() => copyText(orderId, 'ID Order')}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', display: 'flex', padding: 0 }}
                title="Salin ID"
              >
                <Copy size={13} />
              </button>
            </div>
          </div>

          {grossAmount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '13.5px' }}>Total Pembayaran:</span>
              <strong style={{ fontSize: '18px', color: 'var(--color-accent)', fontWeight: 800 }}>
                {formatRupiah(grossAmount)}
              </strong>
            </div>
          )}
        </div>

        {/* 1A. MANDIRI BILL PAYMENT (BILLER CODE & BILL KEY) */}
        {isMandiri && (
          <div className="va-box" style={{ textAlign: 'left', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '16px' }}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg"
                alt="Bank Mandiri"
                style={{ height: '22px', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--color-text)' }}>
                Mandiri Bill Payment (Midtrans Gateway)
              </span>
            </div>

            {/* BILLER CODE BOX */}
            <div style={{
              background: 'var(--color-surface-3)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Kode Perusahaan (Biller Code)
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--color-text)', letterSpacing: '1px', marginTop: '2px' }}>
                  {billerCode}
                </div>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => copyText(billerCode, 'Biller Code')}
                style={{ padding: '8px 14px', fontSize: '12px', height: 'auto' }}
              >
                <Copy size={13} />
                <span>Salin</span>
              </button>
            </div>

            {/* BILL KEY BOX */}
            <div style={{
              background: 'var(--color-surface-3)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Kode Pembayaran (Bill Key)
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--color-accent)', letterSpacing: '1px', marginTop: '2px' }}>
                  {billKey}
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => copyText(billKey, 'Bill Key')}
                style={{ padding: '8px 14px', fontSize: '12px', height: 'auto' }}
              >
                <Copy size={13} />
                <span>Salin</span>
              </button>
            </div>

            {/* MANDIRI GUIDE INSTRUCTIONS */}
            <div className="qris-guide-box" style={{ marginTop: '16px' }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)', fontSize: '13px' }}>
                Panduan Pembayaran Mandiri:
              </div>
              <ol style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                <li>Buka aplikasi <strong>Livin' by Mandiri</strong> &gt; pilih menu <strong>Bayar</strong>.</li>
                <li>Pilih <strong>Multi Payment / Penyedia Jasa</strong> &gt; cari <strong>Midtrans</strong> atau masukkan Biller Code: <strong>{billerCode}</strong>.</li>
                <li>Masukkan Bill Key / Nomor Pelanggan: <strong>{billKey}</strong>.</li>
                <li>Periksa nominal tagihan ({formatRupiah(grossAmount)}) lalu selesaikan pembayaran.</li>
              </ol>
            </div>
          </div>
        )}

        {/* 1B. STANDARD VIRTUAL ACCOUNT (BCA, BNI, BRI, Permata, CIMB) */}
        {!isMandiri && vaNumbers.length > 0 && (
          <div className="va-box">
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Nomor Virtual Account {vaNumbers[0].bank?.toUpperCase()}
            </div>
            <div className="va-number">{vaNumbers[0].va_number}</div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => copyText(vaNumbers[0].va_number, 'Nomor VA')}
              style={{ padding: '10px 24px', margin: '0 auto' }}
            >
              <Copy size={15} />
              <span>Salin Nomor VA</span>
            </button>
          </div>
        )}

        {/* 2. QRIS DISPLAY */}
        {chargeData?.payment_type === 'qris' && (
          <div>
            <div className="qris-container">
              {qrAction?.url ? (
                <img
                  src={qrAction.url}
                  alt="QRIS Code"
                  width={240}
                  height={240}
                  style={{ display: 'block', margin: '0 auto', borderRadius: '8px' }}
                />
              ) : (
                <div style={{ padding: '60px 20px', color: '#000' }}>QR Code sedang digenerate...</div>
              )}
            </div>
            <div className="qris-guide-box">
              <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>Cara Pembayaran QRIS:</div>
              <ol style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau E-Wallet (GoPay, OVO, DANA, ShopeePay).</li>
                <li>Pilih menu <strong>Bayar / Scan QRIS</strong>.</li>
                <li>Arahkan kamera ke QR Code di atas dan konfirmasi pembayaran.</li>
              </ol>
            </div>
          </div>
        )}

        {/* 3. DEEPLINK E-WALLET */}
        {deeplink && (
          <div style={{ margin: '20px 0' }}>
            <a href={deeplink} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              <span>Buka Aplikasi untuk Bayar</span>
              <ExternalLink size={16} />
            </a>
          </div>
        )}

        {/* 4. RETAIL OUTLET CODE */}
        {paymentCode && (
          <div className="va-box">
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              Kode Pembayaran {chargeData?.store?.toUpperCase()}
            </div>
            <div className="va-number">{paymentCode}</div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => copyText(paymentCode, 'Kode Pembayaran')}
              style={{ padding: '10px 24px', margin: '0 auto' }}
            >
              <Copy size={15} />
              <span>Salin Kode Pembayaran</span>
            </button>
          </div>
        )}

        {/* AUTOMATIC POLLING & MANUAL CHECK & CANCEL ORDER */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span>Sistem mengecek status pembayaran otomatis secara real-time</span>
          </div>

          {checkStatusText && (
            <div style={{ background: 'rgba(3, 110, 253, 0.12)', border: '1px solid rgba(3, 110, 253, 0.3)', color: 'var(--color-accent)', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
              {checkStatusText}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => verifyPayment(true)}
              disabled={checking || cancelling}
              style={{ padding: '10px 20px' }}
            >
              <RefreshCw size={15} className={checking ? 'animate-spin' : ''} />
              <span>{checking ? 'Memeriksa...' : 'Cek Status Manual'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              disabled={checking || cancelling}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                background: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Batalkan transaksi ini"
            >
              <XCircle size={15} />
              <span>Batalkan Transaksi</span>
            </button>

            <Link href="/#catalog" className="btn-secondary" style={{ padding: '10px 18px' }}>
              <ArrowLeft size={15} />
              <span>Kembali</span>
            </Link>
          </div>
        </div>

        {/* GUARANTEE NOTE */}
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <ShieldCheck size={14} color="#22c55e" />
          <span>Aktivasi otomatis &amp; License Key langsung muncul seketika setelah pembayaran sukses.</span>
        </div>
      </div>

      {/* CONFIRMATION CANCEL MODAL */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => !cancelling && setShowCancelModal(false)}
        >
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '18px',
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#ef4444'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: 800, marginBottom: '8px', color: 'var(--color-text)' }}>
              Batalkan Transaksi?
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '24px' }}>
              Pesanan <strong style={{ fontFamily: 'monospace', color: 'var(--color-text)' }}>{orderId}</strong> akan dibatalkan secara permanen di sistem dan status pada Midtrans Gateway akan tercatat <strong>Cancelled</strong>.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{
                  flex: 1.2,
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {cancelling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Membatalkan...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>Ya, Batalkan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMsg} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  );
}
