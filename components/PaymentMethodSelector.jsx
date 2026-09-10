"use client";

import { useState } from "react";
import { QrCode, Building2, Wallet, ChevronRight } from "lucide-react";

const PAYMENT_GROUPS = [
  {
    id: "qris",
    type: "direct",
    name: "QRIS",
    subtitle: "Semua Bank & E-Wallet",
    icon: <QrCode size={18} />,
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg"
  },
  {
    id: "va",
    type: "accordion",
    name: "Virtual Account (Bank Transfer)",
    icon: <Building2 size={18} />,
    items: [
      {
        id: "bca",
        name: "BCA Virtual Account",
        tag: "Verifikasi Otomatis",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg"
      },
      {
        id: "mandiri",
        name: "Mandiri Virtual Account",
        tag: "Biller Code: 70012 & Bill Key",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg"
      },
      {
        id: "bni",
        name: "BNI Virtual Account",
        tag: "Verifikasi Otomatis",
        logo: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Bank_Negara_Indonesia_logo_%282004%29.svg"
      },
      {
        id: "bri",
        name: "BRI Virtual Account",
        tag: "BRIVA Otomatis",
        logo: "https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg"
      },
      {
        id: "permata",
        name: "Permata Virtual Account",
        tag: "Verifikasi Otomatis",
        logo: "https://upload.wikimedia.org/wikipedia/id/4/48/PermataBank_logo.svg"
      },
      {
        id: "cimb",
        name: "CIMB Niaga Virtual Account",
        tag: "Verifikasi Otomatis",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/38/CIMB_Niaga_logo.svg"
      }
    ]
  },
  {
    id: "ewallet",
    type: "accordion",
    name: "E-Wallet",
    icon: <Wallet size={18} />,
    items: [
      {
        id: "gopay",
        name: "GoPay",
        tag: "Deeplink / QR",
        logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg"
      },
      {
        id: "shopeepay",
        name: "ShopeePay",
        tag: "Deeplink Shopee App",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/ShopeePay.svg"
      },
      {
        id: "dana",
        name: "DANA",
        tag: "Deeplink DANA App",
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg"
      },
      {
        id: "ovo",
        name: "OVO",
        tag: "Push Notification HP",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg"
      }
    ]
  }
];

export default function PaymentMethodSelector({ selectedMethod, onSelect }) {
  // Determine initial open group if a sub-method is already selected
  const getInitialOpenGroup = () => {
    if (["bca", "mandiri", "bni", "bri", "permata", "cimb"].includes(selectedMethod)) return "va";
    if (["gopay", "shopeepay", "dana", "ovo"].includes(selectedMethod)) return "ewallet";
    return null;
  };

  const [openGroup, setOpenGroup] = useState(getInitialOpenGroup);

  const handleGroupClick = (group) => {
    if (group.type === "direct") {
      onSelect("qris");
      setOpenGroup(null); // Auto close all accordion dropdowns
    } else {
      // Toggle current accordion: if already open close it, else open it and automatically close other group!
      setOpenGroup((prev) => (prev === group.id ? null : group.id));
    }
  };

  const handleItemClick = (itemId) => {
    onSelect(itemId);
  };

  return (
    <div className="payment-accordion-container">
      {PAYMENT_GROUPS.map((grp) => {
        if (grp.type === "direct") {
          const isSelected = selectedMethod === "qris";
          return (
            <div
              key={grp.id}
              className={`payment-accordion-group direct ${isSelected ? "selected" : ""}`}
              onClick={() => handleGroupClick(grp)}
            >
              <div className="payment-accordion-header">
                <div className="payment-grp-left">
                  <div className="payment-logo-badge">
                    <img src={grp.logo} alt="QRIS" className="pm-logo-img" />
                  </div>
                  <div>
                    <div className="payment-grp-title">{grp.name}</div>
                    <div className="payment-grp-sub">{grp.subtitle}</div>
                  </div>
                </div>
                <div className={`payment-radio ${isSelected ? "checked" : ""}`}>
                  {isSelected && <div className="payment-radio-dot" />}
                </div>
              </div>
            </div>
          );
        }

        const isOpen = openGroup === grp.id;
        const isGroupSelected = grp.items.some((item) => item.id === selectedMethod);

        return (
          <div
            key={grp.id}
            className={`payment-accordion-group ${isOpen ? "open" : ""} ${isGroupSelected ? "has-selected" : ""}`}
          >
            {/* ACCORDION HEADER */}
            <div
              className="payment-accordion-header clickable"
              onClick={() => handleGroupClick(grp)}
            >
              <div className="payment-grp-left">
                <div className="payment-grp-icon">{grp.icon}</div>
                <div className="payment-grp-title">{grp.name}</div>
              </div>
              <ChevronRight
                size={18}
                className={`payment-group-chevron ${isOpen ? "open" : ""}`}
              />
            </div>

            {/* ACCORDION BODY WITH SMOOTH TRANSITION */}
            <div className={`payment-accordion-body ${isOpen ? "expanded" : ""}`}>
              <div className="payment-accordion-content">
                <div className="payment-items-list">
                  {grp.items.map((item) => {
                    const isItemSelected = selectedMethod === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`pm-item ${isItemSelected ? "selected" : ""}`}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <div className="pm-item-left">
                          <div className="pm-logo-box">
                            <img
                              src={item.logo}
                              alt={item.name}
                              className="pm-logo-img"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <div className="pm-item-name">{item.name}</div>
                            <div className="pm-item-tag">{item.tag}</div>
                          </div>
                        </div>
                        <div className={`payment-radio ${isItemSelected ? "checked" : ""}`}>
                          {isItemSelected && <div className="payment-radio-dot" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
