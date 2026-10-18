'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  BarChart2,
  TrendingDown,
  Download,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  Plus,
  MessageSquare,
  Flame,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Zap,
  Lightbulb,
  Info,
} from 'lucide-react'
import AppLayout from '@/components/layout/app-layout'
import {
  FinancialAnalysisResult,
  AnalyticsPeriod,
} from '@/lib/services/analytics-service'
import { fetchFinancialAnalysisAction } from './actions'
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type LaporanClientProps = {
  initialAnalysis: FinancialAnalysisResult
  userEmail?: string
}

const PERIOD_OPTIONS: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: 'this_month', label: 'Bulan Ini' },
  { value: 'last_month', label: 'Bulan Lalu' },
  { value: 'last_30_days', label: '30 Hari Terakhir' },
  { value: 'last_7_days', label: '7 Hari Terakhir' },
  { value: 'all', label: 'Semua Waktu' },
]

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val)
}

type FinancialHealthLevel = {
  stage: 1 | 2 | 3 | 4 | 0
  tierName: string
  statusBadge: string
  headline: string
  deskripsi: string
  rekomendasiSingkat: string
  accentBg: string
  badgeBg: string
  badgeText: string
}

function getFinancialHealthLevel(
  arusKasBersih: number,
  rasioTabunganPersen: number,
  totalPemasukan: number,
  totalPengeluaran: number
): FinancialHealthLevel {
  if (totalPemasukan === 0 && totalPengeluaran === 0) {
    return {
      stage: 0,
      tierName: 'LEVEL 0 • NETRAL',
      statusBadge: 'BELUM ADA TRANSAKSI',
      headline: 'Belum Ada Mutasi di Periode Ini',
      deskripsi:
        'Catat transaksi pengeluaran atau pemasukanmu untuk mulai melihat analisis skor kesehatan finansial.',
      rekomendasiSingkat:
        'Mulai dengan mencatat pengeluaran harian lewat tombol catat cepat atau Chat Dompi.',
      accentBg: 'bg-zinc-100 dark:bg-zinc-900',
      badgeBg: 'bg-zinc-200 dark:bg-zinc-800',
      badgeText: 'text-zinc-800 dark:text-zinc-200',
    }
  }

  // 1. Defisit (Pengeluaran > Pemasukan)
  if (arusKasBersih < 0) {
    return {
      stage: 1,
      tierName: 'LEVEL 1 • KRITIS',
      statusBadge: 'ZONA DEFISIT',
      headline: 'Waduh, Pengeluaran Melebihi Pemasukan!',
      deskripsi: `Arus kasmu defisit ${formatRupiah(Math.abs(arusKasBersih))}. Uang keluar lebih kencang dibanding uang masuk.`,
      rekomendasiSingkat:
        'Segera rem belanja sekunder (hiburan/jajan) dan fokus pada kebutuhan pokok sampai akhir periode.',
      accentBg: 'bg-rose-50/70 dark:bg-rose-950/20',
      badgeBg: 'bg-[#FF4365]',
      badgeText: 'text-white',
    }
  }

  // 2. Waspada (Surplus tipis, tabungan < 10%)
  if (rasioTabunganPersen < 10) {
    return {
      stage: 2,
      tierName: 'LEVEL 2 • WASPADA',
      statusBadge: 'HATI-HATI: GAJI NUMPANG LEWAT',
      headline: 'Zona Waspada: Tabungan Masih Sangat Tipis!',
      deskripsi: `Arus kas masih surplus, tapi tabungan yang tersimpan hanya ${rasioTabunganPersen}%. Pengeluaran mendadak bisa membuatmu defisit.`,
      rekomendasiSingkat:
        'Cek pos belanja harian dan upayakan menyisihkan minimal 10-15% langsung saat ada uang masuk.',
      accentBg: 'bg-amber-50/70 dark:bg-amber-950/20',
      badgeBg: 'bg-[#FF9900]',
      badgeText: 'text-zinc-950',
    }
  }

  // 3. Stabil (Tabungan 10% - 29%)
  if (rasioTabunganPersen < 30) {
    return {
      stage: 3,
      tierName: 'LEVEL 3 • STABIL',
      statusBadge: 'AMAN TERKENDALI',
      headline: 'Kondisi Keuangan Aman & Terkendali!',
      deskripsi: `Keren! Kamu berhasil menyisihkan ${rasioTabunganPersen}% dari total pemasukan periode ini ke tabungan.`,
      rekomendasiSingkat:
        'Pertahankan disiplin ini dan coba alokasikan sebagian simpanan ke dompet dana darurat.',
      accentBg: 'bg-yellow-50/70 dark:bg-yellow-950/20',
      badgeBg: 'bg-[#FFE600]',
      badgeText: 'text-zinc-950',
    }
  }

  // 4. Prima (Tabungan >= 30%)
  return {
    stage: 4,
    tierName: 'LEVEL 4 • PRIMA',
    statusBadge: 'SULTAN: SANGAT SEHAT',
    headline: 'Luar Biasa, Keuanganmu Sangat Sehat & Prima!',
    deskripsi: `Juara! Rasio tabunganmu mencapai ${rasioTabunganPersen}%. Pengeluaran sangat terkontrol dan arus kas surplus ${formatRupiah(arusKasBersih)}.`,
    rekomendasiSingkat:
      'Manajemen uangmu luar biasa! Dana tabungan siap dialokasikan untuk target impian jangka panjang.',
    accentBg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
    badgeBg: 'bg-[#00FF66]',
    badgeText: 'text-zinc-950',
  }
}

