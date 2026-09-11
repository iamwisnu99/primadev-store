"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { Check, ArrowRight, Sparkles, Eye } from "lucide-react";

const SCREENSHOT_THUMB_MAP = {
  kasir_q: "/KasirQ/KasirQ.png",
  whatsapp_direct: "/wa-direct/WhatsApp_Direct.png"
};

function AndroidFallbackIcon({ size = 30 }) {
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

export default function ProductCard({ id, product, onOpenDetail }) {
  const { lang } = useLang();
  const tr = t[lang].catalog;

  const prices = product.price || {};
  const validPlans = Object.keys(prices).filter((p) => Number(prices[p]) > 0);
  const initialPlan = validPlans.includes("monthly")
    ? "monthly"
    : validPlans[0] || "monthly";

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [imageError, setImageError] = useState(false);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  const features = product.features || [
    "Aktivasi lisensi instan & otomatis 24/7",
    "Kompatibel semua perangkat Android",
    "Pembaruan berkala & garansi resmi"
  ];

  // Image / screenshot thumbnail
  let previewImage = SCREENSHOT_THUMB_MAP[id] || null;
  if (Array.isArray(product.screenshots) && product.screenshots.length > 0) {
    const first = product.screenshots[0];
    previewImage = typeof first === "string" ? first : first.src || first.url;
  } else if (product.customImage) {
    previewImage = product.customImage;
  }

  const hasValidImage = previewImage && !imageError;
  const currentPrice = Number(prices[selectedPlan]) || 0;

  return (
    <div className="product-card">
      {/* Screenshot / Visual Banner with Android Fallback */}
      <div
        className={`card-screenshot-container ${!hasValidImage ? "placeholder" : ""}`}
        onClick={() => onOpenDetail && onOpenDetail(id, product)}
        title="Klik untuk melihat detail dan screenshot lengkap"
      >
        {hasValidImage ? (
          <img
            src={previewImage}
            alt={product.name}
            className="card-screenshot-img"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="card-screenshot-fallback">
            <div className="fallback-android-icon">
              <AndroidFallbackIcon size={28} />
            </div>
            <span className="fallback-android-text">
              Gambar tidak tersedia untuk Aplikasi ini
            </span>
          </div>
        )}
        <div className="card-screenshot-overlay">
          <span className="card-screenshot-view-btn">
            <Eye size={15} />
            <span>Lihat Detail</span>
          </span>
        </div>
      </div>

      <div className="product-card-header">
        <h3
          className="product-title"
          onClick={() => onOpenDetail && onOpenDetail(id, product)}
          style={{ cursor: "pointer" }}
        >
          {product.name}
        </h3>
        <p className="product-desc">
          {product.description || product.shortDesc || "Aplikasi resmi dari PT Primadev Digital Technology."}
        </p>
      </div>

      {validPlans.length > 0 && (
        <div className="plan-tabs">
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

      <div className="pricing-box">
        <div className="price-main">
          <span className="price-number">{formatRupiah(currentPrice)}</span>
          <span className="price-cycle">
            {selectedPlan === "monthly"
              ? tr.monthlyShort
              : selectedPlan === "yearly"
              ? tr.yearlyShort
              : `(${tr.lifetimeShort})`}
          </span>
        </div>
        <div className="price-guarantee">
          <Sparkles size={13} color="#036EFD" />
          <span>Aktivasi Instan & Bergaransi</span>
        </div>
      </div>

      <div className="features-list">
        {features.slice(0, 3).map((feat, i) => (
          <div key={i} className="feature-item">
            <Check size={15} className="feature-icon" />
            <span>{feat}</span>
          </div>
        ))}
      </div>

      <div className="card-actions">
        <Link
          href={`/checkout?app=${id}&plan=${selectedPlan}`}
          className="btn-primary"
        >
          <span>{tr.btnBuy}</span>
          <ArrowRight size={15} />
        </Link>
        <button
          type="button"
          onClick={() => onOpenDetail && onOpenDetail(id, product)}
          className="btn-secondary"
          title={tr.btnDetail}
        >
          {tr.btnDetail}
        </button>
      </div>
    </div>
  );
}
