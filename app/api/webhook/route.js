import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getDb } from '@/lib/firebaseAdmin';
import { getPremiumTemplate, getRenewalTemplate } from '@/lib/emailTemplate';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `PRIMA-${seg()}-${seg()}-${seg()}`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status
    } = body;

    if (!order_id || !signature_key) {
      return NextResponse.json({ error: "Payload tidak lengkap" }, { status: 400 });
    }

    // SHA512 Signature verification
    const expectedSignature = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY)
      .digest('hex');

    if (expectedSignature !== signature_key) {
      console.error("[WEBHOOK SECURITY]: Signature Midtrans tidak cocok untuk order:", order_id);
      return NextResponse.json({ error: "Invalid Signature" }, { status: 403 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database offline" }, { status: 500 });
    }

    const trxSnap = await db.ref(`transactions/${order_id}`).once('value');
    if (!trxSnap.exists()) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    const trx = trxSnap.val();

    // Idempotency: if already success, do not recreate license
    if (trx.status === 'success') {
      return NextResponse.json({ status: "Already processed" }, { status: 200 });
    }

    const ts = (transaction_status || '').toLowerCase();
    const fs = (fraud_status || '').toLowerCase();

    // ── Handle non-paid terminal statuses — sync to DB ────────────────────────
    if (ts === 'expire') {
      await db.ref(`transactions/${order_id}`).update({ status: 'expired', updatedAt: Date.now() });
      return NextResponse.json({ status: "expired" });
    }
    if (ts === 'cancel') {
      await db.ref(`transactions/${order_id}`).update({ status: 'cancelled', updatedAt: Date.now() });
      return NextResponse.json({ status: "cancelled" });
    }
    if (fs === 'deny' || ts === 'deny') {
      await db.ref(`transactions/${order_id}`).update({ status: 'fraud_denied', updatedAt: Date.now() });
      return NextResponse.json({ status: "fraud_denied" });
    }

    // ── STRICT: verify gross_amount from payload matches DB ───────────────────
    const grossFromWebhook = Math.floor(Number(gross_amount || 0));
    const grossFromDb = Math.floor(Number(trx.amount || 0));
    if (grossFromWebhook !== grossFromDb) {
      console.error(`[WEBHOOK SECURITY]: Amount mismatch for ${order_id}: webhook=${grossFromWebhook}, db=${grossFromDb}`);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    const isPaid = (ts === 'settlement' || (ts === 'capture' && fs === 'accept'));

    if (!isPaid) {
      await db.ref(`transactions/${order_id}`).update({
        status: ts,
        updatedAt: Date.now()
      });
      return NextResponse.json({ status: "Status updated to " + ts });
    }

    // ── ATOMIC LOCK: prevent double-fulfillment with polling endpoint ──────────
    let alreadyProcessed = false;
    await db.ref(`transactions/${order_id}/status`).transaction((currentStatus) => {
      if (currentStatus === 'pending' || currentStatus === null) {
        return 'processing'; // claim atomically
      }
      alreadyProcessed = true;
      return undefined; // abort — do not write
    });

    if (alreadyProcessed) {
      return NextResponse.json({ status: "Already processing or processed" }, { status: 200 });
    }

    // Process Renewal
    if (trx.orderType === 'RENEWAL') {
      const targetKey = trx.targetLicenseKey;
      const licRef = db.ref(`licenses/${targetKey}`);
      const licSnap = await licRef.once('value');

      if (licSnap.exists()) {
        const currentData = licSnap.val();
        const now = new Date();
        let baseDate = currentData.expiryDate ? new Date(currentData.expiryDate) : now;
        if (isNaN(baseDate.getTime()) || baseDate < now) baseDate = now;

        const newExpiry = new Date(baseDate);
        if (trx.duration === 'yearly') newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        else newExpiry.setMonth(newExpiry.getMonth() + 1);

        const expiryString = newExpiry.toISOString().split('T')[0];
        await licRef.update({
          status: 'active',
          expiryDate: expiryString,
          lastRenewalDate: Date.now(),
          lastTransactionId: order_id
        });

        await db.ref(`transactions/${order_id}`).update({
          status: 'success',
          targetLicenseKey: targetKey,
          updatedAt: Date.now()
        });

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          try {
            await transporter.sendMail({
              from: `"Primadev Digital Technology" <${process.env.EMAIL_USER}>`,
              to: currentData.email || trx.customerEmail,
              subject: `Perpanjangan Lisensi ${currentData.appName} Berhasil`,
              html: getRenewalTemplate({
                name: currentData.name,
                key: targetKey,
                appName: currentData.appName,
                type: trx.duration,
                expiryDate: expiryString,
                transactionId: order_id
              })
            });
          } catch (e) {}
        }

        return NextResponse.json({ status: "OK", key: targetKey });
      }
    }

    // Process New License
    const newKey = generateLicenseKey();
    const expiry = new Date();
    if (trx.duration === 'monthly') expiry.setMonth(expiry.getMonth() + 1);
    else if (trx.duration === 'yearly') expiry.setFullYear(expiry.getFullYear() + 1);
    else expiry.setFullYear(expiry.getFullYear() + 100);

    const expiryString = expiry.toISOString().split('T')[0];

    const newLicense = {
      key: newKey,
      status: 'active',
      type: trx.duration || 'monthly',
      appName: trx.appName || 'Aplikasi',
      appId: trx.appId || '',
      price: trx.amount || 0,
      name: trx.customerName || 'Pelanggan',
      email: trx.customerEmail || '',
      phone: trx.customerPhone || '',
      expiryDate: expiryString,
      paymentMethod: trx.paymentMethod || 'Midtrans',
      transactionId: order_id,
      createdAt: Date.now()
    };

    await db.ref(`licenses/${newKey}`).set(newLicense);
    await db.ref(`transactions/${order_id}`).update({
      status: 'success',
      licenseKey: newKey,
      updatedAt: Date.now()
    });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail({
          from: `"Primadev Digital Technology" <${process.env.EMAIL_USER}>`,
          to: newLicense.email,
          subject: `Pesanan Selesai: Lisensi ${newLicense.appName} (${(newLicense.type || '').toUpperCase()})`,
          html: getPremiumTemplate(newLicense)
        });
      } catch (e) {}
    }

    return NextResponse.json({ status: "OK", key: newKey });
  } catch (error) {
    console.error("[WEBHOOK ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
