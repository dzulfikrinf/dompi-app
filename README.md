# 💰 Dompi - Asisten Pintar Pencatat Keuangan Pribadi

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.5%20Flash%20Lite-8E75B2?style=flat&logo=google)](https://ai.google.dev/)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot%20API-2CA5E0?style=flat&logo=telegram)](https://core.telegram.org/bots/api)

**Dompi** adalah aplikasi web modern pencatat keuangan pribadi terintegrasi yang dilengkapi dengan **Asisten AI (Google Gemini)** dan **Bot Telegram**. Dompi dirancang untuk memudahkan siapa saja mencatat arus kas (pemasukan & pengeluaran), mengelola multi-rekening/dompet, memantau anggaran, serta membuat laporan keuangan komprehensif baik melalui antarmuka web yang intuitif maupun percakapan bahasa alami (*natural language*) di Telegram.

---

## 📌 Daftar Isi

1. [Tentang Aplikasi](#-tentang-aplikasi)
2. [Fitur-Fitur Utama](#-fitur-fitur-utama)
3. [Tech Stack](#-tech-stack)
4. [Alur & Flow Aplikasi](#-alur--flow-aplikasi)
5. [Struktur Direktori](#-struktur-direktori)
6. [Prasyarat Sistem](#-prasyarat-sistem)
7. [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
8. [Konfigurasi Environment Variables](#-konfigurasi-environment-variables)
9. [Panduan Integrasi Telegram Bot](#-panduan-integrasi-telegram-bot)
10. [Contoh Perintah Bahasa Alami (Dompi AI)](#-contoh-perintah-bahasa-alami-dompi-ai)
11. [Lisensi](#-lisensi)

---

## 🌟 Tentang Aplikasi

Banyak orang kesulitan mencatat keuangan secara konsisten karena proses input transaksi manual yang kaku dan merepotkan. **Dompi** memecahkan masalah ini dengan menyediakan dua jalur pencatatan yang saling tersinkronisasi secara *real-time*:

1. **Web Dashboard Interaktif**: Visualisasi grafik arus kas, ringkasan saldo per dompet, manajemen anggaran kategori, target tabungan, dan laporan tren pengeluaran bulanan.
2. **Chat Asisten AI & Telegram Bot**: Cukup ketik kalimat sehari-hari seperti *"Makan siang bakso 35rb pake BCA"* atau *"tambah saldo dompet BCA 500rb"*, Dompi akan otomatis memahami konteks, mencatat mutasi, mengupdate saldo dompet, dan mengonfirmasi seketika.

---

## ✨ Fitur-Fitur Utama

* 📊 **Dashboard Finansial Real-Time**: Ringkasan total saldo, pemasukan bulanan, pengeluaran bulanan, grafik arus kas (*cashflow*), serta daftar transaksi terkini.
* 💳 **Manajemen Multi-Dompet & Rekening**:
  * Kelola berbagai jenis rekening: Bank (BCA, Mandiri, dll.), Dompet Digital (GoPay, OVO, ShopeePay), Uang Tunai / Fisik, maupun Reksa Dana / Investasi.
  * **Perhitungan Saldo Dinamis**: Saldo terkini dihitung secara matematis dan akurat dari formula:
    $$\text{Saldo Terkini} = \text{Saldo Awal} + \sum \text{Pemasukan} - \sum \text{Pengeluaran}$$
  * Dukungan CRUD lengkap (buat dompet baru, tambah saldo, ubah nama/tipe, hapus).
* 📝 **Manajemen Transaksi (Pemasukan & Pengeluaran)**:
  * Input manual via formulir web atau otomatis via AI Chat.
  * Tagging dompet/rekening sumber dan kategori pengeluaran/pemasukan.
  * Fitur pencarian, filter tanggal, serta *Soft Delete* dengan kemampuan **Undo / Pulihkan Transaksi**.
* 🤖 **Asisten AI "Dompi" (NLU Web & Telegram)**:
  * Ditenagai model **Google Gemini 3.5 Flash Lite**.
  * Mampu memahami bahasa santai, singkatan nominal (50rb, 2jt, 1.5jt), serta konteks percakapan.
  * Menghasilkan rekap keuangan menyeluruh (Pemasukan, Pengeluaran, Arus Kas Bersih, Total Saldo, dan Rincian per Dompet).
* 🎯 **Target Tabungan (Savings Goals)**: Lacak progress tabungan untuk impian atau dana darurat dengan persentase capaian dan tenggat waktu.
* 📉 **Anggaran Bulanan (Budgeting)**: Batasi pengeluaran per kategori dengan indikator visual dan peringatan saat mendekati batas anggaran.
* 📅 **Pengingat Tagihan (Bills & Subscriptions)**: Catat tagihan rutin bulanan (WiFi, listrik, langganan Netflix/Spotify) agar tidak telat bayar.
* 📈 **Laporan & Analisis Statistik**: Visualisasi diagram lingkaran (*pie chart*) proporsi pengeluaran per kategori dan perbandingan historis.
* 🌓 **Dark & Light Mode**: Desain antarmuka modern, nyaman di mata, dan responsif di perangkat mobile maupun desktop.

---

## 🛠️ Tech Stack

### Frontend & Core Framework
* **[Next.js 16](https://nextjs.org/)** (App Router, Turbopack, Server Actions, Server Components)
* **[React 19](https://react.dev/)**
* **[TypeScript](https://www.typescriptlang.org/)** (Strict Typing)
* **[Tailwind CSS v4](https://tailwindcss.com/)** & **Lucide React** (Ikon UI)
* **[Recharts](https://recharts.org/)** (Komponen Grafik & Visualisasi Data)
* **[next-themes](https://github.com/pacocoursey/next-themes)** (Tema Gelap & Terang)

### Backend, Database & Autentikasi
* **[Supabase](https://supabase.com/)**:
  * PostgreSQL Database dengan relasi tabel terstruktur.
  * Supabase Auth & SSR Session via `@supabase/ssr`.
  * Row Level Security (RLS) untuk isolasi data pengguna yang aman.

### Kecerdasan Buatan (AI) & Bot Engine
* **[Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)**: Model `gemini-3.5-flash-lite` dengan prompt engineering JSON terstruktur.
* **Telegram Bot API**: Endpoint Webhook Next.js (`/api/telegram`) dengan sistem deduplikasi update ID, validasi rahasia (*secret token*), dan verifikasi Chat ID pemilik.

---

## 🔄 Alur & Flow Aplikasi

```
                                      ┌─────────────────────────────────┐
                                      │         PENGGUNA (USER)         │
                                      └────────┬───────────────┬────────┘
                                               │               │
                        Akses via Web Browser  │               │ Kirim Pesan Chat
                                               ▼               ▼
                                   ┌────────────────┐   ┌───────────────┐
                                   │  Next.js App   │   │ Telegram Bot  │
                                   │ (Web Dashboard)│   └───────┬───────┘
                                   └───────┬────────┘           │ Webhook POST
                                           │                    ▼
                                           │            ┌────────────────────────┐
                                           │            │ /api/telegram (Server) │
                                           │            └───────┬────────────────┘
                                           │                    │
                                           ▼                    ▼
                               ┌─────────────────────────────────────────┐
                               │     Prompt Context Engine & Gemini      │
                               │        (gemini-3.5-flash-lite)          │
                               └───────────────────┬─────────────────────┘
                                                   │ Ekstraksi JSON (Action, Nominal,
                                                   │ Dompet, Kategori, Rekap, dll.)
                                                   ▼
                               ┌─────────────────────────────────────────┐
                               │   Transaction & Wallet Service Layer    │
                               │          (Business Logic & CRUD)        │
                               └───────────────────┬─────────────────────┘
                                                   │ Query / Mutasi
                                                   ▼
                               ┌─────────────────────────────────────────┐
                               │       Supabase PostgreSQL Database      │
                               │  (transactions, wallets, budgets, etc.) │
                               └─────────────────────────────────────────┘
```

### 1. Flow Pencatatan via Telegram Bot
1. Pengguna mengirim pesan teks di Telegram (misal: *"Beli kopi 25rb bayar pake GoPay"*).
2. Telegram meneruskan update ke endpoint Webhook Next.js (`POST /api/telegram`).
3. Endpoint memvalidasi:
   * Header `X-Telegram-Bot-Api-Secret-Token` sesuai `TELEGRAM_WEBHOOK_SECRET`.
   * `chat_id` pengirim sesuai dengan `TELEGRAM_CHAT_ID` pemilik.
   * `update_id` belum pernah diproses (mencegah eksekusi ganda jika Telegram mengirim retry).
4. Server mengambil konteks data terbaru pemilik (daftar dompet, transaksi aktif, ringkasan saldo bulan berjalan).
5. Konteks dan pesan dikirim ke **Gemini 3.5 Flash Lite** untuk Natural Language Understanding (NLU).
6. Gemini mengembalikan format JSON terstandar (`TAMBAH`, `UBAH`, `HAPUS`, `UNDO`, `UBAH_DOMPET`, `RINGKASAN`, dll.).
7. Server mengeksekusi operasi database di Supabase dan mengirimkan pesan balasan konfirmasi yang ramah kembali ke Telegram pengguna.

### 2. Flow Rekap Keuangan Komprehensif
1. Pengguna meminta rekap (misal: *"rekap keuangan"* atau *"ringkasan bulan ini"*).
2. Sistem mengumpulkan total pemasukan, total pengeluaran, selisih arus kas, total saldo terkini dari seluruh dompet, dan saldo spesifik masing-masing dompet.
3. Gemini dan safeguard sistem menyusun laporan rapi berformat:
   * Periode bulan berjalan
   * Total Pemasukan & Pengeluaran
   * Arus Kas Bersih (Surplus / Defisit)
   * **Total Saldo Saat Ini** (seluruh uang yang dimiliki)
   * **Rincian Saldo masing-masing Dompet** (BCA, GoPay, Tunai, dsb.)

---

## 📁 Struktur Direktori

```text
pencatat-keuangan/
├── public/                     # Aset statis, favicon, logo karakter dompet
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/login/       # Halaman login & otentikasi Supabase
│   │   ├── anggaran/           # Halaman manajemen anggaran bulanan
│   │   ├── api/
│   │   │   └── telegram/       # Webhook endpoint Telegram Bot API
│   │   ├── chat/               # Antarmuka web asisten AI Dompi
│   │   ├── dompet/             # Halaman CRUD Dompet & Rekening Bank
│   │   ├── laporan/            # Halaman laporan & grafik statistik keuangan
│   │   ├── pengaturan/         # Pengaturan profil & preferensi
│   │   ├── tagihan/            # Pelacak tagihan rutin & langganan
│   │   ├── target/             # Pelacak target tabungan (savings goals)
│   │   ├── transaksi/          # Daftar riwayat transaksi & formulir input
│   │   ├── globals.css         # Styling global & token Tailwind CSS v4
│   │   ├── layout.tsx          # Root layout aplikasi & tema
│   │   ├── loading.tsx         # Global loading skeleton
│   │   └── page.tsx            # Dashboard utama
│   ├── components/             # Komponen UI modular
│   │   ├── dashboard/          # Kartu ringkasan saldo, grafik, sidebar, navbar
│   │   ├── ui/                 # Komponen UI dasar (button, modal, card)
│   │   └── theme-provider.tsx  # Dark mode provider
│   └── lib/                    # Utilitas, konfigurasi, & service logic
│       ├── auth.ts             # Helper otentikasi cepat
│       ├── gemini.ts           # Konfigurasi Google Gemini SDK, prompt NLU, & validator
│       ├── services/           # Service layer database
│       │   ├── telegram-service.ts  # Utilitas bot Telegram, verifikasi, deduplikasi
│       │   ├── transaction-service.ts # Logika transaksi (CRUD, soft delete, undo)
│       │   └── wallet-service.ts    # Logika dompet & kalkulasi saldo matematis
│       ├── supabase/           # Client Supabase (Server, Client, Middleware)
│       └── types/              # Deklarasi tipe TypeScript (Transaction, Wallet, dll.)
├── .env.example                # Template konfigurasi environment variables
├── next.config.ts              # Konfigurasi Next.js
├── package.json                # Dependensi & skrip proyek
└── tsconfig.json               # Konfigurasi TypeScript
```

---

## 📋 Prasyarat Sistem

Sebelum menjalankan proyek, pastikan perangkat Anda telah terinstal:
* **Node.js**: Versi `18.18.0` atau yang lebih baru (disarankan Node.js 20 LTS).
* **Package Manager**: `npm`, `pnpm`, atau `yarn`.
* **Akun Supabase**: Untuk database PostgreSQL dan autentikasi.
* **Google AI Studio API Key**: Untuk akses model Gemini 3.5 Flash Lite ([Dapatkan di sini](https://aistudio.google.com/)).
* **Telegram Bot Token** *(Opsional bila ingin mengaktifkan bot)*: Dari [@BotFather](https://t.me/botfather).

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Clone Repositori
```bash
git clone https://github.com/dzulfikrinf/dompi-app.git
cd dompi-app
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Buka `.env.local` pada editor Anda dan isi nilai konfigurasi sesuai kebutuhan (lihat rincian di bagian [Environment Variables](#-konfigurasi-environment-variables)).

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000).

### 5. Build untuk Produksi
Untuk memastikan kompilasi tipe dan bundle siap produksi:
```bash
npm run build
npm run start
```

---

## 🔐 Konfigurasi Environment Variables

Berikut adalah tabel rincian variabel lingkungan pada `.env.local`:

| Nama Variabel | Wajib? | Deskripsi & Sumber Nilai |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Ya** | URL project Supabase Anda (contoh: `https://xyzcompany.supabase.co`). Didapat dari *Project Settings > API* di dashboard Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Ya** | Kunci publik/anonim Supabase untuk interaksi client-side. Didapat dari *Project Settings > API*. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Ya\*** | Kunci rahasia Service Role Supabase. Digunakan oleh webhook Telegram di server untuk mengeksekusi mutasi data pemilik secara aman dengan hak akses penuh. |
| `GEMINI_API_KEY` | **Ya** | API Key Google Gemini. Digunakan untuk memproses bahasa alami NLU pada chat web dan Telegram ([Google AI Studio](https://aistudio.google.com/)). |
| `TELEGRAM_BOT_TOKEN` | Opsional | Token Bot Telegram yang didapatkan saat membuat bot melalui [@BotFather](https://t.me/botfather). |
| `TELEGRAM_CHAT_ID` | Opsional | ID Numerik akun Telegram pemilik bot. Menjamin hanya pemilik sah yang bisa mencatat dan melihat data keuangan. Didapat via [@userinfobot](https://t.me/userinfobot). |
| `TELEGRAM_WEBHOOK_SECRET` | Opsional | String acak rahasia untuk memverifikasi bahwa request webhook yang masuk benar-benar berasal dari server Telegram resmi. |

> **Catatan Keamanan:** Jangan pernah melakukan commit file `.env.local` atau membagikan `SUPABASE_SERVICE_ROLE_KEY` dan `TELEGRAM_BOT_TOKEN` ke repositori publik!

---

## 🤖 Panduan Integrasi Telegram Bot

Agar dapat mencatat keuangan langsung lewat Telegram:

1. **Buat Bot Telegram**:
   * Buka Telegram dan cari [@BotFather](https://t.me/botfather).
   * Kirim perintah `/newbot`, ikuti petunjuk nama dan username bot.
   * Simpan token yang diberikan ke variabel `TELEGRAM_BOT_TOKEN` di `.env.local`.

2. **Dapatkan Chat ID Akun Anda**:
   * Buka [@userinfobot](https://t.me/userinfobot) di Telegram dan klik *Start*.
   * Catat angka `Id` yang tampil, lalu masukkan ke `TELEGRAM_CHAT_ID` di `.env.local`.

3. **Tentukan Secret Token Webhook**:
   * Buat string acak (misal: `dompi_super_secret_token_123`) dan masukkan ke `TELEGRAM_WEBHOOK_SECRET`.

4. **Deploy Aplikasi ke URL Publik**:
   * Deploy aplikasi Anda ke penyedia hosting seperti [Vercel](https://vercel.com/) sehingga memiliki domain HTTPS publik (misal: `https://dompi.vercel.app`).

5. **Daftarkan Webhook ke Telegram**:
   Jalankan perintah HTTP GET berikut melalui browser atau cURL di terminal:
   ```bash
   curl -F "url=https://domain-kamu.vercel.app/api/telegram" \
        -F "secret_token=NILAI_TELEGRAM_WEBHOOK_SECRET_KAMU" \
        https://api.telegram.org/bot<NILAI_TELEGRAM_BOT_TOKEN_KAMU>/setWebhook
   ```
   Jika berhasil, Telegram akan mengembalikan respon:
   ```json
   {"ok": true, "result": true, "description": "Webhook was set"}
   ```

Sekarang Anda bisa langsung mengirim pesan ke bot Anda di Telegram!

---

## 💬 Contoh Perintah Bahasa Alami (Dompi AI)

Dompi dirancang fleksibel sehingga Anda tidak perlu menghafal sintaks kaku:

### 1. Pencatatan Pengeluaran & Pemasukan
* *"Makan siang soto ayam 25rb bayar pake Tunai"*
* *"Beli bensin pertamax 50.000 pake BCA"*
* *"Dapat gaji bulanan 7.5jt masuk rekening Mandiri"*
* *"Top up pulsa 100rb dari GoPay"*

### 2. Mengubah & Menghapus Transaksi
* *"Ubah makan siang tadi jadi 30rb"*
* *"Hapus transaksi beli bensin"*
* *"Batalkan penghapusan terakhir"* *(Fitur Undo)*

### 3. Operasi Saldo & Dompet
* *"Tambah saldo dompet BCA 500rb"* *(Menambahkan 500rb ke saldo BCA yang sudah ada)*
* *"Tambah dompet baru Seabank tipe Rekening Bank saldo awal 1jt"*
* *"Ubah saldo dompet Tunai jadi 250rb"* *(Mengatur ulang saldo menjadi nominal tertentu)*
* *"Cek dompet"* atau *"Berapa saldo semua rekeningku?"*

### 4. Rekap & Ringkasan Keuangan
* *"Rekap keuangan"*
* *"Ringkasan bulan ini"*
* *"Bagaimana kondisi keuanganku sekarang?"*

**Contoh Balasan Rekap dari Dompi:**
> 📊 **Rekap Keuangan Bulan Ini (Oktober 2026):**
>
> 💰 **Total Pemasukan:** Rp7.500.000  
> 💸 **Total Pengeluaran:** Rp2.150.000  
> 📈 **Arus Kas Bersih:** +Rp5.350.000 (Surplus)  
>
> 💳 **Total Saldo Saat Ini:** Rp14.850.000  
> **Rincian Dompet:**  
> • BCA: Rp10.500.000  
> • Mandiri: Rp3.000.000  
> • GoPay: Rp350.000  
> • Tunai: Rp1.000.000

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan manajemen keuangan pribadi dan bersifat pribadi / open source di bawah lisensi [MIT](LICENSE). Silakan gunakan dan sesuaikan sesuai kebutuhan finansial Anda! 🚀
