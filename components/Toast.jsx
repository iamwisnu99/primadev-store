"use client";

import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export default function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: '#070d17',
      border: '1px solid #036EFD',
      color: '#ffffff',
      padding: '12px 20px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-in-out'
    }}>
      <CheckCircle2 size={18} color="#036EFD" />
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{message}</span>
    </div>
  );
}
