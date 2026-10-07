'use client'

import React, { useState } from 'react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
} from 'lucide-react'

type SummaryCardsProps = {
  saldo: number
  pemasukanBulanIni: number
  totalPemasukan: number
  pengeluaranBulanIni: number
  totalPengeluaran: number
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

export default function SummaryCards({
  saldo,
  pemasukanBulanIni,
  totalPemasukan,
  pengeluaranBulanIni,
  totalPengeluaran,
}: SummaryCardsProps) {
  const [hideBalance, setHideBalance] = useState(false)

  const selisihBulanIni = pemasukanBulanIni - pengeluaranBulanIni
  const isSurplus = selisihBulanIni >= 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
      {/* 1. HERO CARD: Total Saldo Konsolidasi (Double-Bezel Architecture) */}
      <div className="lg:col-span-7 group">
        <div className="relative rounded-[2rem] p-1.5 bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-white/[0.15]">
          <div className="relative rounded-[calc(2rem-0.375rem)] p-6 sm:p-7 bg-[#0b0f19] border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col justify-between min-h-[220px]">
            {/* Ambient Radial Sheen Glow */}
            <div className="absolute -right-16 -top-16 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />
            <div className="absolute -left-20 -bottom-20 w-52 h-52 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Top Eyebrow & Privacy Toggle */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400">
                  Saldo Terkonsolidasi
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Terverifikasi
                </span>
              </div>

              <button
                type="button"
                onClick={() => setHideBalance(!hideBalance)}
                aria-label={hideBalance ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-1.5 rounded-full transition-all duration-150 active:scale-95 cursor-pointer"
              >
                {hideBalance ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Lihat</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Tutup</span>
                  </>
                )}
              </button>
            </div>

            {/* Display Number */}
            <div className="relative z-10 my-auto py-2">
              <p className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-[-0.03em] font-sans">
                {hideBalance ? '••••••••••••' : formatRupiah(saldo)}
              </p>
            </div>

            {/* Bottom Status Bar */}
            <div className="relative z-10 pt-4 mt-2 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs">
              <p className="text-slate-400 text-[11px] sm:text-xs">
                Total akumulasi seluruh rekening bank & dompet digital
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                <span className="text-slate-400">Net Arus Kas:</span>
                <span className={isSurplus ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {isSurplus ? `+${formatRupiah(selisihBulanIni)}` : formatRupiah(selisihBulanIni)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COMPANION CARDS: Pemasukan & Pengeluaran Bulan Ini */}
      <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {/* Pemasukan Card */}
        <div className="rounded-3xl p-1 bg-gradient-to-b from-emerald-500/15 via-white/[0.03] to-transparent border border-emerald-500/20 shadow-lg group hover:border-emerald-500/40 transition-all duration-200">
          <div className="rounded-[calc(1.5rem-0.25rem)] p-5 bg-[#0b0f19] border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-emerald-400/90">
                Pemasukan Bulan Ini
              </span>
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight my-1">
              {formatRupiah(pemasukanBulanIni)}
            </p>

            <div className="pt-2.5 mt-1 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400">
              <span>Akumulasi Total:</span>
              <span className="text-slate-300 font-medium">{formatRupiah(totalPemasukan)}</span>
            </div>
          </div>
        </div>

        {/* Pengeluaran Card */}
        <div className="rounded-3xl p-1 bg-gradient-to-b from-rose-500/15 via-white/[0.03] to-transparent border border-rose-500/20 shadow-lg group hover:border-rose-500/40 transition-all duration-200">
          <div className="rounded-[calc(1.5rem-0.25rem)] p-5 bg-[#0b0f19] border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-rose-400/90">
                Pengeluaran Bulan Ini
              </span>
              <div className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <ArrowDownRight className="w-4 h-4" />
              </div>
            </div>

            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight my-1">
              {formatRupiah(pengeluaranBulanIni)}
            </p>

            <div className="pt-2.5 mt-1 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400">
              <span>Akumulasi Total:</span>
              <span className="text-slate-300 font-medium">{formatRupiah(totalPengeluaran)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