export default function LaporanClient({
  initialAnalysis,
  userEmail,
}: LaporanClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('this_month')
  const [analysis, setAnalysis] = useState<FinancialAnalysisResult>(initialAnalysis)
  const [isPending, startTransition] = useTransition()

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    if (period === selectedPeriod) return
    setSelectedPeriod(period)

    startTransition(async () => {
      const res = await fetchFinancialAnalysisAction(period)
      if (res.success && res.data) {
        setAnalysis(res.data)
      }
    })
  }

  const handleExportCsv = () => {
    if (!analysis.daftarTransaksi || analysis.daftarTransaksi.length === 0) {
      alert('Tidak ada transaksi pada periode ini untuk diekspor.')
      return
    }

    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Dompet', 'Nominal (Rp)']
    const rows = analysis.daftarTransaksi.map((t) => [
      t.id,
      `"${t.tanggal}"`,
      `"${t.tipe}"`,
      `"${(t.kategori || '').replace(/"/g, '""')}"`,
      `"${(t.deskripsi || '').replace(/"/g, '""')}"`,
      `"${(t.dompet || '').replace(/"/g, '""')}"`,
      t.nominal,
    ])

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    const cleanPeriodName = analysis.periodeLabel.replace(/[\s\/]/g, '-')
    link.setAttribute('download', `Laporan-Keuangan-Dompi-${cleanPeriodName}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const isSurplus = analysis.arusKasBersih >= 0
  const savingsRate = analysis.rasioTabunganPersen
  const chartData = analysis.trenHarian || []
  const healthLevel = getFinancialHealthLevel(
    analysis.arusKasBersih,
    analysis.rasioTabunganPersen,
    analysis.totalPemasukan,
    analysis.totalPengeluaran
  )

  return (
    <AppLayout currentPath="/laporan" userEmail={userEmail}>
      <div className="max-w-6xl mx-auto space-y-6 text-zinc-900 dark:text-zinc-100 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#121212] dark:border-zinc-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE600] text-[#121212] flex items-center justify-center border-2 border-[#121212] shadow-brutal flex-shrink-0">
              <BarChart2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                Laporan Keuangan
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
                Analisis mendalam arus kas, kebiasaan belanja, dan ekspor pembukuan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={isPending || !analysis.daftarTransaksi?.length}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] font-display font-extrabold border-2 border-[#121212] shadow-brutal btn-brutal transition cursor-pointer text-xs sm:text-sm disabled:opacity-40"
              title="Unduh pembukuan format CSV / Excel"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

        {/* Period Selector Bar */}
        <div className="flex items-center justify-between flex-wrap gap-2.5">
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-[#FBF9F4] dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 max-w-full">
            {PERIOD_OPTIONS.map((opt) => {
              const active = selectedPeriod === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => handlePeriodChange(opt.value)}
                  disabled={isPending}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-display font-bold rounded-xl transition cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 text-xs font-display font-bold text-zinc-500 dark:text-zinc-400">
            {isPending ? (
              <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memperbarui data...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Periode: <strong>{analysis.periodeLabel}</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* 4 Highlight Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Arus Kas Bersih */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-5 shadow-brutal flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Arus Kas Bersih
              </span>
              <span
                className={`text-[10px] font-display font-black px-2 py-0.5 rounded-full border border-[#121212] uppercase ${
                  isSurplus
                    ? 'bg-[#00FF66] text-[#121212]'
                    : 'bg-[#FF4365] text-white'
                }`}
              >
                {isSurplus ? 'Surplus' : 'Defisit'}
              </span>
            </div>
            <div>
              <div
                className={`text-2xl sm:text-3xl font-black font-display tracking-tight tabular-nums ${
                  isSurplus ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#FF4365]'
                }`}
              >
                {isSurplus ? '+' : ''}
                {formatRupiah(analysis.arusKasBersih)}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                Masuk {formatRupiah(analysis.totalPemasukan)} • Keluar {formatRupiah(analysis.totalPengeluaran)}
              </p>
            </div>
          </div>

          {/* 2. Rasio Tabungan */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-5 shadow-brutal flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Rasio Tabungan
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#FFE600] border border-[#121212] flex items-center justify-center text-[#121212]">
                <PiggyBank className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-display tracking-tight tabular-nums text-zinc-950 dark:text-zinc-50">
                {savingsRate}%
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                {savingsRate >= 20
                  ? 'Kondisi sehat! Lebih dari 20% tersimpan.'
                  : savingsRate >= 0
                  ? 'Arus kas positif, bisa ditingkatkan lagi.'
                  : 'Pengeluaran melebihi pemasukan bulan ini.'}
              </p>
            </div>
          </div>

          {/* 3. Pengeluaran Harian */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-5 shadow-brutal flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Ritme Belanja Harian
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#00F0FF] border border-[#121212] flex items-center justify-center text-[#121212]">
                <Flame className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-display tracking-tight tabular-nums text-zinc-950 dark:text-zinc-50">
                {formatRupiah(analysis.rataRataPengeluaranHarian)}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                Rata-rata keluar per hari ({analysis.jumlahHariDalamPeriode} hari aktif)
              </p>
            </div>
          </div>

          {/* 4. Perbandingan Bulan Lalu (MoM) */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-5 shadow-brutal flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Tren vs Bulan Lalu
              </span>
              {analysis.perbandinganBulanSebelumnya ? (
                analysis.perbandinganBulanSebelumnya.trenPengeluaran === 'turun' ? (
                  <span className="text-[10px] font-display font-black px-2 py-0.5 rounded-full bg-[#00FF66] text-[#121212] border border-[#121212]">
                    Lebih Hemat
                  </span>
                ) : analysis.perbandinganBulanSebelumnya.trenPengeluaran === 'naik' ? (
                  <span className="text-[10px] font-display font-black px-2 py-0.5 rounded-full bg-[#FF4365] text-white border border-[#121212]">
                    Meningkat
                  </span>
                ) : (
                  <span className="text-[10px] font-display font-black px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-[#121212]">
                    Stabil
                  </span>
                )
              ) : (
                <span className="text-[10px] font-display font-bold text-zinc-400">
                  Data Baru
                </span>
              )}
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-display tracking-tight tabular-nums text-zinc-950 dark:text-zinc-50 flex items-center gap-1">
                {analysis.perbandinganBulanSebelumnya ? (
                  <>
                    {analysis.perbandinganBulanSebelumnya.trenPengeluaran === 'turun' ? (
                      <ArrowDownRight className="w-6 h-6 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6 text-[#FF4365] stroke-[3]" />
                    )}
                    <span>
                      {analysis.perbandinganBulanSebelumnya.deltaPengeluaranPersen > 0 ? '+' : ''}
                      {analysis.perbandinganBulanSebelumnya.deltaPengeluaranPersen}%
                    </span>
                  </>
                ) : (
                  <span className="text-lg text-zinc-400 font-bold">100% Terpantau</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                {analysis.perbandinganBulanSebelumnya
                  ? `Dibandingkan ${analysis.perbandinganBulanSebelumnya.periodeSebelumnyaLabel}`
                  : 'Belanja tercatat rapi secara real-time'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Level & Kesehatan Keuangan Card (Eye-catching) */}
        <div className={`border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-5 sm:p-7 shadow-brutal space-y-5 transition-all ${healthLevel.accentBg}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#121212]/15 dark:border-zinc-700/60">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl border-2 border-[#121212] flex items-center justify-center text-[#121212] shadow-brutal-sm shrink-0 ${healthLevel.badgeBg}`}>
                {healthLevel.stage === 4 && <Zap className="w-6 h-6 stroke-[2.5]" />}
                {healthLevel.stage === 3 && <ShieldCheck className="w-6 h-6 stroke-[2.5]" />}
                {healthLevel.stage === 2 && <AlertTriangle className="w-6 h-6 stroke-[2.5]" />}
                {healthLevel.stage === 1 && <AlertOctagon className="w-6 h-6 stroke-[2.5]" />}
                {healthLevel.stage === 0 && <Info className="w-6 h-6 stroke-[2.5]" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black font-display uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    {healthLevel.tierName}
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#121212] dark:bg-zinc-400" />
                  <span className="text-[11px] font-bold font-display text-zinc-500">
                    Periode {analysis.periodeLabel}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50 mt-0.5">
                  {healthLevel.headline}
                </h2>
              </div>
            </div>

            <div className="self-start sm:self-auto shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 border-[#121212] font-display font-black text-xs sm:text-sm uppercase tracking-wide shadow-brutal-sm ${healthLevel.badgeBg} ${healthLevel.badgeText}`}>
                {healthLevel.statusBadge}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2 space-y-2.5">
              <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {healthLevel.deskripsi}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border-2 border-[#121212] dark:border-zinc-700 text-xs font-medium text-zinc-800 dark:text-zinc-200 shadow-brutal-sm">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span><strong className="font-bold font-display">Saran Dompi:</strong> {healthLevel.rekomendasiSingkat}</span>
              </div>
            </div>

            {/* Quick Metrics highlight */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-3.5 shadow-brutal-sm flex items-center justify-around text-center">
              <div>
                <p className="text-[10px] font-display font-bold uppercase text-zinc-500">Arus Kas</p>
                <p className={`text-sm sm:text-base font-black font-display mt-0.5 ${analysis.arusKasBersih >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {analysis.arusKasBersih >= 0 ? '+' : ''}{formatRupiah(analysis.arusKasBersih)}
                </p>
              </div>
              <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800" />
              <div>
                <p className="text-[10px] font-display font-bold uppercase text-zinc-500">Rasio Tabungan</p>
                <p className={`text-sm sm:text-base font-black font-display mt-0.5 ${analysis.rasioTabunganPersen >= 20 ? 'text-emerald-700 dark:text-emerald-400' : analysis.rasioTabunganPersen >= 0 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  {analysis.rasioTabunganPersen}%
                </p>
              </div>
            </div>
          </div>

          {/* 4-Stage Visual Level Indicator */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] font-display font-bold text-zinc-500 mb-1.5 px-0.5">
              <span>INDIKATOR LEVEL KEUANGAN</span>
              <span>{healthLevel.stage === 0 ? 'BELUM AKTIF' : `LEVEL ${healthLevel.stage} DARI 4`}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Stage 1: Defisit */}
              <div className={`p-2.5 rounded-xl border-2 border-[#121212] transition-all flex items-center justify-between ${healthLevel.stage === 1 ? 'bg-[#FF4365] text-white shadow-brutal-sm' : 'bg-white/60 dark:bg-zinc-900/60 text-zinc-400 dark:text-zinc-600 border-dashed'}`}>
                <span className="font-display font-black text-xs">1. Defisit</span>
                {healthLevel.stage === 1 && (
                  <span className="text-[9px] bg-[#121212] text-white px-1.5 py-0.5 rounded font-black font-display">
                    POSISI KAMU
                  </span>
                )}
              </div>

              {/* Stage 2: Waspada */}
              <div className={`p-2.5 rounded-xl border-2 border-[#121212] transition-all flex items-center justify-between ${healthLevel.stage === 2 ? 'bg-[#FF9900] text-zinc-950 shadow-brutal-sm' : 'bg-white/60 dark:bg-zinc-900/60 text-zinc-400 dark:text-zinc-600 border-dashed'}`}>
                <span className="font-display font-black text-xs">2. Waspada</span>
                {healthLevel.stage === 2 && (
                  <span className="text-[9px] bg-[#121212] text-white px-1.5 py-0.5 rounded font-black font-display">
                    POSISI KAMU
                  </span>
                )}
              </div>

              {/* Stage 3: Stabil */}
              <div className={`p-2.5 rounded-xl border-2 border-[#121212] transition-all flex items-center justify-between ${healthLevel.stage === 3 ? 'bg-[#FFE600] text-zinc-950 shadow-brutal-sm' : 'bg-white/60 dark:bg-zinc-900/60 text-zinc-400 dark:text-zinc-600 border-dashed'}`}>
                <span className="font-display font-black text-xs">3. Stabil</span>
                {healthLevel.stage === 3 && (
                  <span className="text-[9px] bg-[#121212] text-white px-1.5 py-0.5 rounded font-black font-display">
                    POSISI KAMU
                  </span>
                )}
              </div>

              {/* Stage 4: Prima */}
              <div className={`p-2.5 rounded-xl border-2 border-[#121212] transition-all flex items-center justify-between ${healthLevel.stage === 4 ? 'bg-[#00FF66] text-zinc-950 shadow-brutal-sm' : 'bg-white/60 dark:bg-zinc-900/60 text-zinc-400 dark:text-zinc-600 border-dashed'}`}>
                <span className="font-display font-black text-xs">4. Prima</span>
                {healthLevel.stage === 4 && (
                  <span className="text-[9px] bg-[#121212] text-white px-1.5 py-0.5 rounded font-black font-display">
                    POSISI KAMU
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tren Arus Kas Harian (Recharts) */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-5 sm:p-6 shadow-brutal space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                Grafik Ritme Uang Masuk & Keluar
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Fluktuasi harian selama periode {analysis.periodeLabel}.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-display font-bold">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00F0FF]/20 text-cyan-800 dark:text-cyan-300 border border-[#121212] dark:border-zinc-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#00F0FF]" />
                <span>Pemasukan</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF4365]/20 text-rose-800 dark:text-rose-300 border border-[#121212] dark:border-zinc-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#FF4365]" />
                <span>Pengeluaran</span>
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="laporanIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="laporanExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4365" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF4365" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'var(--font-space-grotesk)' }}
                    dy={10}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const inc = Number(payload[0]?.value || 0)
                        const exp = Number(payload[1]?.value || 0)
                        return (
                          <div className="bg-white dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 p-3 rounded-xl shadow-brutal-sm text-xs font-display">
                            <p className="font-black border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-1.5 text-zinc-950 dark:text-zinc-50">
                              Tanggal {label}
                            </p>
                            <div className="space-y-1">
                              <p className="text-cyan-700 dark:text-cyan-400 font-bold">
                                Masuk: {formatRupiah(inc)}
                              </p>
                              <p className="text-rose-600 dark:text-rose-400 font-bold">
                                Keluar: {formatRupiah(exp)}
                              </p>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pemasukan"
                    stroke="#006970"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#laporanIncomeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="pengeluaran"
                    stroke="#FF4365"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#laporanExpenseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <FileSpreadsheet className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-display font-bold">Belum ada grafik transaksi pada periode ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Section: Pos Terboros & 5 Transaksi Terbesar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Kolom Kiri: Pos Pengeluaran Paling Dominan (Pareto 80/20) */}
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-5 sm:p-6 shadow-brutal space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FF4365] text-white border border-[#121212] flex items-center justify-center font-display font-black text-xs">
                    %
                  </div>
                  <h2 className="text-base font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                    Pos Paling Banyak Menyerap Uang
                  </h2>
                </div>
                <span className="text-[10px] font-display font-black px-2 py-0.5 rounded-full bg-[#FFE600] text-[#121212] border border-[#121212]">
                  Audit 80/20
                </span>
              </div>

              {analysis.kategoriPengeluaran.length > 0 ? (
                <div className="space-y-3.5">
                  {analysis.kategoriPengeluaran.slice(0, 5).map((kat, idx) => (
                    <div key={kat.kategori} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-display font-bold">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-[#121212] text-white dark:bg-zinc-700 text-[10px] flex items-center justify-center font-black">
                            {idx + 1}
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-200">{kat.kategori}</span>
                          <span className="text-zinc-400 text-[11px] font-normal">
                            ({kat.jumlahTransaksi}x)
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums font-black text-zinc-900 dark:text-zinc-100">
                            {formatRupiah(kat.nominal)}
                          </span>
                          <span className="text-zinc-500 font-extrabold w-10 text-right">
                            {kat.persentase}%
                          </span>
                        </div>
                      </div>

                      {/* Bar Visual */}
                      <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-[#121212] dark:border-zinc-700 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            idx === 0
                              ? 'bg-[#FF4365]'
                              : idx === 1
                              ? 'bg-[#FFE600]'
                              : idx === 2
                              ? 'bg-[#00F0FF]'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, kat.persentase))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 py-6 text-center font-display font-bold">
                  Belum ada catatan pengeluaran pada periode ini.
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FFE600]/15 dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
              💡 <strong>Tips Dompi:</strong> Berdasarkan riset keuangan, menghemat 15–20% pada <strong>3 pos teratas di atas</strong> akan memberikan dampak tabungan yang jauh lebih signifikan dibanding memangkas pos-pos kecil lainnya.
            </div>
          </div>

          {/* Kolom Kanan: 5 Transaksi Terbesar */}
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-5 sm:p-6 shadow-brutal space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FFE600] border border-[#121212] flex items-center justify-center text-[#121212]">
                  <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h2 className="text-base font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                  5 Pengeluaran Terbesar
                </h2>
              </div>
              <Link
                href="/transaksi"
                className="text-xs font-display font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 hover:underline"
              >
                Lihat Semua →
              </Link>
            </div>

            {analysis.transaksiTerbesar.length > 0 ? (
              <div className="space-y-2.5">
                {analysis.transaksiTerbesar.map((trx, i) => (
                  <div
                    key={trx.id || i}
                    className="p-3 rounded-2xl bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 flex items-center justify-between shadow-2xs text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-black font-display text-zinc-900 dark:text-zinc-100 truncate">
                        {trx.deskripsi}
                      </p>
                      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px] mt-0.5 font-medium">
                        <span className="px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded border border-zinc-300 dark:border-zinc-700 text-[10px]">
                          {trx.kategori}
                        </span>
                        <span>•</span>
                        <span>{trx.dompet}</span>
                        <span>•</span>
                        <span>{trx.tanggal}</span>
                      </div>
                    </div>
                    <span className="font-black font-display tabular-nums text-[#FF4365] text-sm whitespace-nowrap flex-shrink-0">
                      -{formatRupiah(trx.nominal)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 py-8 text-center font-display font-bold">
                Belum ada transaksi pengeluaran.
              </p>
            )}
          </div>
        </div>

        {/* Sebaran Saldo di Seluruh Dompet */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-5 sm:p-6 shadow-brutal space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00FF66] border border-[#121212] flex items-center justify-center text-[#121212]">
                <Wallet className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                  Sebaran Saldo Dompet & Bank
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Total kekayaan aktif: <strong>{formatRupiah(analysis.ringkasanDompet.totalSaldoTerkini)}</strong>
                </p>
              </div>
            </div>
            <Link
              href="/dompet"
              className="text-xs font-display font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-50 hover:underline"
            >
              Kelola Dompet →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {analysis.ringkasanDompet.rincian.map((w) => (
              <div
                key={w.nama}
                className="p-3.5 rounded-2xl bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold font-display text-xs text-zinc-900 dark:text-zinc-100 truncate">
                    {w.nama}
                  </span>
                  <span className="text-[10px] font-black font-display bg-[#FFE600] text-[#121212] border border-[#121212] px-1.5 py-0.2 rounded">
                    {w.persentaseDariTotal}%
                  </span>
                </div>
                <div className="text-base font-black font-display tabular-nums text-zinc-950 dark:text-zinc-50">
                  {formatRupiah(w.saldo)}
                </div>
                <div className="text-[10px] text-zinc-500 font-medium">
                  {w.tipe}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Quick Action Pintasan */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#FFE600] border-2 border-[#121212] shadow-brutal flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <h3 className="font-black font-display text-sm sm:text-base text-[#121212]">
              Ingin Menambah Catatan atau Konsultasi Pengeluaran?
            </h3>
            <p className="text-xs text-[#121212]/80 font-medium">
              Kamu bisa mencatat pengeluaran langsung atau bertanya ke asisten cerdas Dompi.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/chat"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#121212] font-display font-extrabold border-2 border-[#121212] shadow-brutal-sm btn-brutal transition text-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tanya Dompi AI</span>
            </Link>
            <Link
              href="/transaksi?action=create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#121212] text-white font-display font-extrabold border-2 border-[#121212] shadow-brutal-sm btn-brutal transition text-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Catat Transaksi</span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
