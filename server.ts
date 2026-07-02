/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: string;
  bookingId: string;
}

// In-memory ledger of sent emails
const emailLedger: EmailLog[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // 1. API: HEALTH CHECK
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // 2. API: SEND EMAIL (TRIGGER EMAIL NOTIFICATION)
  app.post('/api/send-email', (req, res) => {
    const { to, subject, bookingDetail } = req.body;

    if (!to || !subject || !bookingDetail) {
      return res.status(400).json({ error: 'Missing required email fields' });
    }

    const { id, nama_penumpang, no_ka, kursi, tanggal_perjalanan, total_harga, stasiun_asal, stasiun_tujuan, waktu_berangkat, kereta_nama } = bookingDetail;

    // Create a beautifully formatted HTML-like email body for logging/previewing
    const emailBody = `
      ===============================================================
      KEMENTERIAN PERHUBUNGAN REPUBLIK INDONESIA - TIKET ELEKTRONIK
      ===============================================================
      Yth. Bapak/Ibu ${nama_penumpang || 'Penumpang'},
      
      Tiket perjalanan Anda untuk kereta api ${kereta_nama || 'KA'} (${no_ka}) telah BERHASIL DIKONFIRMASI.
      Berikut adalah rincian kode booking dan tiket perjalanan Anda:
      
      - Kode Booking      : ${id ? id.substring(0, 8).toUpperCase() : 'JG-MOCK'}
      - Nama Kereta       : ${kereta_nama || 'Jugijagijuk Express'} (${no_ka})
      - Tanggal Perjalanan: ${tanggal_perjalanan || '-'}
      - Rute Perjalanan   : ${stasiun_asal || 'Asal'} -> ${stasiun_tujuan || 'Tujuan'}
      - Waktu Keberangkatan: ${waktu_berangkat || '--:--'} WIB
      - Nomor Kursi       : ${Array.isArray(kursi) ? kursi.join(', ') : kursi}
      - Total Pembayaran  : Rp ${Number(total_harga || 0).toLocaleString('id-ID')}
      - Status Tiket      : KONFIRMASI (Lunas)
      
      Harap tunjukkan Kode Booking di atas saat mencetak Boarding Pass di stasiun keberangkatan 1 jam sebelum jadwal keberangkatan.
      
      Terima kasih telah memilih Jugijagijuk sebagai mitra perjalanan Anda.
      ===============================================================
      Sistem Informasi Kereta Api Jugijagijuk - Otomatisasi Log Notifikasi
    `;

    const newEmail: EmailLog = {
      id: `mail_${crypto.randomUUID().substring(0, 8)}`,
      to,
      subject,
      body: emailBody,
      sentAt: new Date().toISOString(),
      status: 'SUCCESS',
      bookingId: id || 'unknown'
    };

    emailLedger.unshift(newEmail);

    console.log('\n--- EMAIL NOTIFICATION SENT ---');
    console.log(emailBody);
    console.log('-------------------------------\n');

    return res.json({
      success: true,
      message: 'Email notification sent successfully!',
      simulated: true,
      email: newEmail
    });
  });

  // 3. API: GET SENT EMAIL OUTBOX (For Admin panel visibility)
  app.get('/api/admin/emails', (req, res) => {
    res.json(emailLedger);
  });

  // 4. Vite middleware for dev or Static files for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Jugijagijuk Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
