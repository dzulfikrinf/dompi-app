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
  badgeVariant?: 'blue' | 'emerald' | 'amber' | 'purple' | 'zinc'
}

const COMMANDS: CommandItem[] = [
  // Transaksi
  {
    id: 'trx-1',
    category: 'transaksi',
    categoryLabel: 'Pencatatan Transaksi',
    title: 'Multi-Transaksi Sekaligus (Pengeluaran Jamak)',
    prompt: 'Tadi makan siang soto 25rb Cash dan beli bensin 35rb Rekening Utama',
    explanation: 'Dompi akan membedah kalimat ini menjadi 2 catatan pengeluaran berbeda, mengelompokkan kategori secara otomatis, dan memotong saldo dari masing-masing dompet yang disebutkan.',
    badge: 'Multi-Transaksi',
    badgeVariant: 'purple',
  },
  {
    id: 'trx-2',
    category: 'transaksi',
    categoryLabel: 'Pencatatan Transaksi',
    title: 'Pemasukan / Gaji Masuk',
    prompt: 'Gajian masuk 8.500.000 ke Rekening Utama dari kantor',
    explanation: 'Mencatat transaksi bertipe pemasukan, otomatis memasukkan kategori Gaji/Pendapatan, dan menambahkan saldo pada dompet Rekening Utama.',
    badge: 'Pemasukan',
    badgeVariant: 'emerald',
  },
  {
    id: 'trx-3',
    category: 'transaksi',
    categoryLabel: 'Pencatatan Transaksi',
    title: 'Pengeluaran Rutin & Tagihan',
    prompt: 'Kemarin bayar tagihan wifi 350k dan beli pulsa 50k pakai Rekening Utama',
    explanation: 'Dompi mengenali kata "kemarin" dan otomatis menyetel tanggal transaksi ke 1 hari sebelum hari ini.',
    badge: 'Tanggal Alami',
    badgeVariant: 'blue',
  },
  {
    id: 'trx-4',
    category: 'transaksi',
    categoryLabel: 'Pencatatan Transaksi',
    title: 'Pengeluaran Harian Santai',
    prompt: 'Beli kopi susu 18rb dan parkir 2rb Cash',
    explanation: 'Mencatat 2 pengeluaran harian sekaligus pada dompet Cash secara otomatis tanpa perlu klik tombol formulir berkali-kali.',
    badge: 'Pengeluaran',
    badgeVariant: 'zinc',
  },

  // Dompet
  {
    id: 'wallet-1',
    category: 'dompet',
    categoryLabel: 'Kelola Dompet & Saldo',
    title: 'Cek Total & Rincian Saldo',
    prompt: 'Saldo di semua dompetku sekarang ada berapa aja?',
    explanation: 'Dompi menghitung seluruh mutasi aktif dan menyajikan ringkasan saldo riil untuk setiap dompet (Cash, Rekening, dll) serta total kekayaan bersihmu.',
    badge: 'Cek Saldo',
    badgeVariant: 'emerald',
  },
  {
    id: 'wallet-2',
    category: 'dompet',
    categoryLabel: 'Kelola Dompet & Saldo',
    title: 'Transfer Saldo Antar-Dompet / Tarik Tunai',
    prompt: 'Pindahin 200rb dari Rekening Utama ke Cash',
    explanation: 'Melakukan mutasi internal: membuat pengeluaran transfer di Rekening Utama dan pemasukan transfer di Cash sehingga total kekayaanmu tetap seimbang.',
    badge: 'Transfer Saldo',
    badgeVariant: 'blue',
  },
  {
    id: 'wallet-3',
    category: 'dompet',
    categoryLabel: 'Kelola Dompet & Saldo',
    title: 'Koreksi Saldo Opname (Penyesuaian Fisik)',
    prompt: 'Koreksi saldo Cash asliku sekarang jadi 75.000',
    explanation: 'Jika uang di dompet fisikmu selisih, Dompi otomatis menghitung selisihnya dan membuat entri rekonsiliasi agar saldo sistem persis sama dengan uang fisikmu.',
    badge: 'Koreksi Saldo',
    badgeVariant: 'amber',
  },

  // Analisis
  {
    id: 'analytics-1',
    category: 'analisis',
    categoryLabel: 'Analisis & Evaluasi',
    title: 'Analisis Pos Boros & Evaluasi 80/20',
    prompt: 'Analisis keuanganku bulan ini, aku boncos di pos apa aja?',
    explanation: 'Menganalisis pengeluaran dengan hukum Pareto 80/20 untuk mendeteksi 20% pos belanja yang menghabiskan 80% uangmu, rasio tabungan, dan saran perbaikan.',
    badge: 'Analisis Pareto',
    badgeVariant: 'purple',
  },
  {
    id: 'analytics-2',
    category: 'analisis',
    categoryLabel: 'Analisis & Evaluasi',
    title: 'Kalkulasi Arus Kas & Burn Rate Harian',
    prompt: 'Hitung arus kas bersih dan rata-rata pengeluaran harianku bulan ini',
    explanation: 'Menyajikan total pemasukan vs pengeluaran, surplus/defisit bersih, serta estimasi rata-rata pengeluaran per hari.',
    badge: 'Cash Flow',
    badgeVariant: 'blue',
  },
  {
    id: 'analytics-3',
    category: 'analisis',
    categoryLabel: 'Analisis & Evaluasi',
    title: 'Konsultasi & Tips Keuangan Pribadi',
    prompt: 'Gimana tips mengatur budget keuangan pribadi kalau gajiku 5 juta?',
    explanation: 'Dompi bertindak sebagai perencana keuangan bersahabat yang memberikan formula alokasi budget (seperti 50/30/20) yang realistis.',
    badge: 'Tips Finansial',
    badgeVariant: 'emerald',
  },

  // Koreksi
  {
    id: 'fix-1',
    category: 'koreksi',
    categoryLabel: 'Koreksi & Pembatalan',
    title: 'Hapus Transaksi Terakhir',
    prompt: 'Hapus transaksi makan siang yang barusan dicatat dong',
    explanation: 'Dompi mencari transaksi paling terakhir yang sesuai dengan deskripsi tersebut dan melakukan soft-delete agar tidak lagi memotong saldo.',
    badge: 'Hapus Transaksi',
    badgeVariant: 'amber',
  },
  {
    id: 'fix-2',
    category: 'koreksi',
    categoryLabel: 'Koreksi & Pembatalan',
    title: 'Ubah Nominal Transaksi',
    prompt: 'Ubah nominal transaksi bensin tadi jadi 40.000 ya',
    explanation: 'Dompi memperbarui nominal transaksi yang dimaksud dan otomatis menyesuaikan kembali saldo dompet terkait.',
    badge: 'Ubah Data',
    badgeVariant: 'zinc',
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
      //
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
      <div className="max-w-4xl mx-auto space-y-6 text-zinc-900 dark:text-zinc-100 pb-10">
        {/* 1. Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-zinc-200/50 dark:bg-zinc-800/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
              <span>Panduan & Cheat Sheet Interaktif</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Cara Berinteraksi dengan Dompi
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Dompi mengerti bahasa Indonesia sehari-hari. Anda tidak perlu repot mengetik format kaku — cukup chat santai seperti mengobrol dengan teman. Perintah ini berlaku di <strong className="text-zinc-900 dark:text-zinc-100">Web Chat Dompi</strong> maupun <strong className="text-zinc-900 dark:text-zinc-100">Bot Telegram</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Link
                href="/chat"
                className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Buka Chat Dompi</span>
              </Link>
              <Link
                href="/pengaturan"
                className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700/60 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Hubungkan ke Telegram</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Search & Category Filters */}
        <div className="space-y-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari contoh perintah (misal: bensin, transfer, saldo, gajian, boncos)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition shadow-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Semua Contoh ({COMMANDS.length})
            </button>
            <button
              onClick={() => setSelectedCategory('transaksi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'transaksi'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Pencatatan Transaksi
            </button>
            <button
              onClick={() => setSelectedCategory('dompet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'dompet'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Kelola Dompet & Saldo
            </button>
            <button
              onClick={() => setSelectedCategory('analisis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'analisis'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Analisis & Evaluasi
            </button>
            <button
              onClick={() => setSelectedCategory('koreksi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'koreksi'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Koreksi & Pembatalan
            </button>
          </div>
        </div>

        {/* 3. Cards List */}
        <div className="grid grid-cols-1 gap-3.5">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 space-y-2">
              <HelpCircle className="w-8 h-8 mx-auto text-zinc-400" />
              <p className="text-sm font-medium">Tidak ada contoh yang cocok dengan pencarian.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className="text-xs text-zinc-900 dark:text-zinc-100 underline cursor-pointer"
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
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition"
                >
                  {/* Top Bar: Title & Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                      {item.badge}
                    </span>
                  </div>

                  {/* Prompt Quote Bubble */}
                  <div className="relative group bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 rounded-xl p-3 sm:p-3.5 flex items-start justify-between gap-3">
                    <p className="text-xs sm:text-sm font-mono text-zinc-900 dark:text-zinc-100 leading-relaxed break-words">
                      &ldquo;{item.prompt}&rdquo;
                    </p>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleCopy(item.id, item.prompt)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer shadow-2xs"
                        title="Salin kalimat"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={chatUrl}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[11px] font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition shadow-2xs"
                        title="Coba langsung di Chat Dompi"
                      >
                        <span>Coba</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* AI Explanation */}
                  <div className="flex items-start gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{item.explanation}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 4. Tips & Trik Berinteraksi */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Tips Pintar Berbicara dengan Dompi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                <Coins className="w-3.5 h-3.5 text-zinc-500" />
                <span>Format Nominal Fleksibel</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Dompi mengenali singkatan nominal: <code className="text-zinc-800 dark:text-zinc-200">25rb</code>, <code className="text-zinc-800 dark:text-zinc-200">50k</code>, <code className="text-zinc-800 dark:text-zinc-200">1.5jt</code>, maupun angka lengkap seperti <code className="text-zinc-800 dark:text-zinc-200">25000</code>.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Pengenalan Waktu Alami</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Sebutkan kata waktu seperti <code className="text-zinc-800 dark:text-zinc-200">kemarin</code>, <code className="text-zinc-800 dark:text-zinc-200">tadi pagi</code>, atau <code className="text-zinc-800 dark:text-zinc-200">hari Senin lalu</code> untuk tanggal transaksi lampau.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                <Wallet className="w-3.5 h-3.5 text-zinc-500" />
                <span>Nama Dompet Otomatis</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Sebutkan nama dompetmu di akhir kalimat (misal: <em>Cash</em>, <em>Rekening Utama</em>, <em>BCA</em>, <em>GoPay</em>). Jika tidak disebutkan, Dompi otomatis memakai dompet default.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
                <Send className="w-3.5 h-3.5 text-zinc-500" />
                <span>Bot Telegram 24/7</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Semua kalimat di halaman ini dapat Anda ketikkan langsung ke bot Telegram Dompi tanpa perlu membuka browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
