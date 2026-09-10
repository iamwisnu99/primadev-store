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
  "spbu-struk": [
    { src: "/struk-spbu/struk_app.png", label: "Dashboard & Generator Struk Digital" },
    { src: "/struk-spbu/struk_app_1.png", label: "Katalog Template & Format SPBU BBM" },
    { src: "/struk-spbu/struk_app_2.png", label: "Preview Cetak Struk Bluetooth Termal" }
  ],
  "struk-spbu": [
    { src: "/struk-spbu/struk_app.png", label: "Dashboard & Generator Struk Digital" },
    { src: "/struk-spbu/struk_app_1.png", label: "Katalog Template & Format SPBU BBM" },
    { src: "/struk-spbu/struk_app_2.png", label: "Preview Cetak Struk Bluetooth Termal" }
  ],
  whatsapp_direct: [
    { src: "/wa-direct/WhatsApp_Direct.png", label: "Tampilan Utama Chat Tanpa Simpan Nomor" },
    { src: "/wa-direct/WhatsApp_Direct_Country_Number.png", label: "Pilihan Kode Negara Internasional" },
    { src: "/wa-direct/WhatsApp_Direct_QR_Code.png", label: "Fitur Scan QR WhatsApp Cepat" },
    { src: "/wa-direct/WhatsApp_Direct_Languages.png", label: "Dukungan Bahasa Indonesia & Global" }
  ]
};

export default function ProductDetailModal({ id, product, onClose }) {
  const { lang } = useLang();
  const tr = t[lang].catalog;

  const [mounted, setMounted] = useState(false);
  const [activeScreenIdx, setActiveScreenIdx] = useState(0);

  const prices = product?.price || {};
  const validPlans = Object.keys(prices).filter((p) => Number(prices[p]) > 0);
  const [selectedPlan, setSelectedPlan] = useState(
    validPlans.includes("monthly") ? "monthly" : validPlans[0] || "monthly"
  );

  const matchedScreenshots = PRODUCT_SCREENSHOTS_MAP[id] || PRODUCT_SCREENSHOTS_MAP["spbu-struk"];

  const screenshots = (Array.isArray(product?.screenshots) && product.screenshots.length > 0)
    ? product.screenshots
    : matchedScreenshots;

  useEffect(() => {
    setMounted(true);
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
            {/* Main Screenshot Preview */}
            <div className="modal-screenshot-main">
              <img
                src={currentScreen.src}
                alt={currentScreen.label}
                className="modal-main-img"
                loading="eager"
              />
              <div className="modal-screenshot-caption">
                {currentScreen.label}
              </div>
            </div>

            {/* Thumbnails strip */}
            {screenshots.length > 1 && (
              <div className="modal-thumbs-row">
                {screenshots.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`modal-thumb-btn ${activeScreenIdx === idx ? "active" : ""}`}
                    onClick={() => setActiveScreenIdx(idx)}
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
