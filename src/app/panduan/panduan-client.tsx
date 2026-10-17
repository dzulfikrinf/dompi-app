'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/layout/app-layout'
import {
  Search,
  Sparkles,
  Copy,
  Check,
  Send,
  Wallet,
  Lightbulb,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Coins,
  Calendar,
  ArrowRight,
  Zap,
  Repeat,
  ShieldAlert,
  BarChart2,
} from 'lucide-react'

type CategoryKey = 'all' | 'transaksi' | 'dompet' | 'analisis' | 'koreksi'

type CommandItem = {
  id: string
  category: 'transaksi' | 'dompet' | 'analisis' | 'koreksi'
  categoryLabel: string
  title: string
  prompt: string
  explanation: string
  badge: string
}

const HOW_TO_STEPS = [
  {
    step: '01',
    title: 'Atur Saldo Riil Dompet',
    category: 'DOMPET',
    badgeColor: 'bg-[#FFE600]',
    description:
      'Buka menu Dompet dan sesuaikan saldo awal dompet Cash dan Rekening Utama agar persis sama dengan uang fisik dan saldo m-Banking Anda saat ini.',
    actionLabel: 'Atur Dompet Sekarang',
    actionHref: '/dompet',
    icon: Wallet,
  },
  {
    step: '02',
    title: 'Hubungkan ke Telegram',
    category: 'INTEGRASI',
    badgeColor: 'bg-[#00F0FF]',
    description:
      'Buka menu Pengaturan, klik "Hubungkan ke Telegram", lalu tekan tombol START di @dompi25_bot. Anda bisa langsung mencatat via chat HP tanpa repot buka web.',
    actionLabel: 'Buka Pengaturan',
    actionHref: '/pengaturan',
    icon: Send,
  },
  {
    step: '03',
    title: 'Catat Transaksi Sekaligus',
    category: 'CHAT CATAT',
    badgeColor: 'bg-[#00FF66]',
    description:
      'Tinggalkan form kaku! Cukup ketik santai: "Makan siang 25rb Cash dan bensin 35rb Rekening". Dompi otomatis mengelompokkan kategori dan memotong saldo.',
    actionLabel: 'Coba di Chat',
    actionHref: '/chat?q=Makan%20siang%2025rb%20Cash%20dan%20beli%20bensin%2035rb%20Rekening',
    icon: Zap,
  },
  {
    step: '04',
    title: 'Transfer Saldo / Tarik Tunai',
    category: 'TRANSFER',
    badgeColor: 'bg-[#FFD1DC]',
    description:
      'Saat ambil uang di ATM atau pindah saldo antar-rekening, cukup ketik: "Pindahin 200rb dari Rekening Utama ke Cash". Saldo kedua dompet otomatis seimbang.',
    actionLabel: 'Coba Perintah Transfer',
    actionHref: '/chat?q=Pindahin%20200rb%20dari%20Rekening%20Utama%20ke%20Cash',
    icon: Repeat,
  },
  {
    step: '05',
    title: 'Koreksi & Batalkan Catatan',
    category: 'KOREKSI',
    badgeColor: 'bg-[#FFE600]',
    description:
      'Uang fisik selisih karena lupa dicatat? Ketik: "Koreksi saldo Cash asliku jadi 75.000". Salah catat? Cukup ketik: "Hapus transaksi bakso tadi".',
    actionLabel: 'Coba Koreksi Saldo',
    actionHref: '/chat?q=Koreksi%20saldo%20Cash%20asliku%20sekarang%20jadi%2075.000',
    icon: ShieldAlert,
  },
  {
    step: '06',
    title: 'Audit Otonom Pareto 80/20',
    category: 'ANALISIS AI',
    badgeColor: 'bg-[#00F0FF]',
    description:
      'Kapan pun Anda ingin mengevaluasi arus kas, ketik: "Analisis keuanganku bulan ini, aku boncos di pos apa aja?". Dompi langsung membeberkan pos paling boros.',
    actionLabel: 'Minta Analisis AI',
    actionHref: '/chat?q=Analisis%20keuanganku%20bulan%20ini,%20aku%20boncos%20di%20pos%20apa%20aja%3F',
    icon: BarChart2,
  },
]

