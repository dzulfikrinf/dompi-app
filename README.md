# Dompi - Asisten Cerdas Pencatat Keuangan Pribadi

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat&logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.5%20Flash%20Lite-8E75B2?style=flat&logo=google)](https://ai.google.dev/)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot%20API-2CA5E0?style=flat&logo=telegram)](https://core.telegram.org/bots/api)

**Dompi** adalah aplikasi pencatat keuangan pribadi modern dengan antarmuka **Neo-Brutalism**, asisten cerdas berbasis **Google Gemini**, dan integrasi **Bot Telegram multi-pengguna**. Dirancang untuk memudahkan siapa saja mencatat pengeluaran harian, memantau saldo multi-dompet, dan menganalisis arus kas tanpa kerumitan formulir yang kaku.

---

## Daftar Isi

1. [Tentang Dompi](#tentang-dompi)
2. [Desain Sistem Neo-Brutalism](#desain-sistem-neo-brutalism)
3. [Fitur-Fitur Utama](#fitur-fitur-utama)
4. [Tech Stack](#tech-stack)
5. [Arsitektur & Alur Sistem](#arsitektur--alur-sistem)
6. [Struktur Direktori](#struktur-direktori)
7. [Prasyarat Sistem](#prasyarat-sistem)
8. [Panduan Instalasi Lokal](#panduan-instalasi-lokal)
9. [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
10. [Panduan Integrasi Telegram Multi-User](#panduan-integrasi-telegram-multi-user)
11. [Contoh Percakapan & Perintah Alami](#contoh-percakapan--perintah-alami)
12. [Lisensi](#lisensi)

---

## Tentang Dompi

Mencatat keuangan sering kali terhenti di tengah jalan karena formulir input yang merepotkan dan banyaknya rincian manual yang harus diisi. **Dompi** menghadirkan pengalaman pencatatan yang fleksibel melalui dua jalur terpadu:

1. **Web App Interaktif**: Tampilan visual berbasis *Neo-Brutalism* yang memuat ringkasan saldo, mutasi transaksi, alokasi pengeluaran, transfer saldo antar-dompet, dan grafik arus kas.
2. **Asisten AI & Bot Telegram Multi-User**: Cukup kirim kalimat santai seperti *"Makan siang 25rb tunai, beli bensin 50rb pake bca, parkir 2rb"* atau *"Transfer 300rb dari BCA ke Mandiri"*. Dompi akan memproses konteks, mencatat transaksi sekaligus, dan memperbarui saldo seketika.

---

## Desain Sistem Neo-Brutalism

Antarmuka Dompi dibangun dengan konsep estetika **Neo-Brutalism / Pop-Modern**:
* **Garis & Kontur Tegas**: Border solid `2px` hingga `3px` hitam pekat (`#121212`) pada light mode dan kontras tinggi pada dark mode.
* **Hard Offset Shadows**: Bayangan jatuh tegas zero-blur (`shadow-brutal` `4px 4px 0px #121212`).
* **Palet Warna Pop-Art**: Aksen kuning elektrik (`#FFE600`), cyan neon (`#00F0FF`), hijau mint (`#00FF66`), dan merah karang (`#FF4365`).
* **Tipografi Karakter**: Font tampilan **Space Grotesk** (`font-display`) untuk judul dan angka tabular, dipadukan dengan **Plus Jakarta Sans** (`font-sans`) untuk kenyamanan membaca teks panjang.
* **Responsif Layar Sempit**: Header dan komponen navigasi dioptimasi khusus untuk kenyamanan perangkat mobile (termasuk viewport sempit seperti iPhone SE 375px).

---

## Fitur-Fitur Utama

* **Landing Page Publik & Proteksi Rute**: Halaman utama publik (`/`) yang informatif dan ramah pengguna, dengan pengalihan otomatis ke beranda interaktif (`/beranda`) setelah masuk.
* **Dashboard Finansial Real-Time**: Ringkasan saldo aktif, pemasukan bulan berjalan, pengeluaran terkendali, dan grafik visual mutasi.
* **Manajemen Multi-Dompet**:
  * Kelola berbagai kategori dompet: Rekening Bank, Dompet Digital (E-Wallet), Uang Tunai, maupun Tabungan.
  * Formula saldo matematis yang menghitung mutasi secara real-time tanpa batas historis.
  * Mendukung mutasi transfer saldo antar-dompet.
* **Pencatatan Jamak Sekaligus (Batch Transactions)**: Mampu memecah satu pesan panjang menjadi beberapa mutasi transaksi independen dalam satu aksi.
* **Integrasi Bot Telegram Multi-Pengguna**:
  * Sistem pairing dinamis berbasis token `/start <token>` berbatas waktu 15 menit.
  * Setiap pengguna dapat menautkan akun Telegram pribadi secara mandiri tanpa konfigurasi manual di server.
  * Pesan konfirmasi Telegram menggunakan format HTML terstruktur (`<b>`, `•`) yang rapi dan mudah dibaca.
* **Alur Konfirmasi Email PKCE**:
  * Endpoint callback server (`/auth/callback`) untuk pertukaran kode otentikasi Supabase dan verifikasi OTP email secara dinamis di domain produksi maupun lokal.
* **Pusat Panduan & Cheat Sheet (`/panduan`)**: Dokumentasi interaktif contoh perintah bahasa sehari-hari untuk mempermudah pengguna baru.
* **Pengaturan Ramah Pengguna (`/pengaturan`)**: Informasi profil, manajemen sambungan Telegram, pilihan mode tampilan (Terang / Gelap), dan jaminan privasi data tanpa istilah teknis yang membingungkan.

---

## Tech Stack

### Frontend
* **Next.js 16.3** (App Router, Turbopack, Server Actions, Server Components)
* **React 19**
* **TypeScript** (Strict Type-Safety)
* **Tailwind CSS v4** & **Lucide React** (Ikon UI)
* **next-themes** (Dukungan Mode Terang & Gelap)

### Database & Autentikasi
* **Supabase PostgreSQL**: Skema tabel relasional (`transactions`, `wallets`, `telegram_connections`).
* **Supabase Auth & SSR**: Manajemen sesi aman berbasis cookie (`@supabase/ssr`) dengan proteksi Row Level Security (RLS).

### Kecerdasan Buatan (AI)
* **Google Generative AI SDK**: Model `gemini-3.5-flash-lite` dengan arsitektur multi-turn function calling untuk mengeksekusi operasi transaksi secara deterministik.

---

## Arsitektur & Alur Sistem

```
                                 +-----------------------------+
                                 |       PENGGUNA (USER)       |
                                 +--------------+--------------+
                                                |
                        +-----------------------+-----------------------+
                        | Akses Web Browser                             | Pesan Telegram
                        v                                               v
              +-------------------+                           +-------------------+
              |    Next.js App    |                           |   Telegram Bot    |
              | (Landing/Beranda) |                           +---------+---------+
              +---------+---------+                                     | Webhook POST
                        |                                               v
                        |                                     +-------------------+
                        |                                     |   /api/telegram   |
                        +-----------------------+-------------+-------------------+
                                                |
                                                v
                               +---------------------------------+
                               |    Agentic Chat & Context       |
                               |    (gemini-3.5-flash-lite)      |
                               +----------------+----------------+
                                                | Function Calling / Tools Dispatch
                                                v
                               +---------------------------------+
                               |    Service Layer (TS/Actions)   |
                               |  - Transaction Service (Batch)  |
                               |  - Wallet Service (Transfer)    |
                               |  - Analytics Service            |
                               +----------------+----------------+
                                                |
                                                v
                               +---------------------------------+
                               |   Supabase PostgreSQL & RLS     |
                               +---------------------------------+
```

---

## Struktur Direktori

```text
pencatat-keuangan/
├── public/                       # Aset gambar, favicon, dan logo
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/
│   │   │   └── telegram/         # Webhook handler bot Telegram
│   │   ├── auth/
│   │   │   └── callback/         # Endpoint penukaran token PKCE & OTP Supabase
│   │   ├── beranda/              # Dashboard utama setelah masuk
│   │   ├── chat/                 # Antarmuka web asisten AI Dompi
│   │   ├── dompet/               # Manajemen dompet & rekening bank
│   │   ├── login/                # Form pendaftaran dan masuk akun
│   │   ├── panduan/              # Halaman panduan & contoh perintah
│   │   ├── pengaturan/           # Preferensi profil & pairing Telegram
│   │   ├── transaksi/            # Riwayat mutasi & formulir transaksi
│   │   ├── globals.css           # Token desain & utilitas Neo-Brutalism
│   │   ├── layout.tsx            # Root layout & penyedia tema
│   │   └── page.tsx              # Landing page publik
│   ├── components/
│   │   ├── dashboard/            # Komponen kartu KPI, grafik, sidebar, mobile nav
│   │   ├── landing/              # Komponen landing page publik
│   │   ├── layout/               # Layout wrapper aplikasi
│   │   └── ui/                   # Komponen modal, toggle tema, & tombol
│   └── lib/
│       ├── auth.ts               # Helper sesi autentikasi pengguna
│       ├── gemini.ts             # Definisi tool calling & prompt AI Gemini
│       ├── services/             # Logika bisnis database
│       │   ├── agent-chat-service.ts  # Dispatcher multi-turn function calling
│       │   ├── analytics-service.ts   # Analisis Pareto & rasio tabungan
│       │   ├── telegram-service.ts    # Format pesan HTML & sanitasi bot
│       │   ├── transaction-service.ts # Mutasi transaksi & batch insert
│       │   └── wallet-service.ts      # Saldo real-time & transfer saldo
│       └── supabase/             # Inisialisasi client Supabase
├── .env.example                  # Template variabel lingkungan
├── next.config.ts                # Konfigurasi Next.js
├── package.json                  # Dependensi proyek
└── tsconfig.json                 # Konfigurasi TypeScript
```

---

## Prasyarat Sistem

* **Node.js**: Versi `18.18.0` atau yang lebih baru (disarankan Node.js 20 LTS).
* **Package Manager**: `npm`, `pnpm`, atau `yarn`.
* **Akun Supabase**: Database PostgreSQL dan layanan Auth ([supabase.com](https://supabase.com/)).
* **Google AI Studio API Key**: Kunci API untuk model Gemini 3.5 Flash Lite ([aistudio.google.com](https://aistudio.google.com/)).
* **Telegram Bot Token**: Didapat dari [@BotFather](https://t.me/botfather).

---

## Panduan Instalasi Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/dzulfikrinf/dompi-app.git
cd dompi-app
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Salin Variabel Lingkungan
```bash
cp .env.example .env.local
```
Sesuaikan nilai di `.env.local` dengan kredensial Supabase dan API Key Gemini Anda.

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka aplikasi di peramban Anda melalui [http://localhost:3000](http://localhost:3000).

### 5. Verifikasi Build & Lint
```bash
npm run lint
npm run build
```

---

## Konfigurasi Environment Variables

File `.env.local` membutuhkan konfigurasi berikut:

| Variabel | Wajib? | Keterangan |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Ya** | URL Project Supabase Anda (`https://<project-id>.supabase.co`). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Ya** | Anon / Public API Key Supabase untuk sisi client. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Ya** | Service Role Key Supabase untuk webhook Telegram dan migrasi background. |
| `GEMINI_API_KEY` | **Ya** | API Key Google Gemini untuk pemrosesan asisten cerdas. |
| `TELEGRAM_BOT_TOKEN` | Opsional | Token Bot Telegram dari [@BotFather](https://t.me/botfather). |
| `TELEGRAM_WEBHOOK_SECRET` | Opsional | Token rahasia acak untuk memvalidasi request resmi dari Telegram. |

---

## Panduan Integrasi Telegram Multi-User

Dompi mendukung penghubungan akun Telegram secara otomatis untuk banyak pengguna tanpa perlu mengatur konfigurasi manual per user:

1. **Buat Bot di BotFather**:
   * Buka [@BotFather](https://t.me/botfather) di Telegram dan jalankan perintah `/newbot`.
   * Masukkan nama dan username bot (misalnya `@dompi_keuangan_bot`).
   * Salin token bot yang diberikan ke variabel `TELEGRAM_BOT_TOKEN`.

2. **Daftarkan Webhook Telegram**:
   Jalankan perintah berikut menggunakan domain publik aplikasi Anda (misal domain Vercel):
   ```bash
   curl -F "url=https://domain-anda.vercel.app/api/telegram" \
        -F "secret_token=TELEGRAM_WEBHOOK_SECRET_ANDA" \
        https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook
   ```

3. **Hubungkan Akun Melalui Web Dompi**:
   * Masuk ke web Dompi dan buka menu **Pengaturan** (`/pengaturan`).
   * Klik tombol **Hubungkan ke Telegram**.
   * Sistem akan menghasilkan tautan unik berformat `/start <token>`.
   * Klik tautan tersebut untuk membuka bot di Telegram dan klik tombol *Start*. Akun Telegram Anda akan langsung terhubung secara aman dengan akun Dompi Anda.

---

## Contoh Percakapan & Perintah Alami

Dompi memahami bahasa sehari-hari secara fleksibel:

### 1. Pencatatan Transaksi Tunggal & Jamak
* *"Makan siang ayam geprek 22rb pake Tunai"*
* *"Beli pulsa 50rb bca, bensin 30rb tunai, parkir 2rb"* (Mencatat 3 pengeluaran sekaligus)
* *"Terima transfer honor project 1.5jt masuk rekening Mandiri"*

### 2. Transfer Saldo Antar-Dompet
* *"Transfer 250rb dari rekening BCA ke ShopeePay"*
* *"Pindahkan 500rb dari Mandiri ke Tunai"*

### 3. Koreksi & Saldo Riil
* *"Ubah saldo Tunai jadi 150rb"*
* *"Tambah saldo BCA 1.000.000"*
* *"Hapus pengeluaran parkir tadi"*
* *"Batalkan transaksi terakhir"*

### 4. Ringkasan & Analisis Finansial
* *"Berapa sisa uangku di semua dompet?"*
* *"Rekap pengeluaran bulan ini"*
* *"Bantu audit keuangan saya, pos mana yang paling boros?"*

---

## Lisensi

Proyek ini dikembangkan di bawah lisensi [MIT](LICENSE). Terbuka untuk digunakan dan disesuaikan demi kebutuhan pencatatan keuangan pribadi yang lebih baik.
