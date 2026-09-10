"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import t from "@/lib/translations";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { Sparkles, ShieldCheck, Zap, RefreshCw, ChevronDown, ArrowRight } from "lucide-react";

export default function StoreClientView({ initialProducts = {} }) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#catalog") {
      setTimeout(() => {
        const el = document.getElementById("catalog");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, []);
  const { lang } = useLang();
  const tr = t[lang];
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);

  const categories = [
    { id: "all", label: tr.catalog.filterAll },
    { id: "android", label: tr.catalog.filterAndroid },
    { id: "ios", label: tr.catalog.filterIos },
    { id: "extension", label: tr.catalog.filterExtension }
  ];

  const productEntries = Object.entries(initialProducts);

  const filteredProducts = productEntries.filter(([id, prod]) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "android") {
      const plat = (prod.platform || prod.type || '').toLowerCase();
      return plat === 'android' || plat === 'app' || !plat;
    }
    if (selectedCategory === "extension") {
      const plat = (prod.platform || prod.type || '').toLowerCase();
      return plat === 'extension';
    }
    return false;
  });

  const faqs = [
    { q: tr.faq.q1, a: tr.faq.a1 },
    { q: tr.faq.q2, a: tr.faq.a2 },
    { q: tr.faq.q3, a: tr.faq.a3 },
    { q: tr.faq.q4, a: tr.faq.a4 }
  ];

  return (
    <>
      {/* HERO SECTION (Badge Removed as requested) */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">{tr.hero.title}</h1>
          <p className="hero-subtitle">{tr.hero.subtitle}</p>

          <div className="hero-cta-group">
            <a href="#catalog" className="btn-primary">
              <span>{tr.hero.btnBrowse}</span>
              <ArrowRight size={16} />
            </a>
            <Link href="/renew" className="btn-secondary">
              <RefreshCw size={16} />
              <span>{tr.hero.btnRenew}</span>
            </Link>
          </div>

          <div className="hero-stats-row">
            <div className="stat-card">
              <div className="stat-val">{tr.hero.stat1_val}</div>
              <div className="stat-lbl">{tr.hero.stat1_label}</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{tr.hero.stat2_val}</div>
              <div className="stat-lbl">{tr.hero.stat2_label}</div>
            </div>
            <div className="stat-card">
              <div className="stat-val">{tr.hero.stat3_val}</div>
              <div className="stat-lbl">{tr.hero.stat3_label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG SECTION */}
      <section className="container" id="catalog" style={{ padding: '60px 24px 0' }}>
        <div className="section-header">
          <h2 className="section-title">{tr.catalog.title}</h2>
          <p className="section-subtitle">{tr.catalog.subtitle}</p>
        </div>

        {/* 4 FILTER CHIPS: SEMUA, ANDROID APP, IOS, EXTENSION */}
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* DYNAMIC VIEW FOR SELECTED CHIP */}
        {selectedCategory === "ios" ? (
          <div className="ios-notice-card">
            <div className="ios-icon-circle">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.06-1.82.94-2.87-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.75-.95 2.78 1.02.08 2.05-.52 2.68-1.28z" />
              </svg>
            </div>
            <h3 className="ios-notice-title">{tr.catalog.iosNoticeTitle}</h3>
            <p className="ios-notice-desc">{tr.catalog.iosNoticeDesc}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map(([id, prod]) => (
              <ProductCard
                key={id}
                id={id}
                product={prod}
                onOpenDetail={(prodId, prodData) => setModalProduct({ id: prodId, product: prodData })}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
            <p>{tr.catalog.noProducts}</p>
          </div>
        )}
      </section>

      {/* PRODUCT DETAIL MODAL POPUP */}
      {modalProduct && (
        <ProductDetailModal
          id={modalProduct.id}
          product={modalProduct.product}
          onClose={() => setModalProduct(null)}
        />
      )}

      {/* WHY US SECTION */}
      <section className="why-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{tr.features.title}</h2>
            <p className="section-subtitle">{tr.features.subtitle}</p>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon-wrap"><Zap /></div>
              <h3 className="why-title">{tr.features.f1_title}</h3>
              <p className="why-desc">{tr.features.f1_desc}</p>
            </div>
            <div className="why-card">
              <div className="why-icon-wrap"><ShieldCheck /></div>
              <h3 className="why-title">{tr.features.f2_title}</h3>
              <p className="why-desc">{tr.features.f2_desc}</p>
            </div>
            <div className="why-card">
              <div className="why-icon-wrap"><Sparkles /></div>
              <h3 className="why-title">{tr.features.f3_title}</h3>
              <p className="why-desc">{tr.features.f3_desc}</p>
            </div>
            <div className="why-card">
              <div className="why-icon-wrap"><RefreshCw /></div>
              <h3 className="why-title">{tr.features.f4_title}</h3>
              <p className="why-desc">{tr.features.f4_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* RENEW BANNER */}
      <div className="container">
        <div className="renew-banner">
          <div>
            <span className="badge-blue" style={{ marginBottom: '10px' }}>Portal Perpanjangan</span>
            <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>Sudah Memiliki Lisensi Software?</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', maxWidth: '540px' }}>
              Perpanjang masa aktif lisensi Anda kapan saja tanpa kehilangan konfigurasi atau data aplikasi Anda.
            </p>
          </div>
          <Link href="/renew" className="btn-primary" style={{ padding: '14px 28px' }}>
            <RefreshCw size={16} />
            <span>Perpanjang Sekarang</span>
          </Link>
        </div>
      </div>

      {/* FAQ SECTION */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{tr.faq.title}</h2>
            <p className="section-subtitle">{tr.faq.subtitle}</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-item">
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </button>
                {openFaq === idx && (
                  <div className="faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
