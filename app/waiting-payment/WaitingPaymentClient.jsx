"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import Toast from "@/components/Toast";
import { useLang } from "@/context/LanguageContext";
import t from "@/lib/translations";
import {
  Copy,
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

function CountdownTimer({ initialSeconds = 86400, label = "Sisa Waktu Pembayaran" }) {
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
      <span>{label}: {pad(hours)}:{pad(minutes)}:{pad(seconds)}</span>
    </div>
  );
}

export default function WaitingPaymentClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const tr = t[lang]?.waitingPaymentPage || t.id.waitingPaymentPage;

  const orderId = searchParams.get('orderId') || searchParams.get('order_id') || (typeof window !== 'undefined' ? sessionStorage.getItem('primadev_last_order_id') : null);

  const [chargeData, setChargeData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [checkStatusText, setCheckStatusText] = useState("");

  const pollIntervalRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when cancel modal is open
  useEffect(() => {
    if (showCancelModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showCancelModal]);

  // Close modal on Escape key
  useEffect(() => {
    if (!showCancelModal) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !cancelling) {
        setShowCancelModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCancelModal, cancelling]);

  const copyText = (text, labelKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);

    let msg = "";
    if (labelKey === 'va') {
      msg = tr.copySuccessVa;
    } else {
      const labelNames = {
        orderId: lang === 'en' ? 'Order ID' : 'ID Order',
        billerCode: 'Biller Code',
        billKey: 'Bill Key',
        paymentCode: lang === 'en' ? 'Payment Code' : 'Kode Pembayaran'
      };
      msg = tr.copySuccessGeneric(labelNames[labelKey] || labelKey);
    }

    setToastMsg(msg);
    setToastType("success");
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
        const resolvedKey = data.key || '';
        if (orderId) sessionStorage.setItem('primadev_last_order_id', orderId);
        if (resolvedKey) sessionStorage.setItem('primadev_last_license_key', resolvedKey);
        router.push(`/thankyou?orderId=${encodeURIComponent(orderId)}${resolvedKey ? `&key=${encodeURIComponent(resolvedKey)}` : ''}`);
        return;
      }

      // If marked cancelled / expired / fraud_denied stop polling
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
        setCheckStatusText(lang === 'en'
          ? "Payment not yet detected. Please complete your payment and try again."
          : "Pembayaran belum terdeteksi. Silakan selesaikan pembayaran lalu coba lagi.");
        setTimeout(() => setCheckStatusText(""), 4000);
      }
    } catch (e) {
      console.error("Gagal verifikasi pembayaran:", e);
      if (isManual) {
        setCheckStatusText(lang === 'en'
          ? "Failed to check payment status. Please try again shortly."
          : "Gagal memeriksa status pembayaran. Coba lagi beberapa saat.");
        setTimeout(() => setCheckStatusText(""), 4000);
      }
    } finally {
      if (isManual) setChecking(false);
    }
  }, [orderId, isCancelled, router, lang]);

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
        setToastMsg(tr.cancelSuccess);
        setToastType("success");
        setShowToast(true);
      } else {
        throw new Error(data.error || tr.cancelFailed);
      }
    } catch (err) {
      console.error("Cancel error:", err);
      setToastMsg(err.message || tr.cancelFailed);
      setToastType("error");
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
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>{tr.orderNotFoundTitle}</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', margin: '12px 0 24px' }}>
            {tr.orderNotFoundDesc}
          </p>
          <Link href="/#catalog" className="btn-primary" style={{ width: '100%' }}>
            {tr.btnBackToCatalog}
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
            {tr.orderCancelledTitle}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            {tr.orderCancelledDesc(orderId)}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/#catalog" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center' }}>
              <ShoppingBag size={17} />
              <span>{lang === 'en' ? 'Order License Again' : 'Pesan Ulang Lisensi'}</span>
            </Link>
            <Link href="/support" className="btn-secondary" style={{ width: '100%', padding: '12px', fontSize: '14px', justifyContent: 'center' }}>
              <LifeBuoy size={16} />
              <span>{lang === 'en' ? 'Need Help? Contact Us' : 'Butuh Bantuan? Hubungi Kami'}</span>
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
        <CountdownTimer initialSeconds={86400} label={tr.timerRemaining} />

        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>{tr.pageTitle}</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '14.5px', marginBottom: '20px' }}>
          {tr.pageSubtitle}
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
            <span style={{ color: 'var(--color-text-secondary)' }}>{tr.transactionId}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>{orderId}</strong>
              <button
                type="button"
                onClick={() => copyText(orderId, 'orderId')}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', display: 'flex', padding: 0 }}
                title={tr.btnCopy}
              >
                <Copy size={13} />
              </button>
            </div>
          </div>

          {grossAmount && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '13.5px' }}>{tr.totalPayment}</span>
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
                  {lang === 'en' ? 'Company Code (Biller Code)' : 'Kode Perusahaan (Biller Code)'}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--color-text)', letterSpacing: '1px', marginTop: '2px' }}>
                  {billerCode}
                </div>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => copyText(billerCode, 'billerCode')}
                style={{ padding: '8px 14px', fontSize: '12px', height: 'auto' }}
              >
                <Copy size={13} />
                <span>{tr.btnCopy}</span>
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
                  {lang === 'en' ? 'Payment Code (Bill Key)' : 'Kode Pembayaran (Bill Key)'}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'monospace', color: 'var(--color-accent)', letterSpacing: '1px', marginTop: '2px' }}>
                  {billKey}
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => copyText(billKey, 'billKey')}
                style={{ padding: '8px 14px', fontSize: '12px', height: 'auto' }}
              >
                <Copy size={13} />
                <span>{tr.btnCopy}</span>
              </button>
            </div>

            {/* MANDIRI GUIDE INSTRUCTIONS */}
            <div className="qris-guide-box" style={{ marginTop: '16px' }}>
              <div style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)', fontSize: '13px' }}>
                {lang === 'en' ? 'Mandiri Payment Instructions:' : 'Panduan Pembayaran Mandiri:'}
              </div>
              <ol style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12.5px', color: 'var(--color-text-secondary)' }}>
                {lang === 'en' ? (
                  <>
                    <li>Open <strong>Livin' by Mandiri</strong> app &gt; select <strong>Pay (Bayar)</strong> menu.</li>
                    <li>Choose <strong>Multi Payment / Service Provider</strong> &gt; search <strong>Midtrans</strong> or enter Biller Code: <strong>{billerCode}</strong>.</li>
                    <li>Enter Bill Key / Customer Number: <strong>{billKey}</strong>.</li>
                    <li>Verify payment total ({formatRupiah(grossAmount)}) and complete payment.</li>
                  </>
                ) : (
                  <>
                    <li>Buka aplikasi <strong>Livin' by Mandiri</strong> &gt; pilih menu <strong>Bayar</strong>.</li>
                    <li>Pilih <strong>Multi Payment / Penyedia Jasa</strong> &gt; cari <strong>Midtrans</strong> atau masukkan Biller Code: <strong>{billerCode}</strong>.</li>
                    <li>Masukkan Bill Key / Nomor Pelanggan: <strong>{billKey}</strong>.</li>
                    <li>Periksa nominal tagihan ({formatRupiah(grossAmount)}) lalu selesaikan pembayaran.</li>
                  </>
                )}
              </ol>
            </div>
          </div>
        )}

        {/* 1B. STANDARD VIRTUAL ACCOUNT (BCA, BNI, BRI, Permata, CIMB) */}
        {!isMandiri && vaNumbers.length > 0 && (
          <div className="va-box">
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {tr.vaNumberBank(vaNumbers[0].bank?.toUpperCase())}
            </div>
            <div className="va-number">{vaNumbers[0].va_number}</div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => copyText(vaNumbers[0].va_number, 'va')}
              style={{ padding: '10px 24px', margin: '0 auto' }}
            >
              <Copy size={15} />
              <span>{tr.btnCopyVa}</span>
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
                <div style={{ padding: '60px 20px', color: '#000' }}>
                  {lang === 'en' ? 'Generating QR Code...' : 'QR Code sedang digenerate...'}
                </div>
              )}
            </div>
            <div className="qris-guide-box">
              <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--color-text)' }}>{tr.qrisTitle}</div>
              <ol style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>{tr.qrisStep1}</li>
                <li>{tr.qrisStep2}</li>
                <li>{tr.qrisStep3}</li>
              </ol>
            </div>
          </div>
        )}

        {/* 3. DEEPLINK E-WALLET */}
        {deeplink && (
          <div style={{ margin: '20px 0' }}>
            <a href={deeplink} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
              <span>{tr.btnOpenAppToPay}</span>
              <ExternalLink size={16} />
            </a>
          </div>
        )}

        {/* 4. RETAIL OUTLET CODE */}
        {paymentCode && (
          <div className="va-box">
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
              {tr.retailOutletLabel} {chargeData?.store?.toUpperCase()}
            </div>
            <div className="va-number">{paymentCode}</div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => copyText(paymentCode, 'paymentCode')}
              style={{ padding: '10px 24px', margin: '0 auto' }}
            >
              <Copy size={15} />
              <span>{tr.btnCopyCode}</span>
            </button>
          </div>
        )}

        {/* AUTOMATIC POLLING & MANUAL CHECK & CANCEL ORDER */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
            <span>{tr.autoCheckNotice}</span>
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
              <span>{checking ? tr.checkingStatus : tr.btnCheckStatusManual}</span>
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
              title={tr.btnCancel}
            >
              <XCircle size={15} />
              <span>{tr.btnCancel}</span>
            </button>

            <Link href="/#catalog" className="btn-secondary" style={{ padding: '10px 18px' }}>
              <ArrowLeft size={15} />
              <span>{tr.btnBack}</span>
            </Link>
          </div>
        </div>

        {/* GUARANTEE NOTE */}
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <ShieldCheck size={14} color="#22c55e" />
          <span>{tr.guaranteeNotice}</span>
        </div>
      </div>

      {/* CONFIRMATION CANCEL MODAL */}
      {mounted && showCancelModal && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-modal-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            margin: 0,
            boxSizing: 'border-box'
          }}
          onClick={() => !cancelling && setShowCancelModal(false)}
        >
          <div
            style={{
              background: 'var(--color-surface, #0f172a)',
              border: '1px solid var(--color-border, rgba(255, 255, 255, 0.12))',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '32px 28px',
              textAlign: 'center',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.75)',
              animation: 'modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: '#ef4444'
            }}>
              <AlertTriangle size={30} />
            </div>

            <h3
              id="cancel-modal-title"
              style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px', color: 'var(--color-text, #ffffff)' }}
            >
              {tr.cancelModalTitle}
            </h3>
            <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
              {tr.cancelModalDesc(orderId)}
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                style={{ flex: 1, padding: '12px 18px', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}
              >
                {tr.btnBack}
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{
                  flex: 1.3,
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                  transition: 'all 0.2s ease',
                  opacity: cancelling ? 0.7 : 1
                }}
              >
                {cancelling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{tr.cancelling}</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>{tr.btnCancelConfirm}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* TOAST NOTIFICATION */}
      <Toast
        message={toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
        position="top-right"
        type={toastType}
        duration={3500}
      />
    </div>
  );
}
