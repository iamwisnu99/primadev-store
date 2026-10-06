import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: "Missing ID / Key parameter" }, { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database offline" }, { status: 500 });
  }

  try {
    const snap = await db.ref(`licenses/${id}`).once('value');
    if (!snap.exists()) {
      return NextResponse.json({ error: "Lisensi tidak ditemukan" }, { status: 404 });
    }

    const data = snap.val();
    const resolvedAppId = data.appId || data.app_id || (
      data.appName?.toLowerCase().includes('struk') ? 'spbu-struk' :
      data.appName?.toLowerCase().includes('kasir') ? 'kasir_q' :
      data.appName?.toLowerCase().includes('direct') ? 'whatsapp_direct' : 'spbu-struk'
    );

    let price = null;
    if (resolvedAppId) {
      try {
        const prodSnap = await db.ref(`products/${resolvedAppId}`).once('value');
        if (prodSnap.exists()) {
          const prod = prodSnap.val();
          price = prod?.price || null;
        }
      } catch (e) {
        console.error("Failed to load product price for license:", e);
      }
    }

    // Standard fallback if product price is not configured
    if (!price) {
      if (resolvedAppId === 'kasir_q') {
        price = { monthly: 59000, yearly: 1699000 };
      } else if (resolvedAppId === 'whatsapp_direct') {
        price = { monthly: 29000, yearly: 290000 };
      } else {
        price = { monthly: 39000, yearly: 599000 };
      }
    }

    return NextResponse.json({
      key: data.key,
      appName: data.appName,
      appId: resolvedAppId,
      name: data.name,
      email: data.email,
      status: data.status,
      type: data.type,
      expiryDate: data.expiryDate,
      createdAt: data.createdAt,
      price
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
