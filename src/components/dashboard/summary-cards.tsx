'use client'

import React from 'react'
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'

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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
      {/* 1. Total Saldo Aktif */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-950/20 transition-all duration-200 animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400">Total Saldo Aktif</span>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-400 transition-transform duration-200 group-hover:scale-110">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5">
          {formatRupiah(saldo)}
        </p>
        <p className="text-xs text-slate-500">Saldo akumulasi seluruh rekening & dompet aktif</p>
      </div>

      {/* 2. Pemasukan Bulan Ini */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-emerald-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/20 transition-all duration-200 animate-fade-in-up delay-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400">Pemasukan Bulan Ini</span>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 transition-transform duration-200 group-hover:scale-110">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight mb-1.5">
          {formatRupiah(pemasukanBulanIni)}
        </p>
        <p className="text-xs text-slate-500">
          Total semua waktu: <span className="text-slate-400 font-medium">{formatRupiah(totalPemasukan)}</span>
        </p>
      </div>

      {/* 3. Pengeluaran Bulan Ini */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 sm:p-6 relative overflow-hidden group hover:border-rose-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-950/20 transition-all duration-200 animate-fade-in-up delay-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400">Pengeluaran Bulan Ini</span>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 transition-transform duration-200 group-hover:scale-110">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight mb-1.5">
          {formatRupiah(pengeluaranBulanIni)}
        </p>
        <p className="text-xs text-slate-500">
          Total semua waktu: <span className="text-slate-400 font-medium">{formatRupiah(totalPengeluaran)}</span>
        </p>
      </div>
    </div>
  )
}