const COMMANDS: CommandItem[] = [
  // Transaksi
  {
    id: 'trx-1',
    category: 'transaksi',
    categoryLabel: 'Pencatatan Transaksi',
    title: 'Multi-Transaksi Sekaligus (Pengeluaran Jamak)',
    prompt: 'Tadi makan siang soto 25rb Cash dan beli bensin 35rb Rekening Utama',
    explanation:
      'Dompi akan membedah kalimat ini menjadi 2 catatan pengeluaran berbeda, mengelompokkan kategori secara otomatis, dan memotong saldo dari masing-masing dompet yang disebutkan.',
    badge: 'Multi-Transaksi',
  },
  {
    id: 'trx-2',
    category: 'transaksi',
    categoryLabel: 'Pencatatan Transaksi',
    title: 'Pemasukan / Gaji Masuk',
    prompt: 'Gajian masuk 8.500.000 ke Rekening Utama dari kantor',
    explanation:
      'Mencatat transaksi bertipe pemasukan, otomatis memasukkan kategori Gaji/Pendapatan, dan menambahkan saldo pada dompet Rekening Utama.',
    badge: 'Pemasukan',
  },
  {
    id: 'trx-3',
    category: 'transaksi',
    categoryLabel: 'Pencatatan Transaksi',
    title: 'Pengeluaran Rutin & Tagihan',
    prompt: 'Kemarin bayar tagihan wifi 350k dan beli pulsa 50k pakai Rekening Utama',
    explanation:
      'Dompi mengenali kata "kemarin" dan otomatis menyetel tanggal transaksi ke 1 hari sebelum hari ini.',
    badge: 'Tanggal Alami',
  },
  {
    id: 'trx-4',
    category: 'transaksi',
    categoryLabel: 'Pencatatan Transaksi',
    title: 'Pengeluaran Harian Santai',
    prompt: 'Beli kopi susu 18rb dan parkir 2rb Cash',
    explanation:
      'Mencatat 2 pengeluaran harian sekaligus pada dompet Cash secara otomatis tanpa perlu klik tombol formulir berkali-kali.',
    badge: 'Pengeluaran',
  },

  // Dompet
  {
    id: 'wallet-1',
    category: 'dompet',
    categoryLabel: 'Kelola Dompet & Saldo',
    title: 'Cek Total & Rincian Saldo',
    prompt: 'Saldo di semua dompetku sekarang ada berapa aja?',
    explanation:
      'Dompi menghitung seluruh mutasi aktif dan menyajikan ringkasan saldo riil untuk setiap dompet (Cash, Rekening, dll) serta total kekayaan bersihmu.',
    badge: 'Cek Saldo',
  },
  {
    id: 'wallet-2',
    category: 'dompet',
    categoryLabel: 'Kelola Dompet & Saldo',
    title: 'Transfer Saldo Antar-Dompet / Tarik Tunai',
    prompt: 'Pindahin 200rb dari Rekening Utama ke Cash',
    explanation:
      'Melakukan mutasi internal: membuat pengeluaran transfer di Rekening Utama dan pemasukan transfer di Cash sehingga total kekayaanmu tetap seimbang.',
    badge: 'Transfer Saldo',
  },
  {
    id: 'wallet-3',
    category: 'dompet',
    categoryLabel: 'Kelola Dompet & Saldo',
    title: 'Koreksi Saldo Opname (Penyesuaian Fisik)',
    prompt: 'Koreksi saldo Cash asliku sekarang jadi 75.000',
    explanation:
      'Jika uang di dompet fisikmu selisih, Dompi otomatis menghitung selisihnya dan membuat entri rekonsiliasi agar saldo sistem persis sama dengan uang fisikmu.',
    badge: 'Koreksi Saldo',
  },

  // Analisis
  {
    id: 'analytics-1',
    category: 'analisis',
    categoryLabel: 'Analisis & Evaluasi',
    title: 'Analisis Pos Boros & Evaluasi 80/20',
    prompt: 'Analisis keuanganku bulan ini, aku boncos di pos apa aja?',
    explanation:
      'Menganalisis pengeluaran dengan hukum Pareto 80/20 untuk mendeteksi 20% pos belanja yang menghabiskan 80% uangmu, rasio tabungan, dan saran perbaikan.',
    badge: 'Analisis Pareto',
  },
  {
    id: 'analytics-2',
    category: 'analisis',
    categoryLabel: 'Analisis & Evaluasi',
    title: 'Kalkulasi Arus Kas & Burn Rate Harian',
    prompt: 'Hitung arus kas bersih dan rata-rata pengeluaran harianku bulan ini',
    explanation:
      'Menyajikan total pemasukan vs pengeluaran, surplus/defisit bersih, serta estimasi rata-rata pengeluaran per hari.',
    badge: 'Cash Flow',
  },
  {
    id: 'analytics-3',
    category: 'analisis',
    categoryLabel: 'Analisis & Evaluasi',
    title: 'Konsultasi & Tips Keuangan Pribadi',
    prompt: 'Gimana tips mengatur budget keuangan pribadi kalau gajiku 5 juta?',
    explanation:
      'Dompi bertindak sebagai perencana keuangan bersahabat yang memberikan formula alokasi budget (seperti 50/30/20) yang realistis.',
    badge: 'Tips Finansial',
  },

  // Koreksi
  {
    id: 'fix-1',
    category: 'koreksi',
    categoryLabel: 'Koreksi & Pembatalan',
    title: 'Hapus Transaksi Terakhir',
    prompt: 'Hapus transaksi makan siang yang barusan dicatat dong',
    explanation:
      'Dompi mencari transaksi paling terakhir yang sesuai dengan deskripsi tersebut dan melakukan soft-delete agar tidak lagi memotong saldo.',
    badge: 'Hapus Transaksi',
  },
  {
    id: 'fix-2',
    category: 'koreksi',
    categoryLabel: 'Koreksi & Pembatalan',
    title: 'Ubah Nominal Transaksi',
    prompt: 'Ubah nominal transaksi bensin tadi jadi 40.000 ya',
    explanation:
      'Dompi memperbarui nominal transaksi yang dimaksud dan otomatis menyesuaikan kembali saldo dompet terkait.',
    badge: 'Ubah Data',
  },
]

