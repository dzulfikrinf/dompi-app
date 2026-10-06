'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Coffee,
  Briefcase,
  ShoppingBag,
  Droplet,
  Play,
  Wallet,
} from 'lucide-react'

type Transaction = {
  id: number
  tanggal: string
  kategori: string
  nominal: number
  tipe: 'Pengeluaran' | 'Pemasukan'
  dompet?: string
  deskripsi: string
}

type RecentTransactionsProps = {
  transactions: Transaction[]
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

const getCategoryIcon = (kategori: string) => {
  const k = kategori.toLowerCase()
  if (k.includes('makan') || k.includes('kopi') || k.includes('minum'))
    return <Coffee className="w-4 h-4 text-amber-400" />
  if (k.includes('gaji') || k.includes('freelance') || k.includes('bonus'))
    return <Briefcase className="w-4 h-4 text-emerald-400" />
  if (k.includes('belanja') || k.includes('pasar') || k.includes('supermarket'))
    return <ShoppingBag className="w-4 h-4 text-blue-400" />
  if (k.includes('bensin') || k.includes('transport') || k.includes('ojek'))
    return <Droplet className="w-4 h-4 text-cyan-400" />
  if (k.includes('tagihan') || k.includes('listrik') || k.includes('internet'))
    return <Play className="w-4 h-4 text-purple-400" />
  return <Wallet className="w-4 h-4 text-slate-400" />
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const displayItems = transactions.slice(0, 5)

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 lg:p-6 animate-fade-in-up delay-200 hover:border-slate-700/80 transition-colors duration-200">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">Transaksi Terbaru</h2>
          <p className="text-xs text-slate-400">Catatan aktivitas pemasukan dan pengeluaran terkini</p>
        </div>
        <Link
          href="/transaksi"
          className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition group"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="space-y-3">
        {displayItems.length > 0 ? (
          displayItems.map((trx) => {
            const isIncome = trx.tipe === 'Pemasukan'
            return (
              <div
                key={trx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0a0f1c]/60 hover:bg-[#0a0f1c] hover:border-slate-700/80 border border-slate-800/60 transition-all duration-150 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center flex-shrink-0 border border-slate-700/40 group-hover:scale-105 transition-transform duration-200">
                    {getCategoryIcon(trx.kategori)}
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="text-sm font-semibold text-white truncate mb-0.5">
                      {trx.deskripsi}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{trx.tanggal}</span>
                      <span>•</span>
                      <span className="truncate">{trx.dompet || 'Tunai'}</span>
                      <span>•</span>
                      <span className="text-slate-500">{trx.kategori}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-3">
                  <p
                    className={`text-sm font-bold flex items-center justify-end gap-1 ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {isIncome ? '+' : '-'}
                      {formatRupiah(trx.nominal)}
                    </span>
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            Belum ada transaksi tercatat. Mulai catat transaksi baru Anda!
          </div>
        )}
      </div>
    </div>
  )
}
