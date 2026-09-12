import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req) {
  try {
    const { name, email, phone, licenseKey, topic, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: "Nama, email, dan pesan wajib diisi." },
        { status: 400 }
      );
    }

    const emailUser = process.env.EMAIL_USER || "admin.primadev@gmail.com";
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass) {
      return NextResponse.json(
        { success: false, message: "Konfigurasi SMTP email belum diset di server." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass.replace(/\s+/g, ""),
      },
    });

    const topicLabels = {
      aktivasi: "Kendala Aktivasi License Key",
      pembayaran: "Konfirmasi & Status Pembayaran",
      perpanjangan: "Pertanyaan Perpanjangan Lisensi",
      bug: "Laporan Kendala Teknis / Bug Software",
      lainnya: "Pertanyaan & Bantuan Lainnya"
    };
    const topicLabel = topicLabels[topic] || topic || "Bantuan Umum";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://store.primadev.id";
    const logoPath = join(process.cwd(), 'public', 'primadev_light.png');
    const hasLogo = existsSync(logoPath);
    const logoUrl = hasLogo ? 'cid:primadev_light_logo' : `${siteUrl}/primadev_light.png`;
    const attachments = hasLogo ? [{
      filename: 'primadev_light.png',
      path: logoPath,
      cid: 'primadev_light_logo'
    }] : [];

    // 1. Email to Customer (Confirmation)
    const userMailOptions = {
      from: `"Primadev Support" <${emailUser}>`,
      to: email,
      subject: "Konfirmasi Tiket Bantuan - Primadev Store",
      attachments,
      html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Konfirmasi Permintaan Bantuan</title>
</head>
<body style="margin:0;padding:0;background-color:#020509;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:32px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#070d17;border:1px solid rgba(255,255,255,0.1);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:32px 24px 20px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.08);">
              <img src="${logoUrl}" alt="Primadev Digital Technology" width="160" style="display:inline-block;margin-bottom:12px;max-width:160px;height:auto;border:0;outline:none;text-decoration:none;" />
              <h2 style="color:#ffffff;font-size:20px;margin:0;">Pesan Bantuan Anda Telah Kami Terima</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;">
              <p style="margin:0 0 16px 0;color:#f1f5f9;">Halo <strong>${name}</strong>,</p>
              <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px 0;">
                Terima kasih telah menghubungi Customer Support <strong>Primadev Store</strong>. Laporan dan pertanyaan Anda telah tercatat di sistem kami dengan rincian berikut:
              </p>

              <table width="100%" style="background-color:#0c1424;border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:16px;margin-bottom:24px;font-size:13.5px;">
                <tr>
                  <td style="padding:6px 0;color:#94a3b8;width:130px;">Topik Bantuan:</td>
                  <td style="padding:6px 0;color:#036EFD;font-weight:700;">${topicLabel}</td>
                </tr>
                ${licenseKey ? `
                <tr>
                  <td style="padding:6px 0;color:#94a3b8;">License Key:</td>
                  <td style="padding:6px 0;color:#ffffff;font-family:monospace;font-weight:700;">${licenseKey}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:6px 0;color:#94a3b8;">Kontak WhatsApp:</td>
                  <td style="padding:6px 0;color:#ffffff;">${phone || '-'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#94a3b8;vertical-align:top;">Rincian Pesan:</td>
                  <td style="padding:6px 0;color:#cbd5e1;white-space:pre-wrap;">${message}</td>
                </tr>
              </table>

              <div style="background:rgba(26,109,255,0.15);border-left:3px solid #1a6dff;padding:12px 16px;border-radius:6px;font-size:13px;color:#bfdbfe;margin-bottom:24px;">
                Tim teknis Primadev akan meninjau kendala Anda dan merespon kembali dalam kurun waktu <strong>1x24 jam kerja</strong>.
              </div>

              <div style="text-align:center;">
                <a href="https://wa.me/6283829520561" target="_blank" style="display:inline-block;background:#25d366;color:#ffffff;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:13.5px;">
                  Hubungi Langsung via WhatsApp
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;text-align:center;font-size:12px;color:#64748b;border-top:1px solid rgba(255,255,255,0.08);">
              &copy; ${new Date().getFullYear()} Primadev Digital Technology. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    };

    // 2. Email to Admin
    const adminMailOptions = {
      from: `"Primadev Store Support Form" <${emailUser}>`,
      to: emailUser,
      replyTo: email,
      subject: `[TIKET BANTUAN] ${name} - ${topicLabel}`,
      html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#050810;color:#e2e8f0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#0b1120;border:1px solid #1e293b;border-radius:12px;padding:24px;">
    <h3 style="color:#036EFD;margin-top:0;">Tiket Bantuan Baru (Store)</h3>
    <table style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#94a3b8;width:120px;">Nama:</td><td style="color:#ffffff;font-weight:bold;">${name}</td></tr>
      <tr><td style="padding:6px 0;color:#94a3b8;">Email:</td><td><a href="mailto:${email}" style="color:#38bdf8;">${email}</a></td></tr>
      <tr><td style="padding:6px 0;color:#94a3b8;">WhatsApp:</td><td><a href="https://wa.me/${phone ? phone.replace(/[^0-9]/g, '') : ''}" style="color:#22c55e;">${phone || '-'}</a></td></tr>
      <tr><td style="padding:6px 0;color:#94a3b8;">License Key:</td><td style="font-family:monospace;color:#036EFD;">${licenseKey || '-'}</td></tr>
      <tr><td style="padding:6px 0;color:#94a3b8;">Topik:</td><td style="color:#ffffff;font-weight:bold;">${topicLabel}</td></tr>
    </table>
    <div style="background:#060a14;padding:14px;border-radius:8px;margin-top:16px;border:1px solid #1e293b;">
      <strong style="color:#94a3b8;font-size:12px;text-transform:uppercase;">Isi Pesan:</strong>
      <p style="margin:6px 0 0 0;white-space:pre-wrap;color:#f1f5f9;font-size:13.5px;">${message}</p>
    </div>
    <div style="margin-top:20px;text-align:center;">
      <a href="mailto:${email}" style="display:inline-block;background:#1a6dff;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px;margin-right:10px;">Balas Email</a>
      ${phone ? `<a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}" target="_blank" style="display:inline-block;background:#25d366;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px;">Chat WhatsApp</a>` : ''}
    </div>
  </div>
</body>
</html>
      `
    };

    await Promise.all([
      transporter.sendMail(userMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);

    return NextResponse.json({
      success: true,
      message: "Pesan bantuan berhasil dikirim."
    });

  } catch (err) {
    console.error("[SUPPORT EMAIL ERROR]:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Gagal mengirim pesan." },
      { status: 500 }
    );
  }
}
