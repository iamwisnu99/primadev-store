"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import t from "@/lib/translations";

export default function Footer() {
  const { lang } = useLang();
  const { theme } = useTheme();
  const tr = t[lang].footer;

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Image
                src={theme === 'light' ? '/primadev_light.png' : '/primadev_dark.png'}
                alt="Primadev Digital Technology"
                width={150}
                height={40}
                className="site-logo-img"
                style={{ width: 'auto', height: '36px' }}
              />
            </Link>
            <p className="footer-tagline">{tr.tagline}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href="https://wa.me/6283829520561"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-action-btn"
                style={{ width: '38px', padding: 0 }}
                aria-label="WhatsApp Support"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.116 1.535 5.845L.057 23.428a.75.75 0 0 0 .916.939l5.701-1.496A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.513-5.19-1.41l-.37-.22-3.835 1.006 1.023-3.738-.242-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/primadev.id"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-action-btn"
                style={{ width: '38px', padding: 0 }}
                aria-label="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://tiktok.com/@primadev.id"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-action-btn"
                style={{ width: '38px', padding: 0 }}
                aria-label="TikTok"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">{tr.services_heading}</h4>
            <div className="footer-links">
              <Link href="/#catalog">{tr.link_buy}</Link>
              <Link href="/renew">{tr.link_renew}</Link>
              <Link href="/check-license">{tr.link_check}</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">{tr.quick_heading}</h4>
            <div className="footer-links">
              <Link href="/check-license">Cek Masa Aktif</Link>
              <Link href="/support">Pusat Bantuan</Link>
              <a href="https://primadev.id" target="_blank" rel="noopener noreferrer">Profil Perusahaan</a>
              <a href="https://wa.me/6283829520561" target="_blank" rel="noopener noreferrer">WhatsApp Support</a>
            </div>
          </div>

          <div className="footer-info-col">
            <h4 className="footer-heading">{tr.info_heading}</h4>
            <p className="footer-info-desc">
              {tr.info_desc}
            </p>
            <a
              href={tr.info_legal_url}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-legal-ahu-row"
              title={lang === "en" ? "View Official AHU Certificate" : "Lihat Sertifikat Resmi SK AHU"}
            >
              <div className="footer-kemenkumham-logo-wrap">
                <Image
                  src="/kemenkumham.png"
                  alt="Kemenkumham RI"
                  width={46}
                  height={46}
                  className="kemenkumham-ahu-img"
                />
              </div>
              <div className="footer-legal-ahu-text">
                <span className="footer-legal-ahu-inst">{tr.info_legal_institution}</span>
                <span className="footer-legal-ahu-label">{tr.info_legal_sk_label}</span>
                <span className="footer-legal-ahu-num">{tr.info_legal_sk}</span>
              </div>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div>{tr.copyright(new Date().getFullYear())}</div>
          <div className="footer-legal-row">
            <a href="https://primadev.id/syarat-ketentuan" target="_blank" rel="noopener noreferrer">{tr.terms}</a>
            <a href="https://primadev.id/kebijakan-privasi" target="_blank" rel="noopener noreferrer">{tr.privacy}</a>
            <a href="https://primadev.id/disclaimer" target="_blank" rel="noopener noreferrer">{tr.disclaimer}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
