"use client";

import { useState, useRef, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import t from "@/lib/translations";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Loader2,
  KeyRound,
  CreditCard,
  RefreshCw,
  Bug,
  MessageSquare,
  ChevronDown
} from "lucide-react";

const topicIcons = {
  aktivasi: <KeyRound size={17} />,
  pembayaran: <CreditCard size={17} />,
  perpanjangan: <RefreshCw size={17} />,
  bug: <Bug size={17} />,
  lainnya: <MessageSquare size={17} />
};

export default function SupportPage() {
  const { lang } = useLang();
  const tr = t[lang].supportPage;
  const cm = t[lang].country_modal;
  const countries = t[lang].countries || [];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    licenseKey: "",
    topic: "aktivasi",
    message: ""
  });

  const [selectedCountry, setSelectedCountry] = useState(countries[0] || { code: "+62", name: "Indonesia", flag: "🇮🇩", iso: "ID" });
  const [phoneDigits, setPhoneDigits] = useState("");
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isCountryModalClosing, setIsCountryModalClosing] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const searchInputRef = useRef(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const topics = tr.topicOptions.map((opt) => ({
    ...opt,
    icon: topicIcons[opt.value] || <MessageSquare size={17} />
  }));

  const selectedTopicObj = topics.find((item) => item.value === form.topic) || topics[0];

  useEffect(() => {
    const match = countries.find((c) => c.iso === selectedCountry.iso);
    if (match) setSelectedCountry(match);
  }, [lang]);

  const openCountryModal = () => {
    setIsCountryModalClosing(false);
    setIsCountryModalOpen(true);
  };

  const closeCountryModal = () => {
    if (isCountryModalClosing) return;
    setIsCountryModalClosing(true);
    setTimeout(() => {
      setIsCountryModalOpen(false);
      setIsCountryModalClosing(false);
      setCountrySearch("");
    }, 220);
  };

  useEffect(() => {
    if (isCountryModalOpen && !isCountryModalClosing) {
      setTimeout(() => { searchInputRef.current?.focus(); }, 100);
    }
  }, [isCountryModalOpen, isCountryModalClosing]);

  useEffect(() => {
    if (isCountryModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = originalOverflow; };
    }
  }, [isCountryModalOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        closeCountryModal();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCountryModalClosing]);

  const handleNameChange = (e) => {
    setForm((f) => ({ ...f, name: e.target.value.toUpperCase() }));
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.startsWith("0")) val = val.replace(/^0+/, "");
    setPhoneDigits(val);
    setForm((f) => ({ ...f, phone: val ? `${selectedCountry.code}${val}` : "" }));
  };

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    closeCountryModal();
    setForm((f) => ({ ...f, phone: phoneDigits ? `${country.code}${phoneDigits}` : "" }));
  };

  const handleSelectTopic = (val) => {
    setForm((f) => ({ ...f, topic: val }));
    setIsDropdownOpen(false);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setForm({
          name: "",
          email: "",
          phone: "",
          licenseKey: "",
          topic: "aktivasi",
          message: ""
        });
        setPhoneDigits("");
      } else {
        throw new Error(data.message || "Gagal mengirimkan pesan bantuan.");
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.includes(countrySearch) ||
      c.iso.toLowerCase().includes(countrySearch.toLowerCase())
  );

  return (
    <div className="checkout-wrapper">
      <div className="container" style={{ maxWidth: '980px' }}>
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>{tr.title}</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', maxWidth: '640px', margin: '0 auto' }}>
            {tr.subtitle}
          </p>
        </div>

        <div className="checkout-grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: '28px' }}>
          {/* FORM CARD */}
          <div className="form-card">
            <h2 className="form-section-title">
              <span>{tr.formTitle}</span>
            </h2>

            {success ? (
              <div style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid #22c55e', borderRadius: '12px', padding: '28px 24px', textAlign: 'center' }}>
                <CheckCircle2 size={44} color="#22c55e" style={{ margin: '0 auto 14px' }} />
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>{tr.successTitle}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>{tr.successDesc}</p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSuccess(false)}
                  style={{ marginTop: '20px' }}
                >
                  Kirim Pesan Lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* NAMA LENGKAP (AUTO-CAPITAL) */}
                <div className="form-group">
                  <label className="form-label">{tr.nameLabel}</label>
                  <input
                    type="text"
                    required
                    name="name"
                    placeholder={tr.namePlaceholder}
                    className="form-input input-capslock"
                    autoCapitalize="characters"
                    value={form.name}
                    onChange={handleNameChange}
                  />
                </div>

                <div className="form-row">
                  {/* ALAMAT EMAIL */}
                  <div className="form-group">
                    <label className="form-label">{tr.emailLabel}</label>
                    <input
                      type="email"
                      required
                      name="email"
                      placeholder={tr.emailPlaceholder}
                      className="form-input"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* NOMOR WHATSAPP DENGAN KODE NEGARA */}
                  <div className="form-group">
                    <label className="form-label">{tr.phoneLabel}</label>
                    <div className="phone-input-group">
                      <button
                        type="button"
                        className="country-code-trigger"
                        onClick={openCountryModal}
                        title={cm.country_trigger_title(selectedCountry.name, selectedCountry.code)}
                        aria-label={cm.select_country}
                      >
                        <span className="country-flag-wrap">
                          <img
                            src={`https://flagcdn.com/w40/${selectedCountry.iso.toLowerCase()}.png`}
                            alt={selectedCountry.name}
                            className="country-flag-img"
                          />
                        </span>
                        <span className="country-dial-code">{selectedCountry.code}</span>
                        <ChevronDown size={13} className="country-chevron" />
                      </button>

                      <input
                        type="tel"
                        required
                        name="phoneDigits"
                        placeholder={tr.phonePlaceholder}
                        className="phone-number-input"
                        value={phoneDigits}
                        onChange={handlePhoneChange}
                      />
                    </div>
                    {tr.phoneHint && <span className="input-hint">{tr.phoneHint}</span>}
                  </div>
                </div>

                <div className="form-row">
                  {/* LICENSE KEY (OPTIONAL) */}
                  <div className="form-group">
                    <label className="form-label">{tr.licenseKeyLabel}</label>
                    <input
                      type="text"
                      name="licenseKey"
                      placeholder={tr.licenseKeyPlaceholder}
                      className="form-input"
                      value={form.licenseKey}
                      onChange={(e) => setForm(f => ({ ...f, licenseKey: e.target.value.toUpperCase() }))}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>

                  {/* CUSTOM TOPIC DROPDOWN */}
                  <div className="form-group" ref={dropdownRef}>
                    <label className="form-label">{tr.topicLabel}</label>
                    <div className="custom-dropdown-container">
                      <button
                        type="button"
                        className={`custom-dropdown-trigger ${isDropdownOpen ? "open" : ""}`}
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        aria-haspopup="listbox"
                        aria-expanded={isDropdownOpen}
                      >
                        <div className="dropdown-selected-content">
                          {selectedTopicObj ? (
                            <>
                              <span className="dropdown-item-icon">{selectedTopicObj.icon}</span>
                              <span className="dropdown-selected-text">{selectedTopicObj.label}</span>
                            </>
                          ) : (
                            <span className="dropdown-placeholder">{tr.topicPlaceholder}</span>
                          )}
                        </div>
                        <span className={`dropdown-chevron ${isDropdownOpen ? "open" : ""}`}>
                          <ChevronDown size={16} />
                        </span>
                      </button>

                      {isDropdownOpen && (
                        <div className="custom-dropdown-menu" role="listbox">
                          {topics.map((item) => {
                            const isSelected = form.topic === item.value;
                            return (
                              <div
                                key={item.value}
                                role="option"
                                aria-selected={isSelected}
                                className={`custom-dropdown-option ${isSelected ? "selected" : ""}`}
                                onClick={() => handleSelectTopic(item.value)}
                              >
                                <div className="option-icon-wrapper">{item.icon}</div>
                                <div className="option-text-wrapper">
                                  <span className="option-title">{item.label}</span>
                                  {item.desc && <span className="option-desc">{item.desc}</span>}
                                </div>
                                {isSelected && (
                                  <div className="option-check-icon">
                                    <CheckCircle2 size={16} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PESAN BANTUAN */}
                <div className="form-group">
                  <label className="form-label">{tr.messageLabel}</label>
                  <textarea
                    required
                    rows={4}
                    name="message"
                    placeholder={tr.messagePlaceholder}
                    className="form-input"
                    value={form.message}
                    onChange={handleChange}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {errorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <AlertCircle size={16} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '15px' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>{tr.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>{tr.btnSubmit}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT SIDEBAR / DIRECT WHATSAPP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="order-summary-card" style={{ position: 'static' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(37, 211, 102, 0.12)',
                  border: '1px solid rgba(37, 211, 102, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.116 1.535 5.845L.057 23.428a.75.75 0 0 0 .916.939l5.701-1.496A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.513-5.19-1.41l-.37-.22-3.835 1.006 1.023-3.738-.242-.386A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>{tr.directWaTitle}</h3>
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
                {tr.directWaDesc}
              </p>
              <a
                href="https://wa.me/6283829520561"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ width: '100%', background: '#25D366', color: '#ffffff', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', fontWeight: 700 }}
              >
                <span>{tr.btnChatWa}</span>
              </a>
            </div>

            <div className="order-summary-card" style={{ position: 'static' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={16} color="#036EFD" />
                <span>Jaminan Layanan Kami</span>
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Clock size={15} color="#036EFD" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Respon cepat dalam 1x24 jam kerja</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <ShieldCheck size={15} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Dukungan teknis langsung dari engineer pengembang</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* COUNTRY SELECTION MODAL */}
      {isCountryModalOpen && (
        <div
          className={`country-modal-backdrop ${isCountryModalClosing ? "closing" : ""}`}
          onClick={closeCountryModal}
        >
          <div
            className={`country-modal-card ${isCountryModalClosing ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={cm.title}
          >
            <div className="country-modal-top-bar">
              <div className="country-modal-title-group">
                <h4 className="country-modal-title">{cm.title}</h4>
                <p className="country-modal-subtitle">{cm.subtitle}</p>
              </div>
              <button
                type="button"
                className="country-modal-close"
                onClick={closeCountryModal}
                aria-label={cm.close}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="country-modal-toolbar">
              <div className="country-search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="country-search-icon">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder={cm.search_placeholder}
                  className="country-search-input"
                />
                {countrySearch && (
                  <button
                    type="button"
                    className="country-search-clear"
                    onClick={() => setCountrySearch("")}
                    aria-label={cm.clear_search}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="country-results-count">
                <span>{cm.results_count(filteredCountries.length)}</span>
              </div>
            </div>

            <div className="country-list-scroll">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => {
                  const isSelected = selectedCountry.code === c.code && selectedCountry.iso === c.iso;
                  return (
                    <button
                      key={`${c.iso}-${c.code}`}
                      type="button"
                      className={`country-item-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => handleSelectCountry(c)}
                    >
                      <span className="country-item-flag-wrap">
                        <img
                          src={`https://flagcdn.com/w40/${c.iso.toLowerCase()}.png`}
                          alt={`Flag ${c.name}`}
                          className="country-item-flag-img"
                          loading="lazy"
                        />
                      </span>
                      <span className="country-item-name">{c.name}</span>
                      <span className="country-item-code">{c.code}</span>
                      {isSelected && (
                        <span className="country-item-check">
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="country-empty-state">
                  <p>{cm.empty(countrySearch)}</p>
                  <button
                    type="button"
                    className="country-empty-reset-btn"
                    onClick={() => setCountrySearch("")}
                  >
                    {cm.reset_btn}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
