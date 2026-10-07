'use client'

import React, { useState } from 'react'
import {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 items-stretch">
      {/* 1. HERO CARD: Total Saldo Konsolidasi (Spans 2 columns on lg & md) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-2 group flex flex-col">
        <div className="relative rounded-3xl p-1 bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-white/[0.15] h-full flex flex-col">
          <div className="relative rounded-[calc(1.5rem-0.25rem)] p-5 sm:p-6 bg-[#0b0f19] border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col justify-between h-full">
            {/* Ambient Radial Glow */}
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />
            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Status Chip & Eye Toggle */}
            <div className="relative z-10 flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400">
                  Saldo Terkonsolidasi
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Aktif
                </span>
              </div>

              <button
                type="button"
                onClick={() => setHideBalance(!hideBalance)}
                aria-label={hideBalance ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-2.5 py-1 rounded-full transition-all duration-150 active:scale-95 cursor-pointer"
              >
                {hideBalance ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Buka</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Tutup</span>
                  </>
                )}
              </button>
            </div>

            {/* Primary Number */}
            <div className="relative z-10 my-auto py-2">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-[-0.03em] font-sans">
                {hideBalance ? '••••••••••••' : formatRupiah(saldo)}
              </p>
            </div>

            {/* Bottom Status */}
            <div className="relative z-10 pt-3 mt-1 border-t border-white/[0.06] flex items-center justify-between gap-2 text-xs flex-wrap">
              <p className="text-slate-400 text-[11px] truncate">
                Akumulasi seluruh rekening & dompet
              </p>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Arus Kas:</span>
                <span className={isSurplus ? 'text-emerald-400 font-semibold font-mono' : 'text-rose-400 font-semibold font-mono'}>
                  {isSurplus ? `+${formatRupiah(selisihBulanIni)}` : formatRupiah(selisihBulanIni)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PEMASUKAN BULAN INI (1 Column on lg & md) */}
      <div className="col-span-1 md:col-span-1 lg:col-span-1 group flex flex-col">
        <div className="rounded-3xl p-1 bg-gradient-to-b from-emerald-500/15 via-white/[0.03] to-transparent border border-emerald-500/20 shadow-lg hover:border-emerald-500/40 transition-all duration-200 h-full flex flex-col">
          <div className="rounded-[calc(1.5rem-0.25rem)] p-5 bg-[#0b0f19] border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-emerald-400/90 truncate">
                Pemasukan Bulan Ini
              </span>
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform flex-shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-auto py-1">
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                {formatRupiah(pemasukanBulanIni)}
              </p>
            </div>

            <div className="pt-3 mt-1 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">Total Historis:</span>
              <span className="text-slate-300 font-medium font-mono pl-1">{formatRupiah(totalPemasukan)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PENGELUARAN BULAN INI (1 Column on lg & md) */}
      <div className="col-span-1 md:col-span-1 lg:col-span-1 group flex flex-col">
        <div className="rounded-3xl p-1 bg-gradient-to-b from-rose-500/15 via-white/[0.03] to-transparent border border-rose-500/20 shadow-lg hover:border-rose-500/40 transition-all duration-200 h-full flex flex-col">
          <div className="rounded-[calc(1.5rem-0.25rem)] p-5 bg-[#0b0f19] border border-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-rose-400/90 truncate">
                Pengeluaran Bulan Ini
              </span>
              <div className="w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform flex-shrink-0">
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="my-auto py-1">
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
                {formatRupiah(pengeluaranBulanIni)}
              </p>
            </div>

            <div className="pt-3 mt-1 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">Total Historis:</span>
              <span className="text-slate-300 font-medium font-mono pl-1">{formatRupiah(totalPengeluaran)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
