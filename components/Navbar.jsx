"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import t from "@/lib/translations";
import {
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Check,
  LayoutGrid,
  RefreshCw,
  Search,
  LifeBuoy,
  ShoppingBag,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

const LANGUAGES = [
  {
    code: "id",
    label: "Indonesia",
    shortCode: "ID",
    flagIso: "id",
  },
  {
    code: "en",
    label: "English",
    shortCode: "EN",
    flagIso: "us",
  },
];

export default function Navbar() {
  const { lang, switchLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const tr = t[lang].nav;
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const isCheckout = pathname === '/checkout';
  const isWaitingPayment = pathname === '/waiting-payment';
  const isCheckoutOrWaiting = isCheckout || isWaitingPayment;

  const activeLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const handleNavBackClick = (e) => {
    if (e) e.preventDefault();
    if (isWaitingPayment) {
      window.dispatchEvent(new CustomEvent('primadev:open-cancel-modal'));
    } else {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.back();
      } else {
        router.push('/#catalog');
      }
    }
  };

  const handleCatalogScroll = (e) => {
    setMobileOpen(false);
    if (pathname === "/") {
      if (e) e.preventDefault();
      const elem = document.getElementById("catalog");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/#catalog");
    }
  };

  const navLinks = [
    { href: "/#catalog", label: tr.catalog, isCatalog: true, icon: <LayoutGrid size={18} /> },
    { href: "/renew", label: tr.renew, isCatalog: false, icon: <RefreshCw size={18} /> },
    { href: "/check-license", label: tr.check, isCatalog: false, icon: <Search size={18} /> },
    { href: "/support", label: tr.support, isCatalog: false, icon: <LifeBuoy size={18} /> }
  ];

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setLangOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setLangOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close mobile menu when resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="navbar">
        <div className="container nav-container">
          {/* BRAND LOGO OR BACK BUTTON ON CHECKOUT & WAITING PAYMENT */}
          {isCheckoutOrWaiting ? (
            <button
              type="button"
              className="nav-back-brand-btn"
              onClick={handleNavBackClick}
              aria-label={lang === 'en' ? 'Back' : 'Kembali'}
              title={lang === 'en' ? 'Back' : 'Kembali'}
            >
              <ChevronLeft size={19} className="nav-back-arrow" />
              <span>{lang === 'en' ? 'Back' : 'Kembali'}</span>
            </button>
          ) : (
            <Link
              href="/"
              className="nav-brand"
              aria-label="Primadev Digital Technology"
              onClick={() => setMobileOpen(false)}
            >
              <Image
                src={theme === 'light' ? '/primadev_light.png' : '/primadev_dark.png'}
                alt="Primadev Digital Technology"
                width={140}
                height={38}
                priority
                className="site-logo-img"
                style={{ width: 'auto', height: '34px' }}
              />
            </Link>
          )}

          {/* DESKTOP NAV LINKS & MOBILE MENU DRAWER */}
          <nav className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                onClick={item.isCatalog ? handleCatalogScroll : () => setMobileOpen(false)}
              >
                <div className="nav-link-left">
                  <span className="nav-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={16} className="nav-link-chevron" />
              </Link>
            ))}

            {/* MOBILE ONLY CTA BUTTON (INSIDE DROPDOWN) */}
            <div className="nav-mobile-cta-box">
              <Link
                href="/#catalog"
                className="btn-primary nav-mobile-cta-btn"
                onClick={handleCatalogScroll}
              >
                <ShoppingBag size={18} />
                <span>{tr.cta}</span>
              </Link>
            </div>
          </nav>

          {/* RIGHT ACTION BUTTONS */}
          <div className="nav-actions">
            {/* THEME TOGGLE */}
            <button
              type="button"
              className="nav-action-btn"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? tr.themeLight : tr.themeDark}
              title={theme === "dark" ? tr.themeLight : tr.themeDark}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* LANGUAGE TOGGLE WITH FLAGS */}
            <div className="lang-dropdown-box" ref={langDropdownRef}>
              <button
                type="button"
                className={`nav-action-btn ${langOpen ? 'open' : ''}`}
                onClick={() => setLangOpen(!langOpen)}
                aria-label="Switch Language"
              >
                <img
                  src={`https://flagcdn.com/w40/${activeLang.flagIso}.png`}
                  srcSet={`https://flagcdn.com/w80/${activeLang.flagIso}.png 2x`}
                  alt={activeLang.label}
                  width="18"
                  height="13"
                  className="lang-flag"
                  loading="eager"
                />
                <span>{activeLang.shortCode}</span>
                <ChevronDown size={12} className={`lang-chevron ${langOpen ? 'open' : ''}`} />
              </button>
              {langOpen && (
                <div className="lang-menu">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className={`lang-item ${lang === l.code ? 'active' : ''}`}
                      onClick={() => { switchLang(l.code); setLangOpen(false); }}
                    >
                      <img
                        src={`https://flagcdn.com/w40/${l.flagIso}.png`}
                        srcSet={`https://flagcdn.com/w80/${l.flagIso}.png 2x`}
                        alt={l.label}
                        width="20"
                        height="14"
                        className="lang-flag-opt"
                        loading="lazy"
                      />
                      <span>{l.label}</span>
                      {lang === l.code && <Check size={14} className="lang-check" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DESKTOP ONLY CTA BUY LICENSE BUTTON */}
            {!isCheckoutOrWaiting && (
              <Link
                href="/#catalog"
                className="btn-primary nav-cta-btn nav-cta-desktop"
                onClick={handleCatalogScroll}
              >
                <span>{tr.cta}</span>
              </Link>
            )}

            {/* HAMBURGER TOGGLE */}
            <button
              type="button"
              className="nav-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle Menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileOpen && (
        <div
          className="nav-mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
