"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import t from "@/lib/translations";
import { Sun, Moon, Menu, X, ChevronDown, Check } from "lucide-react";

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

  const activeLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const handleCatalogScroll = (e) => {
    setMobileOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const elem = document.getElementById("catalog");
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If on another page, let default Link navigate to /#catalog
    }
  };

  const navLinks = [
    { href: "/#catalog", label: tr.catalog, isCatalog: true },
    { href: "/renew", label: tr.renew, isCatalog: false },
    { href: "/check-license", label: tr.check, isCatalog: false },
    { href: "/support", label: tr.support, isCatalog: false }
  ];

  useEffect(() => {
    const handleClick = (e) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link href="/" className="nav-brand" aria-label="Primadev Digital Technology">
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

        <nav className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              onClick={item.isCatalog ? handleCatalogScroll : () => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

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

          {/* CTA BUY LICENSE BUTTON */}
          <Link
            href="/#catalog"
            className="btn-primary nav-cta-btn"
            onClick={handleCatalogScroll}
          >
            {tr.cta}
          </Link>

          <button
            type="button"
            className="nav-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
