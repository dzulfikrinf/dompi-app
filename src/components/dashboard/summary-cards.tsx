'use client'

import React from 'react'
import { Wallet, TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react'

type SummaryCardsProps = {
  saldo: number
  totalPemasukan: number
  totalPengeluaran: number
  sisaAnggaran: number
  budgetBulanan: number
  persentaseAnggaran: number
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
  totalPemasukan,
  totalPengeluaran,
  sisaAnggaran,
  budgetBulanan,
  persentaseAnggaran,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Saldo Aktif */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-950/20 transition-all duration-200 animate-fade-in-up">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400">Total Saldo Aktif</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400 transition-transform duration-200 group-hover:scale-110">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
          {formatRupiah(saldo)}
        </p>
        <p className="text-xs text-slate-500">Saldo akumulasi seluruh rekening & dompet</p>
      </div>

      {/* 2. Pemasukan Bulan Ini */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/20 transition-all duration-200 animate-fade-in-up delay-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400">Pemasukan Bulan Ini</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 transition-transform duration-200 group-hover:scale-110">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight mb-1">
          {formatRupiah(totalPemasukan)}
        </p>
        <p className="text-xs text-slate-500">Total uang masuk tercatat</p>
      </div>

      {/* 3. Pengeluaran Bulan Ini */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-950/20 transition-all duration-200 animate-fade-in-up delay-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400">Pengeluaran Bulan Ini</span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 transition-transform duration-200 group-hover:scale-110">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight mb-1">
          {formatRupiah(totalPengeluaran)}
        </p>
        <p className="text-xs text-slate-500">Total uang keluar tercatat</p>
      </div>

      {/* 4. Sisa Budget */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-950/20 transition-all duration-200 animate-fade-in-up delay-150">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400">Sisa Anggaran</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 transition-transform duration-200 group-hover:scale-110">
            <PieChartIcon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {formatRupiah(sisaAnggaran)}
        </p>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-1.5">
          <div
            className={`h-full transition-all duration-700 ease-out ${
              persentaseAnggaran > 90
                ? 'bg-rose-500'
                : persentaseAnggaran > 75
                ? 'bg-amber-400'
                : 'bg-cyan-400'
            }`}
            style={{ width: `${Math.min(persentaseAnggaran, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>Terpakai {persentaseAnggaran}%</span>
          <span>Target {formatRupiah(budgetBulanan)}</span>
        </div>
      </div>
    </div>
  )
}
