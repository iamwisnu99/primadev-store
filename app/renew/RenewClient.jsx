"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { useLang } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { RefreshCw, Search, CheckCircle, AlertCircle, ArrowRight, Loader2, ShieldCheck, Tag } from "lucide-react";

export default function RenewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const tr = t[lang]?.renewPage || t.id.renewPage;

  const [licenseKey, setLicenseKey] = useState("");
  const [searching, setSearching] = useState(false);
  const [licenseData, setLicenseData] = useState(null);
  const [searchError, setSearchError] = useState("");

  const [duration, setDuration] = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const initialKeyHandled = useRef(false);

  const formatRupiah = (num) => {
    if (!num) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const monthlyPrice = licenseData?.price?.monthly || (
    licenseData?.appId === 'kasir_q' ? 59000 :
    licenseData?.appId === 'whatsapp_direct' ? 29000 : 39000
  );
  const yearlyPrice = licenseData?.price?.yearly || (
    licenseData?.appId === 'kasir_q' ? 1699000 :
    licenseData?.appId === 'whatsapp_direct' ? 290000 : 599000
  );
  const activePrice = duration === 'monthly' ? monthlyPrice : yearlyPrice;

  const performLookup = useCallback(async (keyToLookup) => {
    const cleanKey = (keyToLookup || "").trim().toUpperCase();
    if (!cleanKey) {
      setSearchError(tr.errInputEmpty);
      return;
    }

    setSearchError("");
    setLicenseData(null);
    setSearching(true);

    try {
      const res = await fetch(`/api/licenses?id=${encodeURIComponent(cleanKey)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || tr.errNotFound);
      }
      setLicenseData(data);
    } catch (err) {
      setSearchError(err.message || tr.errCheckFailed);
    } finally {
      setSearching(false);
    }
  }, [tr]);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    performLookup(licenseKey);
  };

  // Auto-fill license key from URL query (?key=...) and immediately clean address bar
  useEffect(() => {
    if (initialKeyHandled.current) return;
    initialKeyHandled.current = true;

    const urlKey = searchParams?.get('key') || searchParams?.get('licenseKey') || searchParams?.get('id');
    if (urlKey) {
      const cleanKey = urlKey.trim().toUpperCase();
      setLicenseKey(cleanKey);

      // Clean the URL immediately to display "https://store.primadev.id/renew"
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }

      // Automatically check license data
      performLookup(cleanKey);
    }
  }, [searchParams, performLookup]);

  const handleRenewPayment = async (e) => {
    e.preventDefault();
    setActionError("");
    setSubmitting(true);

    try {
      const res = await fetch('/api/public_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'renew_transaction',
          licenseKey: licenseKey.trim(),
          duration,
          buyerName: licenseData?.name || (lang === 'en' ? 'Customer' : 'Pelanggan'),
          buyerEmail: licenseData?.email || 'customer@primadev.id',
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || tr.errRenewFailed);
      }

      sessionStorage.setItem('primadev_last_charge', JSON.stringify(data));
      if (data.order_id) {
        sessionStorage.setItem('primadev_last_order_id', data.order_id);
      }
      if (licenseKey.trim()) {
        sessionStorage.setItem('primadev_last_license_key', licenseKey.trim());
      }
      router.push(`/waiting-payment?orderId=${data.order_id}`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-wrapper">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* HEADER SECTION */}
        <div className="page-header-box">
          <h1 className="page-title">{tr.title}</h1>
          <p className="page-subtitle">
            {tr.subtitle}
          </p>
        </div>

        {/* LOOKUP FORM */}
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleLookup}>
            <div className="form-group">
              <label className="form-label">{tr.inputLabel}</label>
              <div className="license-search-row">
                <input
                  type="text"
                  placeholder={tr.inputPlaceholder}
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="btn-primary license-search-btn"
                >
                  {searching ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>{tr.checking}</span>
                    </>
                  ) : (
                    <>
                      <Search size={16} />
                      <span>{tr.btnCheck}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {searchError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px', marginTop: '10px' }}>
                <AlertCircle size={15} />
                <span>{searchError}</span>
              </div>
            )}
          </form>
        </div>

        {/* LICENSE DATA & RENEWAL DURATION + PAYMENT ACCORDION */}
        {licenseData && (
          <form onSubmit={handleRenewPayment} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span className="badge-green">
                  <CheckCircle size={13} /> {licenseData.status?.toUpperCase()}
                </span>
                <span className="badge-blue">{licenseData.appName || (lang === 'en' ? 'Application' : 'Aplikasi')}</span>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>{tr.detailsTitle}</h3>

              <div className="license-details-grid">
                <div className="license-detail-item">
                  <span className="license-detail-label">{tr.labelOwner}</span>
                  <strong className="license-detail-value">{licenseData.name}</strong>
                </div>
                <div className="license-detail-item">
                  <span className="license-detail-label">{tr.labelEmail}</span>
                  <strong className="license-detail-value">{licenseData.email}</strong>
                </div>
                <div className="license-detail-item">
                  <span className="license-detail-label">{tr.labelPackage}</span>
                  <strong className="license-detail-value">{licenseData.type?.toUpperCase()}</strong>
                </div>
                <div className="license-detail-item">
                  <span className="license-detail-label">{tr.labelExpiry}</span>
                  <strong className="license-detail-value accent">{licenseData.expiryDate || tr.lifetime}</strong>
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{tr.selectDurationTitle}</h3>

              <div className="plan-tabs" style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  className={`plan-tab ${duration === 'monthly' ? 'active' : ''}`}
                  onClick={() => setDuration('monthly')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 16px' }}
                >
                  <span style={{ fontWeight: 700 }}>{tr.tabMonthly}</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: duration === 'monthly' ? '#ffffff' : 'var(--color-accent)'
                  }}>
                    {formatRupiah(monthlyPrice)}
                  </span>
                </button>
                <button
                  type="button"
                  className={`plan-tab ${duration === 'yearly' ? 'active' : ''}`}
                  onClick={() => setDuration('yearly')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 16px' }}
                >
                  <span style={{ fontWeight: 700 }}>{tr.tabYearly}</span>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 800,
                    color: duration === 'yearly' ? '#ffffff' : 'var(--color-accent)'
                  }}>
                    {formatRupiah(yearlyPrice)}
                  </span>
                </button>
              </div>

              {/* RENEWAL PRICE SUMMARY BOX */}
              <div style={{
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ fontSize: '13.5px', color: 'var(--color-text)', fontWeight: 700 }}>
                    {lang === 'en' ? 'Renewal Cost Total:' : 'Total Biaya Perpanjangan:'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {duration === 'monthly'
                      ? (lang === 'en' ? 'Package: 1 Month Validity' : 'Paket: 1 Bulan Masa Aktif')
                      : (lang === 'en' ? 'Package: 1 Year Validity' : 'Paket: 1 Tahun Masa Aktif')}
                  </div>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--color-accent)' }}>
                  {formatRupiah(activePrice)}
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{tr.paymentMethodTitle}</h3>
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onSelect={(m) => setPaymentMethod(m)}
              />

              {actionError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '13px', margin: '16px 0' }}>
                  {actionError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '24px' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>{tr.btnProcessing}</span>
                  </>
                ) : (
                  <>
                    <span>{tr.btnPay} ({formatRupiah(activePrice)})</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
