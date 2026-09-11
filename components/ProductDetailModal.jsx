"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { X, Check, ArrowRight, ShieldCheck, MessageCircle } from "lucide-react";

const PRODUCT_SCREENSHOTS_MAP = {
  kasir_q: [
    { src: "/KasirQ/KasirQ.png", label: "Dashboard POS & Menu Kasir Q" },
    { src: "/KasirQ/Sales_KasirQ.png", label: "Menu Penjualan & Keranjang Transaksi" },
    { src: "/KasirQ/Report_KasirQ.png", label: "Laporan Keuangan & Rekap Penjualan" },
    { src: "/KasirQ/Print_KasirQ.png", label: "Cetak Struk Printer Thermal Bluetooth" }
  ],
  whatsapp_direct: [
    { src: "/wa-direct/WhatsApp_Direct.png", label: "Tampilan Utama Chat Tanpa Simpan Nomor" },
    { src: "/wa-direct/WhatsApp_Direct_Country_Number.png", label: "Pilihan Kode Negara Internasional" },
    { src: "/wa-direct/WhatsApp_Direct_QR_Code.png", label: "Scan & Generate WhatsApp QR Code" },
    { src: "/wa-direct/WhatsApp_Direct_Languages.png", label: "Dukungan Multi Bahasa Global" }
  ]
};

function AndroidFallbackIcon({ size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v6c0 .83.67 1.5 1.5 1.5S5 16.33 5 15.5v-6C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.62 2.24 12.83 2 12 2c-.83 0-1.62.24-2.64.63L7.88 1.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.71 4.38 5.5 6.04 5.5 8h13c0-1.96-1.21-3.62-2.97-4.84zM9 6.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
    </svg>
  );
}

