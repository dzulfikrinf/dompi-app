'use client'

import React from 'react'
import Link from 'next/link'
import {
  TrendingDown,
  TrendingUp,
  ArrowUpRight,
  Coffee,
  Briefcase,
  ShoppingBag,
  Droplet,
  Play,
  Wallet,
  Clock,
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
  return <Wallet className="w-4 h-4 text-slate-300" />
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const displayItems = transactions.slice(0, 5)

  return (
    <div className="rounded-3xl p-1 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent border border-white/[0.07] shadow-xl">
      <div className="rounded-[calc(1.5rem-0.25rem)] p-5 lg:p-6 bg-[#0b0f19] border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-200">
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Transaksi Terkini
              </h2>
              <p className="text-xs text-slate-400">Mutasi keuangan paling baru yang tercatat</p>
            </div>
          </div>

          <Link
            href="/transaksi"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3.5 py-1 rounded-full transition-all group active:scale-95"
          >
            <span>Semua Transaksi</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Transaction Rows */}
        <div className="space-y-2.5">
          {displayItems.length > 0 ? (
            displayItems.map((trx) => {
              const isIncome = trx.tipe === 'Pemasukan'
              return (
                <div
                  key={trx.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.1] transition-all duration-150 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-white/[0.04] flex items-center justify-center flex-shrink-0 border border-white/[0.06] group-hover:scale-105 transition-transform duration-200">
                      {getCategoryIcon(trx.kategori)}
                    </div>
                    <div className="min-w-0 truncate">
                      <p className="text-sm font-semibold text-white truncate mb-1">
                        {trx.deskripsi}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                        <span className="font-mono">{trx.tanggal}</span>
                        <span className="text-slate-600">•</span>
                        <span className="bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md text-[10px] text-slate-300 font-medium truncate">
                          {trx.dompet || 'Tunai'}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{trx.kategori}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 pl-3">
                    <p
                      className={`text-sm font-bold flex items-center justify-end gap-1 font-mono ${
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
            <div className="py-10 text-center text-slate-400 text-xs border border-white/[0.06] border-dashed rounded-2xl p-6">
              Belum ada transaksi tercatat. Mulai catat transaksi baru Anda!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
