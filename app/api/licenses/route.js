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
    return NextResponse.json({
      key: data.key,
      appName: data.appName,
      appId: data.appId,
      name: data.name,
      email: data.email,
      status: data.status,
      type: data.type,
      expiryDate: data.expiryDate,
      createdAt: data.createdAt
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
