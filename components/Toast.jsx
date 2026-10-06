"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function Toast({
  message,
  show,
  onClose,
  position = "top-right",
  type = "warning",
  duration = 4000
}) {
  const [progress, setProgress] = useState(100);
  
  let isLight = false;
  try {
    const themeCtx = useTheme();
    if (themeCtx?.theme === "light") {
      isLight = true;
    }
  } catch {
    if (typeof document !== "undefined") {
      isLight = document.documentElement.classList.contains("light") || 
                document.documentElement.getAttribute("data-theme") === "light";
    }
  }

  useEffect(() => {
    if (!show) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        if (onClose) onClose();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [show, onClose, duration]);

  if (!show) return null;

  const isTopRight = position === "top-right";

  const config = {
    warning: {
      color: isLight ? "#d97706" : "#f59e0b",
      glow: isLight ? "rgba(217, 119, 6, 0.2)" : "rgba(245, 158, 11, 0.3)",
      bgBadge: isLight ? "rgba(245, 158, 11, 0.12)" : "rgba(245, 158, 11, 0.16)",
      border: isLight ? "rgba(245, 158, 11, 0.45)" : "rgba(245, 158, 11, 0.5)",
      icon: <AlertTriangle size={20} color={isLight ? "#d97706" : "#f59e0b"} className="toast-icon-bounce" style={{ flexShrink: 0 }} />
    },
    error: {
      color: isLight ? "#dc2626" : "#ef4444",
      glow: isLight ? "rgba(220, 38, 38, 0.2)" : "rgba(239, 68, 68, 0.3)",
      bgBadge: isLight ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.16)",
      border: isLight ? "rgba(239, 68, 68, 0.4)" : "rgba(239, 68, 68, 0.5)",
      icon: <XCircle size={20} color={isLight ? "#dc2626" : "#ef4444"} className="toast-icon-bounce" style={{ flexShrink: 0 }} />
    },
    success: {
      color: isLight ? "#059669" : "#10b981",
      glow: isLight ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.3)",
      bgBadge: isLight ? "rgba(16, 185, 129, 0.12)" : "rgba(16, 185, 129, 0.16)",
      border: isLight ? "rgba(16, 185, 129, 0.45)" : "rgba(16, 185, 129, 0.5)",
      icon: <CheckCircle2 size={20} color={isLight ? "#059669" : "#10b981"} className="toast-icon-bounce" style={{ flexShrink: 0 }} />
    },
    info: {
      color: isLight ? "#0284c7" : "#036efd",
      glow: isLight ? "rgba(3, 110, 253, 0.2)" : "rgba(3, 110, 253, 0.3)",
      bgBadge: isLight ? "rgba(3, 110, 253, 0.1)" : "rgba(3, 110, 253, 0.16)",
      border: isLight ? "rgba(3, 110, 253, 0.4)" : "rgba(3, 110, 253, 0.5)",
      icon: <Info size={20} color={isLight ? "#0284c7" : "#036efd"} className="toast-icon-bounce" style={{ flexShrink: 0 }} />
    }
  }[type] || {
    color: isLight ? "#d97706" : "#f59e0b",
    glow: isLight ? "rgba(217, 119, 6, 0.2)" : "rgba(245, 158, 11, 0.3)",
    bgBadge: isLight ? "rgba(245, 158, 11, 0.12)" : "rgba(245, 158, 11, 0.16)",
    border: isLight ? "rgba(245, 158, 11, 0.45)" : "rgba(245, 158, 11, 0.5)",
    icon: <AlertTriangle size={20} color={isLight ? "#d97706" : "#f59e0b"} className="toast-icon-bounce" style={{ flexShrink: 0 }} />
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`custom-toast-notification ${isLight ? 'toast-light' : 'toast-dark'}`}
      style={{
        position: "fixed",
        top: isTopRight ? "24px" : "auto",
        bottom: isTopRight ? "auto" : "24px",
        right: "24px",
        background: isLight ? "#ffffff" : "#0a101d",
        border: `1px solid ${config.border}`,
        borderRadius: "12px",
        color: isLight ? "#0f172a" : "#ffffff",
        padding: "14px 18px 16px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        boxShadow: isLight
          ? `0 16px 36px rgba(15, 23, 42, 0.14), 0 0 18px ${config.glow}`
          : `0 16px 36px rgba(0, 0, 0, 0.65), 0 0 20px ${config.glow}`,
        zIndex: 999999,
        maxWidth: "440px",
        minWidth: "300px",
        animation: isTopRight ? "toastSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)" : "fadeIn 0.25s ease-in-out",
        backdropFilter: isLight ? "blur(16px)" : "blur(12px)",
        WebkitBackdropFilter: isLight ? "blur(16px)" : "blur(12px)",
        overflow: "hidden"
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "8px",
        background: config.bgBadge,
        flexShrink: 0
      }}>
        {config.icon}
      </div>

      <div style={{
        flex: 1,
        fontSize: "13.5px",
        fontWeight: 600,
        lineHeight: 1.45,
        color: isLight ? "#0f172a" : "#f1f5f9"
      }}>
        {message}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Tutup notifikasi"
          style={{
            background: isLight ? "rgba(15, 23, 42, 0.05)" : "rgba(255, 255, 255, 0.05)",
            border: "none",
            color: isLight ? "#64748b" : "rgba(255, 255, 255, 0.65)",
            cursor: "pointer",
            padding: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            transition: "all 0.2s",
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isLight ? "#0f172a" : "#ffffff";
            e.currentTarget.style.background = isLight ? "rgba(15, 23, 42, 0.12)" : "rgba(255, 255, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isLight ? "#64748b" : "rgba(255, 255, 255, 0.65)";
            e.currentTarget.style.background = isLight ? "rgba(15, 23, 42, 0.05)" : "rgba(255, 255, 255, 0.05)";
          }}
        >
          <X size={15} />
        </button>
      )}

      {/* Progress timer bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: progress + "%",
          height: "3px",
          background: config.color,
          boxShadow: `0 0 8px ${config.color}`,
          transition: "width 0.03s linear"
        }}
      />
    </aside>
  );
}
