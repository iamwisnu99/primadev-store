import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getAdminIssuedTemplate, getRenewalTemplate } from '@/lib/emailTemplate';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      key,
      licenseKey,
      appName,
      appId,
      type,
      expiryDate,
      price,
      paymentMethod,
      transactionId,
      orderId,
      isRenewal,
      status
    } = body;

    const targetEmail = (email || '').trim();
    const targetKey = (key || licenseKey || '').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: "Alamat email tujuan tidak valid." },
        { status: 400 }
      );
    }

    if (!targetKey) {
      return NextResponse.json(
        { success: false, message: "License key wajib disertakan." },
        { status: 400 }
      );
    }

    const emailUser = process.env.EMAIL_USER || "admin.primadev@gmail.com";
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass) {
      console.warn("[SEND-LICENSE-EMAIL] EMAIL_PASS belum diset di server.");
      return NextResponse.json(
        { success: false, message: "Konfigurasi SMTP server belum diset (EMAIL_PASS)." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass.replace(/\s+/g, ""),
      }
    });

    const templateData = {
      name: (name || 'Pelanggan').trim(),
      email: targetEmail,
      key: targetKey,
      licenseKey: targetKey,
      appName: appName || 'Aplikasi Primadev',
      appId: appId || '',
      type: type || 'monthly',
      expiryDate: expiryDate || 'Seumur Hidup',
      price: price || 0,
      paymentMethod: paymentMethod || 'Transfer Bank / Manual',
      transactionId: transactionId || orderId || `MANUAL-${Date.now()}`,
      status: status || 'active',
      logoUrl: 'https://store.primadev.id/primadev_light.png'
    };

    const isRenewalBool = Boolean(isRenewal);
    const html = isRenewalBool
      ? getRenewalTemplate(templateData)
      : getAdminIssuedTemplate(templateData);

    const subject = isRenewalBool
      ? `Perpanjangan Lisensi ${templateData.appName} Berhasil`
      : `Aktivasi Lisensi ${templateData.appName} (${templateData.type.toUpperCase()}) - Primadev`;

    await transporter.sendMail({
      from: `"Primadev Digital Technology" <${emailUser}>`,
      to: targetEmail,
      subject,
      html
    });

    return NextResponse.json({
      success: true,
      message: `Email lisensi berhasil dikirim ke ${targetEmail}`,
      key: targetKey
    });

  } catch (err) {
    console.error("[SEND-LICENSE-EMAIL ERROR]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal mengirim email lisensi." },
      { status: 500 }
    );
  }
}
