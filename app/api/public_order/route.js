import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getDb } from '@/lib/firebaseAdmin';
import { getPremiumTemplate, getRenewalTemplate } from '@/lib/emailTemplate';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// ─── Security: Allowed payment methods whitelist ──────────────────────────────
const ALLOWED_PAYMENT_METHODS = new Set([
  'qris', 'bca', 'mandiri', 'bni', 'bri', 'permata', 'cimb',
  'gopay', 'shopeepay', 'dana', 'ovo', 'indomaret', 'alfamart'
]);

// ─── Security: appId must be safe chars only (no path traversal) ──────────────
const SAFE_APP_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

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

async function sendEmailDelivery(data, isRenewal = false) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const licenseKey = data.key || data.licenseKey || data.targetLicenseKey || '';
  const templateData = {
    ...data,
    key: licenseKey,
    licenseKey,
    logoUrl: 'https://store.primadev.id/primadev_light.png'
  };

  const html = isRenewal ? getRenewalTemplate(templateData) : getPremiumTemplate(templateData);
  const subject = isRenewal
    ? `Perpanjangan Lisensi ${data.appName} Berhasil`
    : `Pesanan Selesai: Lisensi ${data.appName} (${(data.type || '').toUpperCase()})`;

  try {
    await transporter.sendMail({
      from: `"Primadev Digital Technology" <${process.env.EMAIL_USER}>`,
      to: data.email,
      subject,
      html
    });
  } catch (err) {
    console.error("[EMAIL ERROR]:", err.message);
  }
}

