# Panduan Integrasi Telegram Bot (Single-User MVP)

Dokumen ini menjelaskan konfigurasi, arsitektur, dan cara pengoperasian bot Telegram Dompi untuk mencatat keuangan pribadi pemilik aplikasi secara aman.

---

## 1. Arsitektur & Prinsip Keamanan

- **Single-User Owner:** Bot ini hanya didedikasikan untuk satu pemilik aplikasi.
- **Whitelist `TELEGRAM_CHAT_ID`:** Semua pesan dari pengguna lain akan langsung ditolak dengan kode status `403 Forbidden` tanpa membaca atau mengubah database.
- **Webhook Secret Token:** Endpoint `/api/telegram` dilindungi header resmi Telegram `X-Telegram-Bot-Api-Secret-Token` yang dicocokkan dengan `TELEGRAM_WEBHOOK_SECRET`.
- **Deduplikasi Request:** Sistem menyimpan `update_id` terbaru dalam cache memori jangka pendek untuk mencegah pencatatan transaksi berulang saat Telegram melakukan retry jaringan.
- **Reusable CRUD Service:** Telegram menggunakan service yang sama dengan antarmuka Web ([`src/lib/services/transaction-service.ts`](src/lib/services/transaction-service.ts)) sehingga aturan bisnis, validasi, soft-delete, dan undo berjalan konsisten.

---

## 2. Environment Variables yang Diperlukan

Tambahkan variabel berikut ke environment server produksi (misalnya di Vercel Dashboard / Railway / VPS) atau `.env.local` saat pengujian:

| Variabel | Lingkup | Deskripsi |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Server only | Token bot Telegram yang diperoleh dari `@BotFather`. |
| `TELEGRAM_CHAT_ID` | Server only | Nomor ID Telegram pribadi pemilik (contoh: `123456789`). |
| `TELEGRAM_WEBHOOK_SECRET` | Server only | String rahasia acak (1-256 karakter: `A-Z`, `a-z`, `0-9`, `_`, `-`) untuk verifikasi webhook. |
| `GEMINI_API_KEY` | Server only | Kunci API Google Gemini untuk Natural Language Understanding. |
| `NEXT_PUBLIC_SUPABASE_URL` | Publik / Server | URL proyek Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publik / Client | Kunci anonim Supabase untuk client browser. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Kunci service role Supabase di server agar endpoint webhook dapat mengelola data pemilik tanpa cookie sesi browser. |

> **PERINGATAN KEAMANAN:** Jangan pernah menambahkan prefix `NEXT_PUBLIC_` pada `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`, atau `SUPABASE_SERVICE_ROLE_KEY`.

---

## 3. Cara Mendapatkan `TELEGRAM_CHAT_ID` Pemilik

1. Buka aplikasi Telegram.
2. Cari bot resmi `@userinfobot` atau `@raw_data_bot`.
3. Kirim pesan apa saja (misalnya `/start`).
4. Bot akan membalas dengan profil Telegram Anda, termasuk baris **Id** (berupa deretan angka positif, contoh: `123456789`).
5. Salin angka tersebut dan simpan sebagai nilai `TELEGRAM_CHAT_ID`.

---

## 4. URL Webhook Setelah Deploy

Setelah aplikasi Next.js dideploy ke domain publik (misalnya Vercel), URL webhook adalah:
```text
https://<domain-anda.com>/api/telegram
```

---

## 5. Cara Memasang / Mendaftarkan Webhook Telegram

Gunakan perintah `curl` melalui terminal (atau Postman) untuk mendaftarkan URL webhook beserta secret token ke server Telegram:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://<domain-anda.com>/api/telegram",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["message"]
  }'
```

Jika berhasil, Telegram akan mengembalikan response:
```json
{
  "ok": true,
  "result": true,
  "description": "Webhook was set"
}
```

Untuk memeriksa status webhook kapan saja:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getWebhookInfo"
```

Untuk menghapus webhook jika ingin kembali ke polling lokal:
```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/deleteWebhook"
```

---

## 6. Cara Menguji Webhook Secara Aman

### Uji Coba Simulasi via cURL (Lokal / Staging)

1. **Uji Validasi Secret Ditolak (Harus 401):**
```bash
curl -i -X POST "http://localhost:3000/api/telegram" \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Bot-Api-Secret-Token: token_salah" \
  -d '{"update_id": 1, "message": {"chat": {"id": 123456789}, "text": "Halo"}}'
```
*Respons yang diharapkan:* HTTP 401 Unauthorized (`{"error":"Unauthorized"}`).

2. **Uji Chat ID Asing Ditolak (Harus 403):**
```bash
curl -i -X POST "http://localhost:3000/api/telegram" \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Bot-Api-Secret-Token: <TELEGRAM_WEBHOOK_SECRET>" \
  -d '{"update_id": 2, "message": {"chat": {"id": 999999999}, "text": "Halo"}}'
```
*Respons yang diharapkan:* HTTP 403 Forbidden (`{"error":"Forbidden"}`).

3. **Uji Pesan Valid dari Pemilik (Harus 200 & Terkirim):**
```bash
curl -i -X POST "http://localhost:3000/api/telegram" \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Bot-Api-Secret-Token: <TELEGRAM_WEBHOOK_SECRET>" \
  -d '{
    "update_id": 3,
    "message": {
      "chat": {"id": <TELEGRAM_CHAT_ID>},
      "text": "Makan siang 35 ribu pakai BCA"
    }
  }'
```
*Respons yang diharapkan:* HTTP 200 OK (`{"ok":true}`) dan bot Telegram mengirim balasan konfirmasi pencatatan ke chat pemilik.
