'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Landmark, TrendingUp, Receipt, ShieldCheck } from 'lucide-react'

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
  const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date())

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
      {/* 1. Total Saldo Aktif */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between shadow-brutal hover:-translate-y-0.5 transition-transform">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Total Saldo Aktif
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-[#00FF66] text-[#121212] border border-[#121212]">
            {isSurplus ? '+ SURPLUS' : 'DEFISIT'}
          </span>
        </div>

        <div className="py-2 flex items-center justify-between">
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display tracking-tight text-[#121212] dark:text-zinc-50">
            {hideBalance ? '••••••••••••' : formatRupiah(saldo)}
          </p>
          <button
            type="button"
            onClick={() => setHideBalance(!hideBalance)}
            aria-label={hideBalance ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
            className="p-1.5 rounded-lg border border-[#121212] dark:border-zinc-700 bg-[#FBF9F4] dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-[#FFE600] transition cursor-pointer"
          >
            {hideBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Landmark className="w-3.5 h-3.5 stroke-[2]" />
          <span className="truncate">Akumulasi seluruh pos dompet</span>
        </div>
      </div>

      {/* 2. Pemasukan Bulan Ini */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between shadow-brutal hover:-translate-y-0.5 transition-transform">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Pemasukan Bulan Ini
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-[#00F0FF] text-[#121212] border border-[#121212] uppercase">
            {currentMonthName} IN
          </span>
        </div>

        <div className="py-2">
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display tracking-tight text-[#006970] dark:text-[#00F0FF]">
            {formatRupiah(pemasukanBulanIni)}
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 truncate">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
            <span>Historis:</span>
          </div>
          <span className="font-display font-bold text-zinc-800 dark:text-zinc-200">{formatRupiah(totalPemasukan)}</span>
        </div>
      </div>

      {/* 3. Pengeluaran Bulan Ini */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between shadow-brutal hover:-translate-y-0.5 transition-transform">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Pengeluaran Bulan Ini
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-[#FFE600] text-[#121212] border border-[#121212]">
            TERKENDALI
          </span>
        </div>

        <div className="py-2">
          <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-display tracking-tight text-[#FF4365]">
            {formatRupiah(pengeluaranBulanIni)}
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5 truncate">
            <Receipt className="w-3.5 h-3.5 text-[#FF4365] stroke-[2]" />
            <span>Historis:</span>
          </div>
          <span className="font-display font-bold text-zinc-800 dark:text-zinc-200">{formatRupiah(totalPengeluaran)}</span>
        </div>
      </div>

      {/* 4. Sisa Kuota / Net Surplus */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between shadow-brutal hover:-translate-y-0.5 transition-transform">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Arus Kas Bersih
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-[#FFD1DC] text-[#121212] border border-[#121212]">
            BULAN INI
          </span>
        </div>

        <div className="py-2">
          <p className={`text-xl sm:text-2xl lg:text-3xl font-extrabold font-display tracking-tight ${
            isSurplus ? 'text-[#121212] dark:text-zinc-50' : 'text-[#FF4365]'
          }`}>
            {isSurplus ? `+${formatRupiah(selisihBulanIni)}` : formatRupiah(selisihBulanIni)}
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 stroke-[2] text-emerald-600" />
          <span className="truncate">{isSurplus ? 'Arus kas sehat & aman' : 'Pos belanja perlu dievaluasi'}</span>
        </div>
      </div>
    </div>
  )
}
