"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { Check, ArrowRight, Sparkles, Eye } from "lucide-react";

const SCREENSHOT_THUMB_MAP = {
  kasir_q: "/KasirQ/KasirQ.png",
  "spbu-struk": "/struk-spbu/struk_app.png",
  whatsapp_direct: "/wa-direct/WhatsApp_Direct.png"
};

export default function ProductCard({ id, product, onOpenDetail }) {
  const { lang } = useLang();
  const tr = t[lang].catalog;

  const prices = product.price || {};
  const validPlans = Object.keys(prices).filter((p) => Number(prices[p]) > 0);
  const initialPlan = validPlans.includes("monthly")
    ? "monthly"
    : validPlans[0] || "monthly";

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);

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

  const currentPrice = Number(prices[selectedPlan]) || 0;

  return (
    <div className="product-card">
      {/* Screenshot / Visual Banner */}
      {previewImage && (
        <div
          className="card-screenshot-container"
          onClick={() => onOpenDetail && onOpenDetail(id, product)}
          title="Klik untuk melihat detail dan screenshot lengkap"
        >
          <img
            src={previewImage}
            alt={product.name}
            className="card-screenshot-img"
            loading="lazy"
          />
          <div className="card-screenshot-overlay">
            <span className="card-screenshot-view-btn">
              <Eye size={15} />
              <span>Lihat Detail</span>
            </span>
          </div>
        </div>
      )}

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
