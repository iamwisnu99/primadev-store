"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import { RefreshCw, Search, CheckCircle, AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function RenewPage() {
  const router = useRouter();
  const [licenseKey, setLicenseKey] = useState("");
  const [searching, setSearching] = useState(false);
  const [licenseData, setLicenseData] = useState(null);
  const [searchError, setSearchError] = useState("");

  const [duration, setDuration] = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    setSearchError("");
    setLicenseData(null);

    if (!licenseKey.trim()) {
      setSearchError("Masukkan License Key yang ingin diperpanjang.");
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/licenses?id=${licenseKey.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lisensi tidak ditemukan di sistem.");
      }
      setLicenseData(data);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

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
          buyerName: licenseData?.name || 'Pelanggan',
          buyerEmail: licenseData?.email || 'customer@primadev.id',
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses transaksi perpanjangan.");
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
        {/* HEADER SECTION (Removed 'Portal Perpanjangan' badge as requested) */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Perpanjang Masa Aktif Lisensi</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
            Masukkan License Key Anda untuk memperpanjang durasi masa aktif aplikasi tanpa reset konfigurasi.
          </p>
        </div>

        {/* LOOKUP FORM */}
        <div className="form-card" style={{ marginBottom: '24px' }}>
          <form onSubmit={handleLookup}>
            <div className="form-group">
              <label className="form-label">Masukkan License Key Anda</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Contoh: PRIMA-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  className="form-input"
                  style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="btn-primary"
                  style={{ padding: '0 24px', flexShrink: 0 }}
                >
                  {searching ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Search size={16} />
                      <span>Cek Lisensi</span>
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
                <span className="badge-blue">{licenseData.appName || 'Aplikasi'}</span>
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>Detail Lisensi Terdaftar</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '12px' }}>Nama Pemilik</span>
                  <strong>{licenseData.name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '12px' }}>Email</span>
                  <strong>{licenseData.email}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '12px' }}>Tipe Paket Saat Ini</span>
                  <strong>{licenseData.type?.toUpperCase()}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '12px' }}>Masa Berlaku Saat Ini</span>
                  <strong style={{ color: 'var(--color-accent)' }}>{licenseData.expiryDate || 'Seumur Hidup'}</strong>
                </div>
              </div>
            </div>

            <div className="form-card">
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Pilih Durasi Perpanjangan</h3>

              <div className="plan-tabs" style={{ marginBottom: '24px' }}>
                <button
                  type="button"
                  className={`plan-tab ${duration === 'monthly' ? 'active' : ''}`}
                  onClick={() => setDuration('monthly')}
                >
                  Bulanan (1 Bulan)
                </button>
                <button
                  type="button"
                  className={`plan-tab ${duration === 'yearly' ? 'active' : ''}`}
                  onClick={() => setDuration('yearly')}
                >
                  Tahunan (1 Tahun / Hemat)
                </button>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Metode Pembayaran</h3>
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
                    <span>Memproses Transaksi...</span>
                  </>
                ) : (
                  <>
                    <span>Bayar Perpanjangan Sekarang</span>
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
