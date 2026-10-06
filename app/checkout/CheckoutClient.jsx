"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import Toast from "@/components/Toast";
import { useLang } from "@/context/LanguageContext";
import t from "@/lib/translations";
import {
  Lock,
  AlertCircle,
  Loader2,
  ArrowRight,
  Package,
  Building2
} from "lucide-react";

const DEFAULT_PRODUCTS = {
  "struk-spbu": {
    name: "Struk SPBU Generator Android",
    category: "Android App",
    price: { monthly: 80000, yearly: 860000 }
  }
};

const PRODUCT_FOLDER_MAP = {
  kasir_q: ["/KasirQ/icon.png", "/KasirQ/icon.jpg"],
  kasirq: ["/KasirQ/icon.png", "/KasirQ/icon.jpg"],
  whatsapp_direct: ["/wa-direct/icon.jpg", "/wa-direct/icon.png"],
  "wa-direct": ["/wa-direct/icon.jpg", "/wa-direct/icon.png"],
  "spbu-struk": ["/struk-spbu/icon.png", "/struk-spbu/icon.jpg"],
  "struk-spbu": ["/struk-spbu/icon.png", "/struk-spbu/icon.jpg"],
  strukapp: ["/struk-spbu/icon.png", "/struk-spbu/icon.jpg"]
};

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const tr = t[lang]?.checkoutPage || t.id.checkoutPage;

  const appId = searchParams.get('app') || 'struk-spbu';
  const plan = searchParams.get('plan') || 'monthly';

  const [product, setProduct] = useState(DEFAULT_PRODUCTS[appId] || null);
  const [loadingCatalog, setLoadingCatalog] = useState(!DEFAULT_PRODUCTS[appId]);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("warning");
  const [showToast, setShowToast] = useState(false);
  const [shakeCheckbox, setShakeCheckbox] = useState(false);

  // Product Icon resolution with fallback (ignore fontawesome strings like 'fa-box')
  const isCustomIconUrl = product?.icon && (product.icon.startsWith('/') || product.icon.startsWith('http'));
  const candidateIcons = isCustomIconUrl
    ? [product.icon]
    : (PRODUCT_FOLDER_MAP[appId] || [`/${appId}/icon.png`, `/${appId}/icon.jpg`]);

  const [iconIdx, setIconIdx] = useState(0);
  const [iconFailed, setIconFailed] = useState(false);

  useEffect(() => {
    setIconIdx(0);
    setIconFailed(false);
  }, [appId, product]);

  const handleIconError = () => {
    if (iconIdx + 1 < candidateIcons.length) {
      setIconIdx((prev) => prev + 1);
    } else {
      setIconFailed(true);
    }
  };

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/public_order');
        if (res.ok) {
          const data = await res.json();
          const prod = data.catalog?.[appId] || DEFAULT_PRODUCTS[appId] || null;
          setProduct(prod);
        }
      } catch (e) {
        console.error("Gagal memuat katalog:", e);
      } finally {
        setLoadingCatalog(false);
      }
    }
    loadCatalog();
  }, [appId]);

  const handleNameChange = (e) => {
    setBuyerName(e.target.value.toUpperCase());
  };

  const price = product?.price?.[plan] || 0;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const getPlanLabel = (p) => {
    if (p === 'monthly') return tr.planMonthly;
    if (p === 'yearly') return tr.planYearly;
    if (p === 'lifetime') return tr.planLifetime;
    return p?.toUpperCase() || (lang === 'en' ? 'Monthly' : 'Bulanan');
  };

  const getPaymentLabel = (m) => {
    const map = {
      qris: 'QRIS (Semua Bank & E-Wallet)',
      bca: 'BCA Virtual Account',
      mandiri: 'Mandiri Virtual Account (Bill Payment)',
      bni: 'BNI Virtual Account',
      bri: 'BRI Virtual Account',
      permata: 'Permata Virtual Account',
      cimb: 'CIMB Niaga Virtual Account',
      gopay: 'GoPay E-Wallet',
      shopeepay: 'ShopeePay E-Wallet',
      dana: 'DANA E-Wallet',
      ovo: 'OVO E-Wallet'
    };
    return map[m?.toLowerCase()] || (m ? m.toUpperCase() : 'QRIS');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!buyerName.trim()) {
      const msg = tr.errNameRequired;
      setErrorMsg(msg);
      setToastMsg(msg);
      setToastType("warning");
      setShowToast(true);
      return;
    }

    if (!buyerEmail.trim() || !buyerEmail.includes('@')) {
      const msg = tr.errEmailInvalid;
      setErrorMsg(msg);
      setToastMsg(msg);
      setToastType("warning");
      setShowToast(true);
      return;
    }

    if (!agreedToTerms) {
      const msg = tr.agreementAlert;
      setErrorMsg(msg);
      setToastMsg(msg);
      setToastType("warning");
      setShowToast(true);
      setShakeCheckbox(true);
      setTimeout(() => setShakeCheckbox(false), 800);

      const el = document.getElementById("agreementCheckboxWrapper");
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/public_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          duration: plan,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          paymentMethod,
          agreedToTerms: Boolean(agreedToTerms)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const errorText = data.error || tr.errTransactionFailed;
        setToastMsg(errorText);
        setToastType("error");
        setShowToast(true);
        throw new Error(errorText);
      }

      sessionStorage.setItem('primadev_last_charge', JSON.stringify(data));
      if (data.order_id) {
        sessionStorage.setItem('primadev_last_order_id', data.order_id);
      }
      router.push(`/waiting-payment?orderId=${data.order_id}`);
    } catch (err) {
      setErrorMsg(err.message);
      setSubmitting(false);
    }
  };

  if (loadingCatalog) {
    return (
      <div className="status-page-wrapper">
        <div className="status-card" style={{ maxWidth: '480px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(3, 110, 253, 0.12)',
            border: '1px solid rgba(3, 110, 253, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            color: 'var(--color-accent)'
          }}>
            <Loader2 className="animate-spin" size={30} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>{tr.verifyingData}</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13.5px' }}>
            {tr.connectingDb}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="status-page-wrapper">
        <div className="status-card" style={{ maxWidth: '480px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>{tr.productNotFound}</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: '12px 0 24px' }}>
            {tr.productNotFoundDesc}
          </p>
          <Link href="/#catalog" className="btn-primary" style={{ width: '100%' }}>
            {tr.btnBackToCatalog}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <Toast
        message={toastMsg}
        show={showToast}
        onClose={() => setShowToast(false)}
        position="top-right"
        type={toastType}
        duration={4000}
      />
      <div className="container" style={{ maxWidth: '1040px' }}>
        <form onSubmit={handleCheckout} noValidate>
          <div className="checkout-grid" style={{ gap: '28px' }}>
            {/* LEFT: FORM INPUTS */}
            <div>
              {/* 1. DATA PEMBELI */}
              <div className="form-card" style={{ marginBottom: '24px' }}>
                <h2 className="form-section-title">
                  <span>{tr.step1Title}</span>
                </h2>

                <div className="form-group">
                  <label className="form-label">{tr.nameLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder={tr.namePlaceholder}
                    className="form-input input-capslock"
                    autoCapitalize="characters"
                    value={buyerName}
                    onChange={handleNameChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{tr.emailLabel}</label>
                  <input
                    type="email"
                    required
                    placeholder={tr.emailPlaceholder}
                    className="form-input"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                  />
                  <span className="input-hint" style={{ marginTop: '6px', display: 'block' }}>
                    {tr.emailHint}
                  </span>
                </div>

                <div 
                  id="agreementCheckboxWrapper"
                  className={`agreement-checkbox-wrapper ${shakeCheckbox ? 'shake-checkbox' : ''}`} 
                  style={{ 
                    paddingTop: '16px', 
                    borderTop: '1px solid var(--color-border)', 
                    marginTop: '16px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <label
                    htmlFor="agreementCheckbox"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      cursor: 'pointer',
                      fontSize: '13.5px',
                      lineHeight: '1.5',
                      color: 'var(--color-text-secondary)',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      id="agreementCheckbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (e.target.checked && showToast) {
                          setShowToast(false);
                        }
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        marginTop: '2px',
                        accentColor: 'var(--color-primary, #036efd)',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                    <span>
                      {tr.agreementPreText}
                      <a
                        href="https://primadev.id/perjanjian-lisensi"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--color-primary, #036efd)',
                          fontWeight: 600,
                          textDecoration: 'underline'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tr.agreementLinkText}
                      </a>
                    </span>
                  </label>
                </div>
              </div>

              {/* 2. METODE PEMBAYARAN */}
              <div className="form-card">
                <h2 className="form-section-title">
                  <span>{tr.step2Title}</span>
                </h2>
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onSelect={(m) => setPaymentMethod(m)}
                />

                {paymentMethod === 'mandiri' && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(3, 110, 253, 0.08)',
                    border: '1px solid rgba(3, 110, 253, 0.25)',
                    fontSize: '13px',
                    color: 'var(--color-text)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <Building2 size={18} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ lineHeight: 1.5 }}>
                      <strong>Mandiri Bill Payment (Midtrans Gateway):</strong>
                      <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {lang === 'en' ? (
                          <>Payment using <strong>Company Code (Biller Code: 70012)</strong> and <strong>Bill Key</strong> which will be shown on the payment instruction page.</>
                        ) : (
                          <>Pembayaran menggunakan <strong>Kode Perusahaan (Biller Code: 70012)</strong> dan <strong>Bill Key</strong> yang akan ditampilkan pada halaman instruksi pembayaran.</>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: ORDER SUMMARY */}
            <div>
              <div className="order-summary-card">
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{tr.step3Title}</h3>
                </div>

                {/* PRODUCT BOX WITH DYNAMIC ICON OR FALLBACK */}
                <div className="summary-product-box">
                  <div className="summary-product-icon">
                    {!iconFailed && candidateIcons[iconIdx] ? (
                      <img
                        src={candidateIcons[iconIdx]}
                        alt={product.name}
                        onError={handleIconError}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <Package size={22} />
                    )}
                  </div>
                  <div className="summary-product-info">
                    <div className="summary-product-title">{product.name}</div>
                    <div className="summary-product-tag">{tr.packageLabel}: {getPlanLabel(plan)}</div>
                  </div>
                </div>

                {/* BREAKDOWN ROWS */}
                <div className="summary-row">
                  <span>{tr.priceLabel}</span>
                  <span>{formatRupiah(price)}</span>
                </div>

                <div className="summary-row">
                  <span>{tr.durationLabel}</span>
                  <span>{getPlanLabel(plan)}</span>
                </div>

                <div className="summary-row">
                  <span>{tr.paymentMethodLabel}</span>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{getPaymentLabel(paymentMethod)}</span>
                </div>

                <div className="summary-row">
                  <span>{tr.adminFeeLabel}</span>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>{tr.adminFeeFree}</span>
                </div>

                {/* TOTAL ROW */}
                <div className="summary-row total">
                  <span>{tr.totalLabel}</span>
                  <span className="total-price-text">{formatRupiah(price)}</span>
                </div>

                {errorMsg && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    color: '#f87171',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    margin: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '20px' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>{tr.btnProcessing}</span>
                    </>
                  ) : (
                    <>
                      <span>{tr.btnPay} ({formatRupiah(price)})</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <Lock size={13} />
                  <span>{tr.encryptionNote}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