export default function PanduanClient({ userEmail }: { userEmail?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Ignore copy error
    }
  }

  const filteredCommands = useMemo(() => {
    return COMMANDS.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      const matchSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.prompt.toLowerCase().includes(query) ||
        item.explanation.toLowerCase().includes(query) ||
        item.badge.toLowerCase().includes(query)
      return matchCategory && matchSearch
    })
  }, [selectedCategory, searchQuery])

  return (
    <AppLayout currentPath="/panduan" userEmail={userEmail}>
      <div className="max-w-5xl mx-auto space-y-8 text-zinc-900 dark:text-zinc-100 pb-16">
        {/* 1. Header Hero Banner Neo-Brutalist */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#121212] bg-[#FFE600] text-[#121212] p-6 sm:p-10 shadow-brutal-xl">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider bg-white text-[#121212] border-2 border-[#121212] shadow-brutal-sm">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>PANDUAN & PUSAT PERINTAH CEPAT</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-[#121212] leading-[1.08]">
              Cara Berinteraksi dengan Dompi.
            </h1>

            <p className="text-xs sm:text-base text-[#121212]/90 font-medium leading-relaxed">
              Dompi mengerti bahasa Indonesia sehari-hari. Anda tidak perlu repot menghafal format kaku — cukup chat santai seperti mengobrol dengan teman. Perintah ini berlaku di <strong className="font-extrabold underline decoration-2">Web Chat Dompi</strong> maupun <strong className="font-extrabold underline decoration-2">Bot Telegram @dompi25_bot</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-[#121212] text-white hover:bg-zinc-800 text-xs sm:text-sm font-display font-black shadow-brutal btn-brutal transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                <span>Buka Chat Dompi</span>
              </Link>
              <Link
                href="/pengaturan"
                className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-white text-[#121212] hover:bg-zinc-100 border-2 border-[#121212] text-xs sm:text-sm font-display font-extrabold shadow-brutal btn-brutal transition cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Hubungkan Bot Telegram</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. PANDUAN LANGKAH CARA PAKAI DOMPI (6 STEP CARDS) */}
        <section className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-6 sm:p-8 shadow-brutal space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-display font-black uppercase tracking-wider bg-[#00F0FF] text-[#121212] border border-[#121212] mb-1.5 shadow-2xs">
                <span>PANDUAN PEMULA</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                Cara Memakai Dompi dari A sampai Z
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm font-medium">
              Ikuti 6 langkah praktis ini untuk mengubah kebiasaan catat uang jadi serba otomatis dan tanpa stres.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOW_TO_STEPS.map((stepItem) => {
              const IconComp = stepItem.icon
              return (
                <div
                  key={stepItem.step}
                  className="bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 rounded-2xl p-5 shadow-brutal-sm flex flex-col justify-between space-y-4 hover:translate-x-0.5 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black font-display text-zinc-400 dark:text-zinc-600">
                        {stepItem.step}
                      </span>
                      <span
                        className={`text-[10px] font-display font-black uppercase px-2 py-0.5 rounded-full border border-[#121212] text-[#121212] ${stepItem.badgeColor}`}
                      >
                        {stepItem.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100 shadow-2xs flex-shrink-0">
                        <IconComp className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <h3 className="text-sm font-extrabold font-display text-zinc-950 dark:text-zinc-50 leading-snug">
                        {stepItem.title}
                      </h3>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      {stepItem.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <Link
                      href={stepItem.actionHref}
                      className="inline-flex items-center gap-1 text-xs font-display font-bold text-zinc-900 dark:text-zinc-100 hover:text-[#006970] dark:hover:text-[#00F0FF] group transition"
                    >
                      <span>{stepItem.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 3. CHEAT SHEET COMMANDS & SEARCH */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-display font-black uppercase tracking-wider bg-[#FFE600] text-[#121212] border border-[#121212] mb-1 shadow-2xs">
                <span>CHEAT SHEET PERINTAH</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                Koleksi Contoh Perintah Siap Pakai
              </h2>
            </div>
            <span className="text-xs font-display font-bold text-zinc-500">
              Total {COMMANDS.length} contoh kalimat
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari perintah (misal: bensin, transfer, saldo, gajian, boncos, koreksi)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#FFE600] shadow-brutal-sm transition"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-display font-black whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-2 border-[#121212] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Semua Contoh ({COMMANDS.length})
            </button>
            <button
              onClick={() => setSelectedCategory('transaksi')}
              className={`px-4 py-2 rounded-xl text-xs font-display font-black whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'transaksi'
                  ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-2 border-[#121212] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Pencatatan Transaksi
            </button>
            <button
              onClick={() => setSelectedCategory('dompet')}
              className={`px-4 py-2 rounded-xl text-xs font-display font-black whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'dompet'
                  ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-2 border-[#121212] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Kelola Dompet & Saldo
            </button>
            <button
              onClick={() => setSelectedCategory('analisis')}
              className={`px-4 py-2 rounded-xl text-xs font-display font-black whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'analisis'
                  ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-2 border-[#121212] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Analisis & Evaluasi
            </button>
            <button
              onClick={() => setSelectedCategory('koreksi')}
              className={`px-4 py-2 rounded-xl text-xs font-display font-black whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'koreksi'
                  ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-2 border-[#121212] dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Koreksi & Pembatalan
            </button>
          </div>

          {/* 4. CARDS LIST */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            {filteredCommands.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-[#121212] dark:border-zinc-700 text-zinc-500 space-y-3 shadow-brutal">
                <HelpCircle className="w-10 h-10 mx-auto text-zinc-400 stroke-[2]" />
                <p className="text-sm font-extrabold font-display text-zinc-800 dark:text-zinc-200">
                  Tidak ada contoh yang cocok dengan pencarian Anda.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSearchQuery('')
                  }}
                  className="text-xs font-display font-bold text-zinc-900 dark:text-zinc-100 underline cursor-pointer"
                >
                  Reset pencarian
                </button>
              </div>
            ) : (
              filteredCommands.map((item) => {
                const isCopied = copiedId === item.id
                const chatUrl = `/chat?q=${encodeURIComponent(item.prompt)}`

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-brutal hover:translate-x-0.5 transition"
                  >
                    {/* Top Bar: Title & Badge */}
                    <div className="flex items-center justify-between gap-2 border-b-2 border-zinc-100 dark:border-zinc-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black font-display text-zinc-950 dark:text-zinc-50">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-black font-display px-2.5 py-0.5 rounded-full bg-[#FFE600] text-[#121212] border border-[#121212]">
                        {item.badge}
                      </span>
                    </div>

                    {/* Prompt Quote Bubble */}
                    <div className="relative group bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 rounded-xl p-3.5 sm:p-4 flex items-start justify-between gap-3 shadow-brutal-sm">
                      <p className="text-xs sm:text-sm font-mono font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed break-words">
                        &ldquo;{item.prompt}&rdquo;
                      </p>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleCopy(item.id, item.prompt)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 text-xs font-display font-bold text-zinc-900 dark:text-zinc-100 hover:bg-[#FFE600] hover:text-[#121212] transition cursor-pointer shadow-brutal-sm btn-brutal"
                          title="Salin kalimat"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={chatUrl}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFE600] text-[#121212] border-2 border-[#121212] text-xs font-display font-black hover:bg-[#ffe81a] transition shadow-brutal-sm btn-brutal"
                          title="Coba langsung di Chat Dompi"
                        >
                          <span>Coba</span>
                          <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
                        </Link>
                      </div>
                    </div>

                    {/* AI Explanation */}
                    <div className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                      <Sparkles className="w-4 h-4 text-[#006970] dark:text-[#00F0FF] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="leading-relaxed">{item.explanation}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>

        {/* 5. TIPS & TRIK BERBICARA DENGAN DOMPI */}
        <section className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-6 sm:p-8 space-y-5 shadow-brutal">
          <div className="flex items-center gap-2.5 text-sm sm:text-base font-black font-display border-b-2 border-zinc-100 dark:border-zinc-800 pb-3 text-zinc-950 dark:text-zinc-50">
            <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-[#121212] flex items-center justify-center text-[#121212] shadow-2xs">
              <Lightbulb className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>Tips Pintar Berbicara dengan Dompi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div className="p-4 rounded-2xl bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 space-y-2 shadow-brutal-sm">
              <div className="flex items-center gap-2 font-display font-extrabold text-sm text-zinc-950 dark:text-zinc-50">
                <Coins className="w-4 h-4 text-[#121212] dark:text-[#FFE600] stroke-[2.5]" />
                <span>Format Nominal Fleksibel</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Dompi mengenali singkatan nominal: <code className="px-1 py-0.5 rounded bg-[#FFE600] text-[#121212] border border-[#121212] font-mono font-bold">25rb</code>, <code className="px-1 py-0.5 rounded bg-[#00F0FF] text-[#121212] border border-[#121212] font-mono font-bold">50k</code>, <code className="px-1 py-0.5 rounded bg-[#00FF66] text-[#121212] border border-[#121212] font-mono font-bold">1.5jt</code>, maupun angka lengkap seperti <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono font-bold">25000</code>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 space-y-2 shadow-brutal-sm">
              <div className="flex items-center gap-2 font-display font-extrabold text-sm text-zinc-950 dark:text-zinc-50">
                <Calendar className="w-4 h-4 text-[#121212] dark:text-[#00F0FF] stroke-[2.5]" />
                <span>Pengenalan Waktu Alami</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sebutkan kata waktu seperti <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">kemarin</code>, <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">tadi pagi</code>, atau <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">hari Senin lalu</code> untuk tanggal transaksi lampau.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 space-y-2 shadow-brutal-sm">
              <div className="flex items-center gap-2 font-display font-extrabold text-sm text-zinc-950 dark:text-zinc-50">
                <Wallet className="w-4 h-4 text-[#121212] dark:text-[#00FF66] stroke-[2.5]" />
                <span>Nama Dompet Otomatis</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Sebutkan nama dompetmu di akhir kalimat (misal: <em>Cash</em>, <em>Rekening Utama</em>, <em>BCA</em>, <em>GoPay</em>). Jika tidak disebutkan, Dompi otomatis memakai dompet default.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 space-y-2 shadow-brutal-sm">
              <div className="flex items-center gap-2 font-display font-extrabold text-sm text-zinc-950 dark:text-zinc-50">
                <Send className="w-4 h-4 text-[#121212] dark:text-[#FFD1DC] stroke-[2.5]" />
                <span>Bot Telegram 24/7</span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Semua kalimat di halaman ini dapat Anda ketikkan langsung ke bot Telegram Dompi <strong className="font-bold underline">@dompi25_bot</strong> tanpa perlu membuka browser.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
