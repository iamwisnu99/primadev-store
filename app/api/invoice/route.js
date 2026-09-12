import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { getDb } from '@/lib/firebaseAdmin';
import { join } from 'path';
import { readFileSync } from 'fs';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get('id') || searchParams.get('orderId') || searchParams.get('order_id') || searchParams.get('key') || searchParams.get('licenseKey');
  const id = (rawId || '').trim();

  if (!id || id === 'PRIMA-XXXX-XXXX-XXXX') {
    return new NextResponse("ID Lisensi / Transaksi tidak valid", {
      status: 400,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  const db = getDb();
  if (!db) {
    return new NextResponse("Database tidak tersedia", {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  try {
    let license = null;

    // 1. Direct lookup in licenses by key
    const licSnap = await db.ref(`licenses/${id}`).once('value');
    if (licSnap.exists()) {
      license = licSnap.val();
    } else {
      // 2. Lookup in transactions by orderId
      const trxSnap = await db.ref(`transactions/${id}`).once('value');
      if (trxSnap.exists()) {
        const trx = trxSnap.val();
        let targetKey = trx.licenseKey || trx.targetLicenseKey;

        // Try to fetch full license record if key is known
        if (targetKey) {
          const licSnap2 = await db.ref(`licenses/${targetKey}`).once('value');
          if (licSnap2.exists()) {
            license = { ...trx, ...licSnap2.val() };
          }
        }

        // If license still not resolved, query licenses by transactionId
        if (!license) {
          const licByTrx = await db.ref('licenses').orderByChild('transactionId').equalTo(trx.orderId || id).once('value');
          if (licByTrx.exists()) {
            const first = Object.values(licByTrx.val())[0];
            license = { ...trx, ...first };
          }
        }

        // If still no license record, construct from transaction record
        if (!license) {
          license = {
            key: targetKey || id,
            appName: trx.appName || 'Lisensi Software',
            name: trx.customerName || 'Pelanggan',
            email: trx.customerEmail || '-',
            type: trx.duration || 'monthly',
            price: trx.amount || 0,
            transactionId: trx.orderId || id,
            expiryDate: 'Tercatat di sistem'
          };
        }
      } else {
        // 3. Fallback: query licenses where transactionId === id
        const licByTrx = await db.ref('licenses').orderByChild('transactionId').equalTo(id).once('value');
        if (licByTrx.exists()) {
          license = Object.values(licByTrx.val())[0];
        }
      }
    }

    if (!license) {
      return new NextResponse("Data Invoice tidak ditemukan", {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 (595.28 x 841.89 pt)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontCourier = await pdfDoc.embedFont(StandardFonts.CourierBold);

    const { width, height } = page.getSize();

    // ─── 1. BRAND HEADER WITH LOGO ───────────────────────────────────────────

    // Embed primadev_light.png logo
    let logoW = 120; // default fallback width (pt)
    const logoH = 36; // target display height (pt)
    const logoX = 50;
    const logoY = height - 50 - logoH; // top of logo at height-50, bottom at height-86

    try {
      const logoPath = join(process.cwd(), 'public', 'primadev_light.png');
      const logoPngBytes = readFileSync(logoPath);
      const pngImage = await pdfDoc.embedPng(logoPngBytes);
      // Compute proportional width from native dimensions
      const nativeW = pngImage.width;
      const nativeH = pngImage.height;
      logoW = Math.min((nativeW / nativeH) * logoH, 150); // cap at 150pt
      page.drawImage(pngImage, {
        x: logoX,
        y: logoY,
        width: logoW,
        height: logoH
      });
    } catch (logoErr) {
      // If logo can't be embedded, fall back to text-only brand name
      console.warn("[INVOICE LOGO]:", logoErr.message);
      page.drawText('PRIMADEV', {
        x: logoX,
        y: logoY + logoH / 2 - 8,
        size: 18,
        font: fontBold,
        color: rgb(0.01, 0.43, 0.99)
      });
    }

    // Vertical blue divider line — to the right of the logo
    const divX = logoX + logoW + 12;
    page.drawLine({
      start: { x: divX, y: height - 44 },
      end: { x: divX, y: height - 96 },
      thickness: 1.5,
      color: rgb(0.01, 0.43, 0.99) // #036EFD
    });

    // Company name & address — aligned vertically with logo, to the right of divider
    const textX = divX + 14;

    page.drawText('PRIMADEV DIGITAL TECHNOLOGY', {
      x: textX,
      y: height - 57,
      size: 13,
      font: fontBold,
      color: rgb(0.01, 0.43, 0.99) // #036EFD
    });

    page.drawText('Wangon, Kecamatan Wangon,', {
      x: textX,
      y: height - 72,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55)
    });

    page.drawText('Kabupaten Banyumas, Jawa Tengah 53176', {
      x: textX,
      y: height - 83,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55)
    });

    page.drawText('www.primadev.id  |  support.primadev@gmail.com', {
      x: textX,
      y: height - 94,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55)
    });

    // Horizontal divider line below header
    page.drawLine({
      start: { x: 50, y: height - 108 },
      end: { x: width - 50, y: height - 108 },
      thickness: 1,
      color: rgb(0.88, 0.91, 0.94) // #e2e8f0
    });

    // 2. INVOICE TITLE & STATUS
    page.drawText('INVOICE PEMBAYARAN RESMI', {
      x: 50,
      y: height - 136,
      size: 15,
      font: fontBold,
      color: rgb(0.06, 0.09, 0.16) // #0f172a
    });

    // Status Badge background & text
    const statusText = 'STATUS: LUNAS (PAID)';
    const statusWidth = fontBold.widthOfTextAtSize(statusText, 10);
    page.drawRectangle({
      x: width - 50 - statusWidth - 16,
      y: height - 144,
      width: statusWidth + 16,
      height: 20,
      color: rgb(0.86, 0.97, 0.89), // light green
      borderColor: rgb(0.13, 0.77, 0.37), // #22c55e
      borderWidth: 1
    });

    page.drawText(statusText, {
      x: width - 50 - statusWidth - 8,
      y: height - 138,
      size: 10,
      font: fontBold,
      color: rgb(0.09, 0.64, 0.29) // #16a34a
    });

    // 3. TRANSACTION & CUSTOMER INFO
    const infoY = height - 173;
    page.drawText(`Nomor Lisensi:`, { x: 50, y: infoY, size: 9.5, font: fontRegular, color: rgb(0.39, 0.45, 0.55) });
    page.drawText(String(license.key || '-'), { x: 135, y: infoY, size: 9.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

    page.drawText(`ID Transaksi:`, { x: 50, y: infoY - 16, size: 9.5, font: fontRegular, color: rgb(0.39, 0.45, 0.55) });
    page.drawText(String(license.transactionId || id), { x: 135, y: infoY - 16, size: 9.5, font: fontRegular, color: rgb(0.06, 0.09, 0.16) });

    page.drawText(`Tanggal:`, { x: 50, y: infoY - 32, size: 9.5, font: fontRegular, color: rgb(0.39, 0.45, 0.55) });
    page.drawText(new Date().toLocaleDateString('id-ID', { dateStyle: 'long' }), { x: 135, y: infoY - 32, size: 9.5, font: fontRegular, color: rgb(0.06, 0.09, 0.16) });

    page.drawText(`Nama Pembeli:`, { x: 340, y: infoY, size: 9.5, font: fontRegular, color: rgb(0.39, 0.45, 0.55) });
    page.drawText(String(license.name || 'Pelanggan'), { x: 420, y: infoY, size: 9.5, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

    page.drawText(`Email:`, { x: 340, y: infoY - 16, size: 9.5, font: fontRegular, color: rgb(0.39, 0.45, 0.55) });
    page.drawText(String(license.email || '-'), { x: 420, y: infoY - 16, size: 9.5, font: fontRegular, color: rgb(0.06, 0.09, 0.16) });

    // 4. ITEMS TABLE
    const tableY = height - 243;

    // Table Header Bar
    page.drawRectangle({
      x: 50,
      y: tableY,
      width: width - 100,
      height: 26,
      color: rgb(0.06, 0.09, 0.16) // #0f172a
    });

    page.drawText('DESKRIPSI PRODUK SOFTWARE', { x: 62, y: tableY + 8, size: 9.5, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('DURASI PAKET', { x: 310, y: tableY + 8, size: 9.5, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('TOTAL HARGA', { x: width - 130, y: tableY + 8, size: 9.5, font: fontBold, color: rgb(1, 1, 1) });

    // Table Row
    const formattedPrice = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(license.price || 0);

    const rowY = tableY - 26;
    page.drawText(String(license.appName || 'Software License'), { x: 62, y: rowY, size: 10, font: fontBold, color: rgb(0.06, 0.09, 0.16) });
    page.drawText(String(license.type || 'Monthly').toUpperCase(), { x: 310, y: rowY, size: 10, font: fontRegular, color: rgb(0.28, 0.33, 0.41) });
    page.drawText(formattedPrice, { x: width - 130, y: rowY, size: 10, font: fontBold, color: rgb(0.06, 0.09, 0.16) });

    // Table Divider
    page.drawLine({
      start: { x: 50, y: rowY - 14 },
      end: { x: width - 50, y: rowY - 14 },
      thickness: 1,
      color: rgb(0.88, 0.91, 0.94)
    });

    // Total Row
    const totalY = rowY - 38;
    page.drawText('TOTAL PEMBAYARAN:', { x: 270, y: totalY, size: 11, font: fontBold, color: rgb(0.06, 0.09, 0.16) });
    page.drawText(formattedPrice, { x: width - 130, y: totalY, size: 13, font: fontBold, color: rgb(0.01, 0.43, 0.99) });

    // 5. LICENSE KEY BOX
    const keyBoxY = totalY - 90;
    page.drawRectangle({
      x: 50,
      y: keyBoxY,
      width: width - 100,
      height: 64,
      color: rgb(0.98, 0.99, 1),
      borderColor: rgb(0.01, 0.43, 0.99),
      borderWidth: 1.5
    });

    page.drawText('KODE LICENSE KEY RESMI ANDA:', {
      x: 65,
      y: keyBoxY + 44,
      size: 9,
      font: fontBold,
      color: rgb(0.39, 0.45, 0.55)
    });

    page.drawText(String(license.key || id), {
      x: 65,
      y: keyBoxY + 18,
      size: 17,
      font: fontCourier,
      color: rgb(0.06, 0.09, 0.16)
    });

    // 6. FOOTER NOTES
    const footerY = keyBoxY - 50;
    page.drawText('Catatan Penting:', { x: 50, y: footerY, size: 9.5, font: fontBold, color: rgb(0.28, 0.33, 0.41) });
    page.drawText('• Bukti invoice ini dibuat secara digital dan sah tanpa memerlukan tanda tangan basah.', {
      x: 50,
      y: footerY - 16,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55)
    });
    page.drawText('• Simpan kode lisensi Anda dengan baik untuk aktivasi di aplikasi software Primadev.', {
      x: 50,
      y: footerY - 28,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55)
    });
    page.drawText('• Terima kasih telah mempercayakan kebutuhan software bisnis Anda kepada PT Primadev Digital Technology.', {
      x: 50,
      y: footerY - 40,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.39, 0.45, 0.55)
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);
    const safeFilename = String(license.key || id).replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 25);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': String(pdfBuffer.length),
        'Content-Disposition': `inline; filename="Invoice-${safeFilename}.pdf"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate'
      }
    });
  } catch (err) {
    console.error("[INVOICE GENERATION ERROR]:", err);
    return new NextResponse(err.message || "Gagal membuat invoice", {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