async function chargeMidtrans(payload) {
  if (!MIDTRANS_SERVER_KEY) {
    throw new Error("MIDTRANS_SERVER_KEY belum dikonfigurasi di server.");
  }

  const baseUrl = IS_PRODUCTION
    ? 'https://api.midtrans.com/v2/charge'
    : 'https://api.sandbox.midtrans.com/v2/charge';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://store.primadev.id";
  const webhookUrl = `${siteUrl}/api/webhook`;

  const authHeader = 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');
  const headers = {
    'Authorization': authHeader,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Override-Notification': webhookUrl
  };

  const { orderId, grossAmount, buyerName, buyerEmail, buyerPhone, paymentMethod, productName, appId, finishUrl } = payload;

  const transaction_details = {
    order_id: orderId,
    gross_amount: Math.floor(Number(grossAmount))
  };

  const nameParts = (buyerName || 'Pelanggan').trim().split(' ');
  const customer_details = {
    first_name: nameParts[0] || 'Pelanggan',
    last_name: nameParts.slice(1).join(' ') || '',
    email: buyerEmail || 'customer@primadev.id',
    phone: buyerPhone || ''
  };

  const item_details = [{
    id: appId || 'primadev-license',
    price: Math.floor(Number(grossAmount)),
    quantity: 1,
    name: (productName || 'Lisensi Software').substring(0, 50)
  }];

  const execCharge = async (body, label) => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    const data = await res.json();
    const ok = ['200', '201'].includes(String(data.status_code));
    if (!ok) {
      const errMsg = data.status_message || (Array.isArray(data.error_messages) ? data.error_messages.join(', ') : 'Gagal membuat transaksi.');
      throw new Error(`${label}: ${errMsg}`);
    }
    return data;
  };

  if (['bca', 'bni', 'bri', 'permata', 'cimb'].includes(paymentMethod)) {
    const data = await execCharge({
      payment_type: 'bank_transfer',
      transaction_details,
      customer_details,
      item_details,
      bank_transfer: { bank: paymentMethod }
    }, `VA ${paymentMethod.toUpperCase()}`);

    const vaNumber = data.va_numbers?.[0]?.va_number || data.permata_va_number || '';
    return {
      order_id: orderId,
      gross_amount: grossAmount,
      payment_type: 'bank_transfer',
      va_numbers: [{ bank: paymentMethod, va_number: vaNumber }],
      transaction_status: 'pending'
    };
  }

  if (paymentMethod === 'mandiri') {
    const data = await execCharge({
      payment_type: 'echannel',
      transaction_details,
      customer_details,
      item_details,
      echannel: {
        bill_info1: 'Pembayaran Lisensi',
        bill_info2: (productName || 'Primadev').substring(0, 20)
      }
    }, 'Mandiri Bill');

    return {
      order_id: orderId,
      gross_amount: grossAmount,
      payment_type: 'echannel',
      payment_method: 'mandiri',
      va_numbers: [{ bank: 'mandiri', va_number: data.bill_key || '' }],
      biller_code: data.biller_code || '70012',
      bill_key: data.bill_key || '',
      transaction_status: 'pending'
    };
  }

  if (paymentMethod === 'qris') {
    const data = await execCharge({
      payment_type: 'qris',
      transaction_details,
      customer_details,
      item_details,
      qris: { acquirer: 'gopay' }
    }, 'QRIS');

    const qrString = data.qr_string || '';
    const qrDisplayUrl = qrString
      ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`
      : '';

    return {
      order_id: orderId,
      gross_amount: grossAmount,
      payment_type: 'qris',
      actions: [{ name: 'generate-qr-code', url: qrDisplayUrl }],
      qr_string: qrString,
      transaction_status: 'pending'
    };
  }

  if (paymentMethod === 'gopay') {
    const data = await execCharge({
      payment_type: 'gopay',
      transaction_details,
      customer_details,
      item_details,
      gopay: { enable_callback: true, callback_url: finishUrl }
    }, 'GoPay');

    const actions = data.actions || [];
    const qrAction = actions.find(a => a.name === 'generate-qr-code');
    const deeplink = actions.find(a => a.name === 'deeplink-redirect');

    return {
      order_id: orderId,
      gross_amount: grossAmount,
      payment_type: 'gopay',
      is_redirect_required: true,
      mobile_url: deeplink?.url || '',
      qr_url: qrAction?.url || '',
      actions,
      transaction_status: 'pending'
    };
  }

  if (paymentMethod === 'shopeepay') {
    const data = await execCharge({
      payment_type: 'shopeepay',
      transaction_details,
      customer_details,
      item_details,
      shopeepay: { callback_url: finishUrl }
    }, 'ShopeePay');

    const deeplink = (data.actions || []).find(a => a.name === 'deeplink-redirect');
    return {
      order_id: orderId,
      gross_amount: grossAmount,
      payment_type: 'shopeepay',
      is_redirect_required: true,
      mobile_url: deeplink?.url || '',
      actions: data.actions || [],
      transaction_status: 'pending'
    };
  }

  if (paymentMethod === 'dana') {
    const data = await execCharge({
      payment_type: 'dana',
      transaction_details,
      customer_details,
      item_details,
      dana: { callback_url: finishUrl }
    }, 'DANA');

    const deeplink = (data.actions || []).find(a => a.name === 'deeplink-redirect');
    return {
      order_id: orderId,
      gross_amount: grossAmount,
      payment_type: 'dana',
      is_redirect_required: true,
      mobile_url: deeplink?.url || '',
      actions: data.actions || [],
      transaction_status: 'pending'
    };
  }

  if (paymentMethod === 'ovo') {
    if (!buyerPhone) throw new Error('Nomor WhatsApp / HP wajib diisi untuk OVO.');
    let phone = buyerPhone.trim().replace(/\s|-/g, '');
    if (phone.startsWith('0')) phone = '+62' + phone.substring(1);
    else if (!phone.startsWith('+')) phone = '+62' + phone;

    await execCharge({
      payment_type: 'ovo',
      transaction_details,
      customer_details: { ...customer_details, phone },
      item_details
    }, 'OVO');

    return {
      order_id: orderId,
      gross_amount: grossAmount,
      payment_type: 'ovo',
      mobile_number: phone,
      transaction_status: 'pending'
    };
  }

  if (paymentMethod === 'indomaret' || paymentMethod === 'alfamart') {
    const store = paymentMethod === 'indomaret' ? 'Indomaret' : 'Alfamart';
    const data = await execCharge({
      payment_type: 'cstore',
      transaction_details,
      customer_details,
      item_details,
      cstore: { store, message: 'Pembayaran Lisensi Primadev' }
    }, store);

    return {
      order_id: orderId,
      gross_amount: grossAmount,
      payment_type: 'cstore',
      store: paymentMethod,
      payment_code: data.payment_code || '',
      transaction_status: 'pending'
    };
  }

  throw new Error(`Metode pembayaran "${paymentMethod}" tidak didukung.`);
}

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database tidak terhubung" }, { status: 500 });
  }

  try {
    const [prodSnap, portSnap] = await Promise.all([
      db.ref('products').once('value'),
      db.ref('portfolio').once('value')
    ]);

    const catalog = prodSnap.exists() ? prodSnap.val() : {};
    const portfolio = portSnap.exists() ? portSnap.val() : {};

    // Remove any sensitive internal keys
    for (const key of Object.keys(catalog)) {
      if (catalog[key]) delete catalog[key].source_code;
    }
    for (const key of Object.keys(portfolio)) {
      if (portfolio[key]) delete portfolio[key].source_code;
    }

    // NOTE: midtransClientKey and isProduction are intentionally NOT returned
    // here — they are not needed for catalog browsing and reduce attack surface.
    return NextResponse.json({ catalog, portfolio });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database tidak terhubung" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://store.primadev.id';
    const getFinishUrl = (oid) => `${origin}/waiting-payment?orderId=${encodeURIComponent(oid)}`;

    // 1. CREATE TRANSACTION (Strict server-side validation against Firebase)
    if (action === 'create_transaction') {
      const { appId, duration, buyerName, buyerEmail, buyerPhone, paymentMethod } = body;

      // ── Input Validation ──────────────────────────────────────────────────
      if (!appId || typeof appId !== 'string' || !SAFE_APP_ID_RE.test(appId)) {
        return NextResponse.json({ error: "ID Aplikasi tidak valid" }, { status: 400 });
      }
      if (!['monthly', 'yearly', 'lifetime'].includes(duration)) {
        return NextResponse.json({ error: "Durasi paket tidak valid" }, { status: 400 });
      }
      if (!buyerName || buyerName.trim().length < 2 || buyerName.trim().length > 100) {
        return NextResponse.json({ error: "Nama lengkap wajib diisi (2–100 karakter)" }, { status: 400 });
      }
      if (!buyerEmail || !buyerEmail.includes('@') || buyerEmail.trim().length > 254) {
        return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
      }
      if (!paymentMethod || !ALLOWED_PAYMENT_METHODS.has(paymentMethod.toLowerCase())) {
        return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
      }

      // ── Server-side price lookup from Firebase (NEVER trust client price) ─
      const prodSnap = await db.ref(`products/${appId}`).once('value');
      if (!prodSnap.exists()) {
        return NextResponse.json({ error: "Produk tidak ditemukan di database" }, { status: 404 });
      }

      const product = prodSnap.val();
      if (!product.price || product.price[duration] === undefined || product.price[duration] === null) {
        return NextResponse.json({ error: "Paket durasi tidak tersedia untuk produk ini" }, { status: 400 });
      }

      const verifiedPrice = Math.floor(Number(product.price[duration]));
      if (!Number.isFinite(verifiedPrice) || verifiedPrice <= 0) {
        return NextResponse.json({ error: "Harga produk tidak valid di sistem" }, { status: 400 });
      }

      const orderId = `ORDER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const chargeRes = await chargeMidtrans({
        orderId,
        grossAmount: verifiedPrice,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim().toLowerCase(),
        buyerPhone: (buyerPhone || '').trim(),
        paymentMethod: paymentMethod.toLowerCase(),
        productName: product.name,
        appId,
        finishUrl: getFinishUrl(orderId)
      });

      // Save initial transaction state
      await db.ref(`transactions/${orderId}`).set({
        orderId,
        status: 'pending',
        amount: verifiedPrice,
        customerName: buyerName.trim(),
        customerEmail: buyerEmail.trim().toLowerCase(),
        customerPhone: (buyerPhone || '').trim(),
        productName: product.name,
        appName: product.name,
        appId,
        duration,
        orderType: 'NEW',
        paymentMethod: paymentMethod.toLowerCase(),
        gateway: 'midtrans',
        createdAt: Date.now()
      });

      return NextResponse.json(chargeRes);
    }

    // 2. RENEW TRANSACTION (Strict validation & strict Firebase price lookup)
    if (action === 'renew_transaction') {
      const { licenseKey, duration, buyerName, buyerEmail, buyerPhone, paymentMethod } = body;

      if (!licenseKey || typeof licenseKey !== 'string') {
        return NextResponse.json({ error: "License Key wajib disertakan" }, { status: 400 });
      }
      if (!['monthly', 'yearly'].includes(duration)) {
        return NextResponse.json({ error: "Durasi perpanjangan tidak valid" }, { status: 400 });
      }
      if (!paymentMethod || !ALLOWED_PAYMENT_METHODS.has(paymentMethod.toLowerCase())) {
        return NextResponse.json({ error: "Metode pembayaran tidak valid" }, { status: 400 });
      }

      const licSnap = await db.ref(`licenses/${licenseKey.trim()}`).once('value');
      if (!licSnap.exists()) {
        return NextResponse.json({ error: "Lisensi tidak ditemukan di sistem" }, { status: 404 });
      }

      const license = licSnap.val();
      const appId = license.appId;

      // Validate appId from license is also safe
      if (!appId || !SAFE_APP_ID_RE.test(appId)) {
        return NextResponse.json({ error: "Data lisensi tidak valid (appId)" }, { status: 400 });
      }

      // ── Server-side price from Firebase (STRICT — no hardcoded fallback) ──
      const prodSnap = await db.ref(`products/${appId}`).once('value');
      if (!prodSnap.exists()) {
        return NextResponse.json({ error: "Produk untuk lisensi ini tidak ditemukan di sistem" }, { status: 404 });
      }

      const product = prodSnap.val();
      if (!product.price || product.price[duration] === undefined || product.price[duration] === null) {
        return NextResponse.json({ error: "Paket durasi tidak tersedia untuk produk ini" }, { status: 400 });
      }

      const verifiedPrice = Math.floor(Number(product.price[duration]));
      if (!Number.isFinite(verifiedPrice) || verifiedPrice <= 0) {
        return NextResponse.json({ error: "Harga produk tidak valid di sistem" }, { status: 400 });
      }

      const orderId = `RENEW-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const appName = license.appName || product?.name || 'Lisensi Software';
      const resolvedName = (buyerName || license.name || 'Pelanggan').trim();
      const resolvedEmail = (buyerEmail || license.email || 'customer@primadev.id').trim().toLowerCase();

      const chargeRes = await chargeMidtrans({
        orderId,
        grossAmount: verifiedPrice,
        buyerName: resolvedName,
        buyerEmail: resolvedEmail,
        buyerPhone: (buyerPhone || '').trim(),
        paymentMethod: paymentMethod.toLowerCase(),
        productName: `Perpanjangan ${appName}`,
        appId,
        finishUrl: getFinishUrl(orderId)
      });

      await db.ref(`transactions/${orderId}`).set({
        orderId,
        status: 'pending',
        amount: verifiedPrice,
        customerName: resolvedName,
        customerEmail: resolvedEmail,
        customerPhone: (buyerPhone || '').trim(),
        appName,
        appId,
        duration,
        orderType: 'RENEWAL',
        targetLicenseKey: licenseKey.trim(),
        paymentMethod: paymentMethod.toLowerCase(),
        gateway: 'midtrans',
        createdAt: Date.now()
      });

      return NextResponse.json(chargeRes);
    }

    // 3. VERIFY PAYMENT (Active Polling & Security Enforcement)
    if (action === 'verify_payment') {
      const { orderId } = body;
      if (!orderId || typeof orderId !== 'string') {
        return NextResponse.json({ error: "Parameter orderId tidak ada" }, { status: 400 });
      }

      const trxSnap = await db.ref(`transactions/${orderId}`).once('value');
      if (!trxSnap.exists()) {
        return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
      }

      const trx = trxSnap.val();

      // ── Idempotency: already fulfilled ─────────────────────────────────────
      if (trx.status === 'success') {
        let key = trx.licenseKey || trx.targetLicenseKey || null;

        // If transaction status is success but key was not attached, find from licenses by transactionId
        if (!key) {
          try {
            const licSnap = await db.ref('licenses').orderByChild('transactionId').equalTo(orderId).once('value');
            if (licSnap.exists()) {
              const firstLic = Object.values(licSnap.val())[0];
              if (firstLic && firstLic.key) {
                key = firstLic.key;
                await db.ref(`transactions/${orderId}`).update({ licenseKey: key });
              }
            }
          } catch (err) {
            console.error("[VERIFY LICENSE BACKFILL ERROR]:", err);
          }
        }

        // If STILL no key and it's marked success, generate and save the license now
        if (!key && trx.orderType !== 'RENEWAL') {
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
            transactionId: orderId,
            createdAt: Date.now()
          };
          await db.ref(`licenses/${newKey}`).set(newLicense);
          await db.ref(`transactions/${orderId}`).update({
            licenseKey: newKey,
            updatedAt: Date.now()
          });
          key = newKey;
        }

        return NextResponse.json({
          status: 'success',
          key: key || trx.targetLicenseKey || null,
          isSuccess: true
        });
      }

      // ── Already in a terminal non-success state ─────────────────────────────
      if (['cancelled', 'expired', 'fraud_denied', 'error'].includes(trx.status)) {
        return NextResponse.json({ status: trx.status, isSuccess: false });
      }

      // ── Query Midtrans Status API directly ──────────────────────────────────
      let midtransData = null;
      try {
        const baseUrl = IS_PRODUCTION
          ? 'https://api.midtrans.com/v2'
          : 'https://api.sandbox.midtrans.com/v2';

        const authHeader = 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');
        const mRes = await fetch(`${baseUrl}/${orderId}/status`, {
          headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
        });

        if (mRes.ok) {
          midtransData = await mRes.json();
        }
      } catch (pollErr) {
        console.error("[POLL ERROR]:", pollErr.message);
      }

      if (!midtransData) {
        return NextResponse.json({ status: 'pending', isSuccess: false });
      }

      const ts = (midtransData.transaction_status || '').toLowerCase();
      const fs = (midtransData.fraud_status || '').toLowerCase();
      const grossFromMidtrans = Math.floor(Number(midtransData.gross_amount || 0));
      const grossFromDb = Math.floor(Number(trx.amount));

      // ── Handle terminal non-paid statuses — sync DB so client stops polling ─
      if (ts === 'expire') {
        await db.ref(`transactions/${orderId}`).update({ status: 'expired', updatedAt: Date.now() });
        return NextResponse.json({ status: 'expired', isSuccess: false });
      }
      if (ts === 'cancel') {
        await db.ref(`transactions/${orderId}`).update({ status: 'cancelled', updatedAt: Date.now() });
        return NextResponse.json({ status: 'cancelled', isSuccess: false });
      }
      if (fs === 'deny' || ts === 'deny') {
        await db.ref(`transactions/${orderId}`).update({ status: 'fraud_denied', updatedAt: Date.now() });
        return NextResponse.json({ status: 'fraud_denied', isSuccess: false });
      }

      // ── STRICT payment verification: status + fraud + EXACT amount match ────
      const isPaid = fs !== 'deny'
        && ['capture', 'settlement'].includes(ts)
        && grossFromMidtrans === grossFromDb;

      if (!isPaid) {
        return NextResponse.json({ status: 'pending', isSuccess: false });
      }

      // ── ATOMIC LOCK: prevent double-fulfillment from concurrent requests ─────
      // Atomically change 'pending' → 'processing'. If another request already
      // claimed it, abort and return current state to client.
      let alreadyProcessed = false;
      await db.ref(`transactions/${orderId}/status`).transaction((currentStatus) => {
        if (currentStatus === 'pending' || currentStatus === null) {
          return 'processing'; // claim atomically
        }
        alreadyProcessed = true;
        return undefined; // abort — do not write
      });

      if (alreadyProcessed) {
        const freshSnap = await db.ref(`transactions/${orderId}`).once('value');
        const freshTrx = freshSnap.val();
        if (freshTrx?.status === 'success') {
          let key = freshTrx.licenseKey || freshTrx.targetLicenseKey || null;
          if (!key) {
            try {
              const licSnap = await db.ref('licenses').orderByChild('transactionId').equalTo(orderId).once('value');
              if (licSnap.exists()) {
                const firstLic = Object.values(licSnap.val())[0];
                if (firstLic && firstLic.key) {
                  key = firstLic.key;
                  await db.ref(`transactions/${orderId}`).update({ licenseKey: key });
                }
              }
            } catch (err) {
              console.error("[ALREADY_PROCESSED KEY LOOKUP ERROR]:", err);
            }
          }
          return NextResponse.json({
            status: 'success',
            key: key || freshTrx.targetLicenseKey || null,
            isSuccess: true
          });
        }
        return NextResponse.json({ status: 'pending', isSuccess: false });
      }

      // ── FULFILL RENEWAL ─────────────────────────────────────────────────────
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
            lastTransactionId: orderId
          });

          await db.ref(`transactions/${orderId}`).update({
            status: 'success',
            targetLicenseKey: targetKey,
            updatedAt: Date.now()
          });

          await sendEmailDelivery({
            name: currentData.name || trx.customerName,
            email: currentData.email || trx.customerEmail,
            key: targetKey,
            appName: currentData.appName || trx.appName,
            type: trx.duration,
            expiryDate: expiryString,
            transactionId: orderId
          }, true);

          return NextResponse.json({ status: 'success', key: targetKey, isSuccess: true });
        }

        // Target license deleted — mark transaction as error and release lock
        await db.ref(`transactions/${orderId}`).update({ status: 'error', updatedAt: Date.now() });
        return NextResponse.json({ error: "Lisensi target tidak ditemukan" }, { status: 500 });
      }

      // ── FULFILL NEW LICENSE ──────────────────────────────────────────────────
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
        transactionId: orderId,
        createdAt: Date.now()
      };

      await db.ref(`licenses/${newKey}`).set(newLicense);
      await db.ref(`transactions/${orderId}`).update({
        status: 'success',
        licenseKey: newKey,
        updatedAt: Date.now()
      });

      await sendEmailDelivery(newLicense, false);

      return NextResponse.json({ status: 'success', key: newKey, isSuccess: true });
    }

    // 4. CANCEL TRANSACTION (Sync Cancel to Midtrans Gateway)
    if (action === 'cancel_transaction') {
      const { orderId } = body;
      if (!orderId) {
        return NextResponse.json({ error: "Parameter orderId tidak ada" }, { status: 400 });
      }

      const trxRef = db.ref(`transactions/${orderId}`);
      const trxSnap = await trxRef.once('value');
      if (!trxSnap.exists()) {
        return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });
      }

      const trx = trxSnap.val();
      if (trx.status === 'success') {
        return NextResponse.json({ error: "Transaksi yang sudah berhasil tidak dapat dibatalkan" }, { status: 400 });
      }

      let midtransCancelled = false;
      let midtransStatus = "";

      // Call Midtrans Cancel API to mark status as Cancelled in Midtrans Dashboard
      if (MIDTRANS_SERVER_KEY) {
        try {
          const baseUrl = IS_PRODUCTION
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';

          const authHeader = 'Basic ' + Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');
          const mRes = await fetch(`${baseUrl}/${orderId}/cancel`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          const mData = await mRes.json();
          console.log(`[MIDTRANS CANCEL ${orderId}]:`, mData);
          if (['200', '201'].includes(String(mData.status_code)) || mData.transaction_status === 'cancel') {
            midtransCancelled = true;
            midtransStatus = mData.transaction_status || 'cancel';
          }
        } catch (mErr) {
          console.error("[MIDTRANS CANCEL ERROR]:", mErr.message);
        }
      }

      // Update status in Firebase database
      await trxRef.update({
        status: 'cancelled',
        cancelledAt: Date.now(),
        updatedAt: Date.now()
      });

      return NextResponse.json({
        status: 'cancelled',
        isCancelled: true,
        midtransCancelled,
        message: 'Transaksi berhasil dibatalkan di sistem & Midtrans Gateway'
      });
    }

    return NextResponse.json({ error: "Action tidak dikenal" }, { status: 400 });
  } catch (error) {
    console.error("[SERVER ERROR]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
