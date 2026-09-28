"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export default function Toast({
  message,
  show,
  onClose,
  position = "top-right",
  type = "warning",
  duration = 4000
}) {
  const [progress, setProgress] = useState(100);

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
      color: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.25)",
      bgBadge: "rgba(245, 158, 11, 0.15)",
      border: "rgba(245, 158, 11, 0.5)",
      icon: <AlertTriangle size={19} color="#f59e0b" style={{ flexShrink: 0 }} />
    },
    error: {
      color: "#ef4444",
      glow: "rgba(239, 68, 68, 0.25)",
      bgBadge: "rgba(239, 68, 68, 0.15)",
      border: "rgba(239, 68, 68, 0.5)",
      icon: <XCircle size={19} color="#ef4444" style={{ flexShrink: 0 }} />
    },
    success: {
      color: "#10b981",
      glow: "rgba(16, 185, 129, 0.25)",
      bgBadge: "rgba(16, 185, 129, 0.15)",
      border: "rgba(16, 185, 129, 0.5)",
      icon: <CheckCircle2 size={19} color="#10b981" style={{ flexShrink: 0 }} />
    },
    info: {
      color: "#036efd",
      glow: "rgba(3, 110, 253, 0.25)",
      bgBadge: "rgba(3, 110, 253, 0.15)",
      border: "rgba(3, 110, 253, 0.5)",
      icon: <Info size={19} color="#036efd" style={{ flexShrink: 0 }} />
    }
  }[type] || {
    color: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.25)",
    bgBadge: "rgba(245, 158, 11, 0.15)",
    border: "rgba(245, 158, 11, 0.5)",
    icon: <AlertTriangle size={19} color="#f59e0b" style={{ flexShrink: 0 }} />
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      className="custom-toast-notification"
      style={{
        position: "fixed",
        top: isTopRight ? "24px" : "auto",
        bottom: isTopRight ? "auto" : "24px",
        right: "24px",
        background: "#0a101d",
        border: "1px solid " + config.border,
        borderRadius: "12px",
        color: "#ffffff",
        padding: "14px 18px 16px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        boxShadow: "0 16px 36px rgba(0, 0, 0, 0.65), 0 0 20px " + config.glow,
        zIndex: 999999,
        maxWidth: "430px",
        minWidth: "300px",
        animation: isTopRight ? "toastSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)" : "fadeIn 0.25s ease-in-out",
        backdropFilter: "blur(12px)",
        overflow: "hidden"
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        background: config.bgBadge,
        flexShrink: 0
      }}>
        {config.icon}
      </div>

      <div style={{ flex: 1, fontSize: "13.5px", fontWeight: 600, lineHeight: 1.45, color: "#f1f5f9" }}>
        {message}
      </div>

      {onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Tutup notifikasi"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "none",
            color: "rgba(255, 255, 255, 0.65)",
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
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.65)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
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
          boxShadow: "0 0 8px " + config.color,
          transition: "width 0.03s linear"
        }}
      />
    </aside>
  );
}
