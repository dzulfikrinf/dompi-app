# Panduan Deployment Produksi - Dompi App

Dokumen ini berisi panduan lengkap untuk melakukan deployment aplikasi **Dompi** ke **Vercel** serta mengonfigurasi integrasi Supabase, Gemini AI, dan bot Telegram secara aman.

---

## 1. Pembagian Environment Variables

Variabel lingkungan dibagi secara ketat menjadi **Client-Side (Publik)** dan **Server-Only (Rahasia)**:

### A. Public (Client & Server)
Dapat diakses oleh browser melalui prefix `NEXT_PUBLIC_`:
- `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase Anda (contoh: `https://xxxx.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Kunci anonim Supabase untuk autentikasi browser dan RLS.

### B. Server-Only (Rahasia / Server Saja)
**DILARANG** menggunakan prefix `NEXT_PUBLIC_`. Nilai variabel ini tidak pernah dikirim ke browser:
- `SUPABASE_SERVICE_ROLE_KEY`: Kunci service role Supabase (digunakan hanya oleh endpoint server Telegram untuk mengelola data pemilik).
- `GEMINI_API_KEY`: Kunci API Google Gemini untuk Natural Language Processing.
- `TELEGRAM_BOT_TOKEN`: Token bot Telegram resmi dari `@BotFather`.
- `TELEGRAM_CHAT_ID`: ID numerik akun Telegram pribadi pemilik (contoh: `123456789`).
- `TELEGRAM_WEBHOOK_SECRET`: String acak rahasia untuk memvalidasi request resmi dari Telegram ke webhook.

---

## 2. Cara Mengisi Environment Variables di Vercel

### Melalui Dashboard Vercel (Rekomendasi)
1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan pilih project **pencatat-keuangan** (atau nama project yang Anda gunakan).
2. Masuk ke tab **Settings** > **Environment Variables**.
3. Tambahkan masing-masing variabel berikut ke target environment (**Production** dan **Preview**):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `TELEGRAM_WEBHOOK_SECRET`
4. Klik **Save**.

### Melalui Vercel CLI
Anda juga dapat menambahkan variabel satu per satu melalui terminal:
```bash
npx vercel env add NAMA_VARIABEL production
```

---

## 3. Cara Melakukan Deployment

### Opsi A: Deployment Otomatis via Git Push (Rekomendasi)
Cukup push commit ke branch utama (`main`):
```bash
git push origin main
```
Vercel akan otomatis melakukan proses build dan deploy production.

### Opsi B: Deployment Manual via Vercel CLI
Jalankan perintah berikut di direktori project:
```bash
npx vercel --prod
```

---

## 4. Konfigurasi Webhook Telegram

> **PENTING:** Konfigurasi webhook hanya dilakukan **SETELAH** aplikasi selesai dideploy dan memiliki domain publik yang aktif (misal `https://dompi-keuangan.vercel.app`).

### A. Memasang Webhook
Jalankan perintah berikut di PowerShell atau terminal:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" `
  -H "Content-Type: application/json" `
  -d "{\"url\":\"https://DOMAIN_KAMU/api/telegram\",\"secret_token\":\"WEBHOOK_SECRET\"}"
```
*(Ganti `<BOT_TOKEN>` dengan token bot Anda, `DOMAIN_KAMU` dengan domain Vercel Anda, dan `WEBHOOK_SECRET` dengan string rahasia yang sama dengan yang diisi di environment variable `TELEGRAM_WEBHOOK_SECRET`).*

### B. Memeriksa Status Webhook
Untuk memverifikasi apakah Telegram telah berhasil terhubung ke server Anda:
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```
Respons yang sukses akan menampilkan:
- `"url": "https://DOMAIN_KAMU/api/telegram"`
- `"has_custom_certificate": false`
- `"pending_update_count": 0`
- `"last_error_date"` tidak ada atau kosong.

### C. Menghapus Webhook (Jika Perlu)
Jika ingin mematikan bot atau mengembalikan ke mode polling lokal:
```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/deleteWebhook"
```

---

## 5. Cara Rollback Jika Deployment Bermasalah

Jika rilis terbaru mengalami kendala di production:
1. Buka [Vercel Dashboard](https://vercel.com/dashboard) > Project **pencatat-keuangan**.
2. Masuk ke tab **Deployments**.
3. Cari deployment sebelumnya yang berstatus sukses / stabil.
4. Klik tombol menu tiga titik (**...**) di sebelah kanan deployment tersebut.
5. Pilih **Instant Rollback** (atau **Promote to Production**).
6. Traffic produksi akan seketika dialihkan kembali ke versi stabil sebelumnya tanpa jeda waktu down (*zero downtime*).

---

## 6. Checklist Verifikasi Paska-Deploy

- [ ] Halaman login `https://DOMAIN_KAMU/login` dapat diakses dan form login berfungsi.
- [ ] User yang belum login diarahkan ke `/login` saat mengakses `/`, `/transaksi`, atau `/chat`.
- [ ] CRUD transaksi berfungsi (tambah, edit, soft-delete, dan undo).
- [ ] Chat AI Dompi di `/chat` merespons input dengan benar.
- [ ] Mengirim pesan ke bot Telegram menghasilkan balasan dan mencatat transaksi ke database pemilik.
