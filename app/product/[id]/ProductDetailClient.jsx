"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import t from "@/lib/translations";
import { Check, ArrowRight, ShieldCheck, ChevronLeft } from "lucide-react";

export default function ProductDetailClient({ id, product }) {
  const { lang } = useLang();
  const tr = t[lang].catalog;

  const prices = product.price || {};
  const validPlans = Object.keys(prices).filter((p) => Number(prices[p]) > 0);
  const initialPlan = validPlans.includes('monthly') ? 'monthly' : validPlans[0] || 'monthly';

  const [plan, setPlan] = useState(initialPlan);

  const currentPrice = prices[plan] || 0;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
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

  return (
    <div className="checkout-wrapper">
      <div className="container">
        <Link href="/#catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
          <ChevronLeft size={16} />
          <span>Kembali ke Katalog</span>
        </Link>

        <div className="checkout-grid">
          <div>
            <div className="form-card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span className="badge-blue">{product.platform?.toUpperCase() || 'APP'}</span>
                <span className="badge-green"><ShieldCheck size={13} /> Lisensi Resmi</span>
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>{product.name}</h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>{product.description || product.shortDesc}</p>
            </div>

            <div className="form-card">
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '18px' }}>Fitur & Keunggulan Software</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <Check size={18} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="order-summary-card">
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Pilih Paket Lisensi</h3>

              {validPlans.length > 0 && (
                <div className="plan-tabs" style={{ marginBottom: '24px' }}>
                  {Number(prices.monthly) > 0 && (
                    <button
                      type="button"
                      className={`plan-tab ${plan === 'monthly' ? 'active' : ''}`}
                      onClick={() => setPlan('monthly')}
                    >
                      {tr.planMonthly}
                    </button>
                  )}
                  {Number(prices.yearly) > 0 && (
                    <button
                      type="button"
                      className={`plan-tab ${plan === 'yearly' ? 'active' : ''}`}
                      onClick={() => setPlan('yearly')}
                    >
                      {tr.planYearly}
                    </button>
                  )}
                  {Number(prices.lifetime) > 0 && (
                    <button
                      type="button"
                      className={`plan-tab ${plan === 'lifetime' ? 'active' : ''}`}
                      onClick={() => setPlan('lifetime')}
                    >
                      {tr.planLifetime}
                    </button>
                  )}
                </div>
              )}

              <div style={{ textAlign: 'center', padding: '20px', background: 'var(--color-surface-2)', borderRadius: '12px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Investasi</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-accent)', margin: '6px 0' }}>{formatRupiah(currentPrice)}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {plan === 'monthly' ? 'Berlaku 30 Hari' : plan === 'yearly' ? 'Berlaku 365 Hari' : 'Sekali Bayar Selamanya'}
                </div>
              </div>

              <Link
                href={`/checkout?app=${id}&plan=${plan}`}
                className="btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '15px' }}
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
