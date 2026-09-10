import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebaseAdmin';

export async function POST(req) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ valid: false, error: "Database offline" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { licenseKey, appId, deviceId } = body;

    if (!licenseKey) {
      return NextResponse.json({ valid: false, message: "License key wajib disertakan" }, { status: 400 });
    }

    const licSnap = await db.ref(`licenses/${licenseKey}`).once('value');
    if (!licSnap.exists()) {
      return NextResponse.json({ valid: false, message: "Lisensi tidak ditemukan di sistem" }, { status: 404 });
    }

    const lic = licSnap.val();

    if (lic.status !== 'active') {
      return NextResponse.json({ valid: false, message: "Status lisensi tidak aktif / dibekukan" }, { status: 403 });
    }

    // Check App ID match if provided
    if (appId && lic.appId && lic.appId !== appId) {
      return NextResponse.json({ valid: false, message: "Lisensi ini tidak cocok untuk aplikasi ini" }, { status: 400 });
    }

    // Check Expiration
    if (lic.expiryDate) {
      const exp = new Date(lic.expiryDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (exp < now) {
        return NextResponse.json({
          valid: false,
          expired: true,
          message: "Masa aktif lisensi telah habis. Silakan perpanjang di store.primadev.id/renew",
          expiryDate: lic.expiryDate
        }, { status: 403 });
      }
    }

    // Device binding logic
    if (deviceId) {
      if (!lic.deviceId) {
        await db.ref(`licenses/${licenseKey}`).update({
          deviceId,
          lastValidatedAt: Date.now()
        });
      } else if (lic.deviceId !== deviceId) {
        return NextResponse.json({
          valid: false,
          message: "Lisensi telah terikat pada perangkat lain. Hubungi support untuk reset perangkat."
        }, { status: 403 });
      }
    }

    await db.ref(`licenses/${licenseKey}`).update({
      lastValidatedAt: Date.now()
    });

    return NextResponse.json({
      valid: true,
      message: "Lisensi aktif dan terverifikasi",
      license: {
        key: lic.key,
        name: lic.name,
        appName: lic.appName,
        type: lic.type,
        expiryDate: lic.expiryDate
      }
    });

  } catch (error) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
