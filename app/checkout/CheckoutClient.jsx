"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
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

  const appId = searchParams.get('app') || 'struk-spbu';
  const plan = searchParams.get('plan') || 'monthly';

  const [product, setProduct] = useState(DEFAULT_PRODUCTS[appId] || null);
  const [loadingCatalog, setLoadingCatalog] = useState(!DEFAULT_PRODUCTS[appId]);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    if (p === 'monthly') return '1 Bulan (Bulanan)';
    if (p === 'yearly') return '1 Tahun (Tahunan)';
    if (p === 'lifetime') return 'Seumur Hidup (Lifetime)';
    return p?.toUpperCase() || 'Bulanan';
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
      setErrorMsg("Nama Lengkap wajib diisi.");
      return;
    }

    if (!buyerEmail.trim() || !buyerEmail.includes('@')) {
      setErrorMsg("Format email tidak valid. Pastikan email Anda aktif.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/public_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_transaction',
          appId,
          duration: plan,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal membuat transaksi pembayaran.");
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
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>Memverifikasi Data Produk...</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13.5px' }}>
            Menghubungkan ke database lisensi resmi Primadev.
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="status-page-wrapper">
        <div className="status-card" style={{ maxWidth: '480px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Produk Tidak Ditemukan</h2>
          <p style={{ color: 'var(--color-text-secondary)', margin: '12px 0 24px' }}>
            Produk yang Anda pilih tidak tersedia di sistem.
          </p>
          <Link href="/#catalog" className="btn-primary" style={{ width: '100%' }}>
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-wrapper">
      <div className="container" style={{ maxWidth: '1040px' }}>
        <form onSubmit={handleCheckout}>
          <div className="checkout-grid" style={{ gap: '28px' }}>
            {/* LEFT: FORM INPUTS */}
            <div>
              {/* 1. DATA PEMBELI */}
              <div className="form-card" style={{ marginBottom: '24px' }}>
                <h2 className="form-section-title">
                  <span>1. Data Pembeli</span>
                </h2>

                <div className="form-group">
                  <label className="form-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="CONTOH: BUDI SANTOSO"
                    className="form-input input-capslock"
                    autoCapitalize="characters"
                    value={buyerName}
                    onChange={handleNameChange}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Aktif (License Key dikirim ke sini) *</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    className="form-input"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                  />
                  <span className="input-hint" style={{ marginTop: '6px', display: 'block' }}>
                    Pastikan email Anda aktif dan benar untuk menerima kode lisensi dan invoice PDF.
                  </span>
                </div>
              </div>

              {/* 2. METODE PEMBAYARAN */}
              <div className="form-card">
                <h2 className="form-section-title">
                  <span>2. Metode Pembayaran</span>
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
                        Pembayaran menggunakan <strong>Kode Perusahaan (Biller Code: 70012)</strong> dan <strong>Bill Key</strong> yang akan ditampilkan pada halaman instruksi pembayaran.
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
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Ringkasan Pesanan</h3>
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
                    <div className="summary-product-tag">Paket Lisensi: {getPlanLabel(plan)}</div>
                  </div>
                </div>

                {/* BREAKDOWN ROWS */}
                <div className="summary-row">
                  <span>Harga Software</span>
                  <span>{formatRupiah(price)}</span>
                </div>

                <div className="summary-row">
                  <span>Durasi Akses</span>
                  <span>{getPlanLabel(plan)}</span>
                </div>

                <div className="summary-row">
                  <span>Metode Bayar</span>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{getPaymentLabel(paymentMethod)}</span>
                </div>

                <div className="summary-row">
                  <span>Biaya Admin</span>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>Rp 0 (Gratis)</span>
                </div>

                {/* TOTAL ROW */}
                <div className="summary-row total">
                  <span>Total Tagihan</span>
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
                      <span>Memproses Pembayaran...</span>
                    </>
                  ) : (
                    <>
                      <span>Bayar Sekarang ({formatRupiah(price)})</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  <Lock size={13} />
                  <span>Enkripsi Pembayaran Aman via Midtrans Gateway</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
