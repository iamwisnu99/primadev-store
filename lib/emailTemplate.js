export function getPremiumTemplate(data) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://store.primadev.id";
  const logoUrl = data.logoUrl || `${siteUrl}/primadev_light.png`;
  const invoiceId = encodeURIComponent(data.key || data.transactionId || data.orderId || '');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pembayaran Lisensi Berhasil</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020509; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020509; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #070d17; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; overflow: hidden;">
          <!-- HEADER -->
          <tr>
            <td style="padding: 36px 24px 24px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <img src="${logoUrl}" alt="Primadev Digital Technology" width="160" style="display: inline-block; margin-bottom: 18px; max-width: 160px; height: auto; border: 0; outline: none; text-decoration: none;" />
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  ✓ Pembayaran Berhasil & Terverifikasi
                </span>
              </div>
              <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff !important; line-height: 1.3;">
                Lisensi Resmi Software Anda Siap
              </h2>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #ffffff !important; line-height: 1.5;">
                Halo <strong style="color: #036EFD !important; font-weight: 700;">${data.name}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #cbd5e1 !important; line-height: 1.6;">
                Terima kasih atas pesanan Anda di <strong>Primadev Store</strong>. Pembayaran Anda telah terverifikasi secara otomatis oleh sistem kami dan akses lisensi resmi Anda telah aktif.
              </p>

              <!-- LICENSE KEY BOX -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c1424; border: 2px dashed #036EFD; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <div style="font-size: 11.5px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8 !important; font-weight: 700; margin-bottom: 8px;">
                      LICENSE KEY RESMI ANDA
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 800; color: #036EFD !important; letter-spacing: 2px; word-break: break-all;">
                      ${data.key}
                    </div>
                    <p style="margin: 10px 0 0; font-size: 12px; color: #94a3b8 !important;">
                      Simpan kode ini dengan aman untuk aktivasi di aplikasi software.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- ORDER DETAILS -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; color: #94a3b8 !important;">Aplikasi Software</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; text-align: right; font-weight: 700; color: #ffffff !important;">${data.appName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; color: #94a3b8 !important;">Paket Lisensi</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; text-align: right; font-weight: 700; color: #ffffff !important;">${(data.type || 'Monthly').toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; color: #94a3b8 !important;">Masa Berlaku</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; text-align: right; font-weight: 700; color: #ffffff !important;">${data.expiryDate || 'Seumur Hidup (Lifetime)'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; color: #94a3b8 !important;">Status Pembayaran</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; text-align: right; font-weight: 800; color: #22c55e !important;">LUNAS</td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="${siteUrl}/api/invoice?id=${invoiceId}" target="_blank" style="display: inline-block; background-color: #036EFD !important; color: #ffffff !important; font-weight: 800; padding: 13px 32px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                  Unduh Invoice Resmi (PDF)
                </a>
                <p style="margin-top: 16px; font-size: 12px; color: #64748b !important;">
                  ID Transaksi: ${data.transactionId || data.orderId || '-'}
                </p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 28px; text-align: center; font-size: 12px; color: #64748b !important; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0 0 6px; font-weight: 700; color: #cbd5e1 !important; font-size: 13px;">PRIMADEV DIGITAL TECHNOLOGY</p>
              <p style="margin: 0 0 10px; color: #94a3b8 !important;">SK Kemenkumham: AHU-A104134.AH.01.30.Tahun 2026</p>
              <p style="margin: 0; color: #64748b !important;">&copy; ${new Date().getFullYear()} Primadev Digital Technology. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getRenewalTemplate(data) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://store.primadev.id";
  const logoUrl = data.logoUrl || `${siteUrl}/primadev_light.png`;
  const invoiceId = encodeURIComponent(data.key || data.transactionId || data.orderId || '');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Perpanjangan Lisensi Berhasil</title>
</head>
<body style="margin: 0; padding: 0; background-color: #020509; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020509; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #070d17; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 16px; overflow: hidden;">
          <!-- HEADER -->
          <tr>
            <td style="padding: 36px 24px 24px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <img src="${logoUrl}" alt="Primadev Digital Technology" width="160" style="display: inline-block; margin-bottom: 18px; max-width: 160px; height: auto; border: 0; outline: none; text-decoration: none;" />
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; background: rgba(34, 197, 94, 0.15); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3); padding: 5px 16px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                  ✓ Perpanjangan Berhasil & Aktif
                </span>
              </div>
              <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff !important; line-height: 1.3;">
                Masa Aktif Lisensi Software Diperpanjang
              </h2>
            </td>
          </tr>

          <!-- CONTENT -->
          <tr>
            <td style="padding: 32px 28px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #ffffff !important; line-height: 1.5;">
                Halo <strong style="color: #036EFD !important; font-weight: 700;">${data.name}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #cbd5e1 !important; line-height: 1.6;">
                Masa aktif lisensi untuk software <strong>${data.appName}</strong> telah berhasil diperpanjang hingga <strong style="color: #22c55e !important;">${data.expiryDate}</strong>.
              </p>

              <!-- LICENSE KEY BOX -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c1424; border: 2px dashed #036EFD; border-radius: 12px; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 24px; text-align: center;">
                    <div style="font-size: 11.5px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8 !important; font-weight: 700; margin-bottom: 8px;">
                      LICENSE KEY ANDA
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 800; color: #036EFD !important; letter-spacing: 2px; word-break: break-all;">
                      ${data.key}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- DETAILS -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 28px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; color: #94a3b8 !important;">Aplikasi Software</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; text-align: right; font-weight: 700; color: #ffffff !important;">${data.appName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; color: #94a3b8 !important;">Durasi Tambahan</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; text-align: right; font-weight: 700; color: #ffffff !important;">${(data.type || 'Monthly').toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; color: #94a3b8 !important;">Masa Aktif Baru</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 13.5px; text-align: right; font-weight: 800; color: #22c55e !important;">${data.expiryDate}</td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <div style="text-align: center; margin-top: 32px;">
                <a href="${siteUrl}/api/invoice?id=${invoiceId}" target="_blank" style="display: inline-block; background-color: #036EFD !important; color: #ffffff !important; font-weight: 800; padding: 13px 32px; border-radius: 8px; text-decoration: none; font-size: 14px;">
                  Unduh Invoice Perpanjangan (PDF)
                </a>
                <p style="margin-top: 16px; font-size: 12px; color: #64748b !important;">
                  ID Transaksi: ${data.transactionId || data.orderId || '-'}
                </p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 28px; text-align: center; font-size: 12px; color: #64748b !important; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0 0 6px; font-weight: 700; color: #cbd5e1 !important; font-size: 13px;">PRIMADEV DIGITAL TECHNOLOGY</p>
              <p style="margin: 0 0 10px; color: #94a3b8 !important;">SK Kemenkumham: AHU-A104134.AH.01.30.Tahun 2026</p>
              <p style="margin: 0; color: #64748b !important;">&copy; ${new Date().getFullYear()} Primadev Digital Technology. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