export default function ProductDetailModal({ id, product, onClose }) {
  const { lang } = useLang();
  const tr = t[lang].catalog;

  const prices = product?.price || {};
  const validPlans = Object.keys(prices).filter((p) => Number(prices[p]) > 0);
  const initialPlan = validPlans.includes("monthly")
    ? "monthly"
    : validPlans[0] || "monthly";

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [activeScreenIdx, setActiveScreenIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [mainImgError, setMainImgError] = useState(false);

  // Screenshots array
  let screenshots = PRODUCT_SCREENSHOTS_MAP[id] || [];
  if (Array.isArray(product?.screenshots) && product.screenshots.length > 0) {
    screenshots = product.screenshots.map((s, idx) => {
      if (typeof s === "string") {
        return { src: s, label: `Screenshot ${idx + 1}` };
      }
      return { src: s.src || s.url, label: s.label || `Screenshot ${idx + 1}` };
    });
  }

  useEffect(() => {
    setMounted(true);
    setActiveScreenIdx(0);
    setMainImgError(false);
  }, [id, product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!mounted || !product) return null;

  const currentPrice = Number(prices[selectedPlan]) || 0;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const features = product.features || [
    "Aktivasi lisensi instan & otomatis 24/7",
    "Kompatibel dengan semua perangkat yang didukung",
    "Dukungan pembaruan patch & fitur reguler",
    "Garansi lisensi resmi PT Primadev Digital Technology",
    "Bantuan teknis & konsultasi langsung developer"
  ];

  const currentScreen = screenshots[activeScreenIdx] || screenshots[0];
  const hasValidScreenshot = Boolean(currentScreen?.src) && !mainImgError;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label={tr.modalClose}
        >
          <X size={20} />
        </button>

        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "8px" }}>
            <span className="badge-blue">
              {product.platform ? product.platform.toUpperCase() : "ANDROID APP"}
            </span>
            <span className="badge-green">
              <ShieldCheck size={14} /> Lisensi Resmi
            </span>
          </div>
          <h2 className="modal-title">{product.name}</h2>
          <div className="modal-subtitle">
            <span>PT Primadev Digital Technology</span>
            {product.package && (
              <>
                <span className="modal-dot">•</span>
                <span className="modal-package">{product.package}</span>
              </>
            )}
          </div>
        </div>

        <div className="modal-body-grid">
          {/* LEFT: GALLERY & DESCRIPTION */}
          <div className="modal-left-col">
            {/* Main Screenshot Preview or Fallback */}
            <div className="modal-screenshot-main">
              {hasValidScreenshot ? (
                <>
                  <img
                    src={currentScreen.src}
                    alt={currentScreen.label || product.name}
                    className="modal-main-img"
                    loading="eager"
                    onError={() => setMainImgError(true)}
                  />
                  {currentScreen.label && (
                    <div className="modal-screenshot-caption">
                      {currentScreen.label}
                    </div>
                  )}
                </>
              ) : (
                <div className="modal-screenshot-fallback">
                  <div className="fallback-android-icon" style={{ width: '56px', height: '56px', borderRadius: '16px' }}>
                    <AndroidFallbackIcon size={34} />
                  </div>
                  <span className="fallback-android-text" style={{ fontSize: '13px', maxWidth: '260px', marginTop: '4px' }}>
                    Gambar tidak tersedia untuk Aplikasi ini
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails strip (only if multiple valid screenshots) */}
            {screenshots.length > 1 && !mainImgError && (
              <div className="modal-thumbs-row">
                {screenshots.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`modal-thumb-btn ${activeScreenIdx === idx ? "active" : ""}`}
                    onClick={() => {
                      setActiveScreenIdx(idx);
                      setMainImgError(false);
                    }}
                    aria-label={s.label}
                  >
                    <img src={s.src} alt={s.label} className="modal-thumb-img" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="modal-desc-box">
              <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>
                Deskripsi Aplikasi
              </h4>
              <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--color-text-secondary)" }}>
                {product.description || product.shortDesc || "Aplikasi software digital premium dari PT Primadev Digital Technology dengan fitur lengkap, performa optimal, dan dukungan teknis terpercaya."}
              </p>
            </div>

            {/* Features */}
            <div className="modal-features-box">
              <h4 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>
                {tr.modalFeatures}
              </h4>
              <div className="modal-features-list">
                {features.map((feat, i) => (
                  <div key={i} className="modal-feature-item">
                    <Check size={16} className="modal-feature-icon" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: PLAN SELECTOR & PRICING */}
          <div className="modal-right-col">
            <div className="modal-pricing-card">
              <h3 style={{ fontSize: "17px", fontWeight: 800, marginBottom: "16px" }}>
                Pilihan Paket Lisensi
              </h3>

              {validPlans.length > 0 && (
                <div className="plan-tabs" style={{ marginBottom: "20px" }}>
                  {Number(prices.monthly) > 0 && (
                    <button
                      type="button"
                      className={`plan-tab ${selectedPlan === "monthly" ? "active" : ""}`}
                      onClick={() => setSelectedPlan("monthly")}
                    >
                      {tr.planMonthly}
                    </button>
                  )}
                  {Number(prices.yearly) > 0 && (
                    <button
                      type="button"
                      className={`plan-tab ${selectedPlan === "yearly" ? "active" : ""}`}
                      onClick={() => setSelectedPlan("yearly")}
                    >
                      {tr.planYearly}
                    </button>
                  )}
                  {Number(prices.lifetime) > 0 && (
                    <button
                      type="button"
                      className={`plan-tab ${selectedPlan === "lifetime" ? "active" : ""}`}
                      onClick={() => setSelectedPlan("lifetime")}
                    >
                      {tr.planLifetime}
                    </button>
                  )}
                </div>
              )}

              <div className="modal-price-box">
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                  Total Investasi
                </div>
                <div className="modal-price-amount">
                  {formatRupiah(currentPrice)}
                </div>
                <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginTop: "4px" }}>
                  {selectedPlan === "monthly"
                    ? "Berlaku 30 Hari (Dukungan Pembaruan)"
                    : selectedPlan === "yearly"
                    ? "Berlaku 365 Hari (Dukungan Penuh 1 Tahun)"
                    : "Sekali Bayar Selamanya (Akses Seumur Hidup)"}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
                <Link
                  href={`/checkout?app=${id}&plan=${selectedPlan}`}
                  className="btn-primary"
                  style={{ width: "100%", padding: "14px", fontSize: "15px", textAlign: "center" }}
                  onClick={onClose}
                >
                  <span>{tr.modalBuy}</span>
                  <ArrowRight size={17} />
                </Link>

                <a
                  href={`https://wa.me/6283829520561?text=Halo%20Primadev,%20saya%20ingin%20tanya%20tentang%20aplikasi%20${encodeURIComponent(product.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ width: "100%", padding: "12px", fontSize: "14px", textAlign: "center", justifyContent: "center" }}
                >
                  <MessageCircle size={16} />
                  <span>{tr.modalConsult}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
