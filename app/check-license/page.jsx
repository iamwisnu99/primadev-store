"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

export default function CheckLicensePage() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCheck = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);

    if (!key.trim()) {
      setErrorMsg("Masukkan License Key yang ingin diperiksa.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/licenses?id=${key.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Lisensi tidak ditemukan.");
      }
      setResult(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-wrapper">
      <div className="container" style={{ maxWidth: '680px' }}>
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '8px' }}>Cek Status & Masa Aktif Lisensi</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>
            Periksa status keaslian, aplikasi terdaftar, dan sisa masa aktif lisensi software Anda.
          </p>
        </div>

        <div className="form-card">
          <form onSubmit={handleCheck}>
            <div className="form-group">
              <label className="form-label">Masukkan License Key</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  required
                  placeholder="PRIMA-XXXX-XXXX-XXXX"
                  className="form-input"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  style={{ fontFamily: 'monospace', letterSpacing: '1px' }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ padding: '0 24px' }}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                  <span>Periksa</span>
                </button>
              </div>
            </div>
          </form>

          {errorMsg && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
                <CheckCircle2 size={20} />
                <span>Lisensi Terdaftar & Sah</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Aplikasi</span>
                  <strong>{result.appName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Pemilik Terdaftar</span>
                  <strong>{result.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Status Lisensi</span>
                  <strong style={{ color: '#22c55e' }}>{result.status?.toUpperCase()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Masa Berlaku</span>
                  <strong>{result.expiryDate || 'Seumur Hidup (Lifetime)'}</strong>
                </div>
              </div>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link href="/renew" className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                  <RefreshCw size={15} />
                  <span>Perpanjang Lisensi Ini</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
