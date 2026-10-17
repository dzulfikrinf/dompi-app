'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingBag, Coffee, Car, DollarSign, Tag, ArrowUpRight } from 'lucide-react'

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

function getCategoryIcon(kategori: string, tipe: string) {
  const cat = kategori.toLowerCase()
  if (tipe === 'Pemasukan') return <DollarSign className="w-4 h-4 text-[#121212] stroke-[2.5]" />
  if (cat.includes('makan') || cat.includes('kopi') || cat.includes('kafe')) return <Coffee className="w-4 h-4 text-[#121212] stroke-[2.5]" />
  if (cat.includes('bensin') || cat.includes('ojol') || cat.includes('transport')) return <Car className="w-4 h-4 text-[#121212] stroke-[2.5]" />
  if (cat.includes('belanja') || cat.includes('supermarket')) return <ShoppingBag className="w-4 h-4 text-[#121212] stroke-[2.5]" />
  return <Tag className="w-4 h-4 text-[#121212] stroke-[2.5]" />
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const displayItems = transactions.slice(0, 5)

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 sm:p-6 shadow-brutal">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#121212] dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base font-extrabold font-display tracking-tight text-zinc-950 dark:text-zinc-50">
            Transaksi Terkini
          </h2>
          <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-[#FFE600] text-[#121212] border border-[#121212] shadow-2xs">
            {displayItems.length} Baru
          </span>
        </div>

        <Link
          href="/transaksi"
          className="inline-flex items-center gap-1 text-xs font-display font-bold text-[#006970] dark:text-[#00F0FF] hover:underline"
        >
          <span>Lihat Semua</span>
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </Link>
      </div>

      {/* Transaction Rows */}
      <div className="divide-y-2 divide-[#121212]/10 dark:divide-zinc-800">
        {displayItems.length > 0 ? (
          displayItems.map((trx) => {
            const isIncome = trx.tipe === 'Pemasukan'
            return (
              <div
                key={trx.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#FBF9F4] dark:hover:bg-zinc-800/40 px-2.5 -mx-2.5 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-9 h-9 rounded-xl border-2 border-[#121212] flex items-center justify-center flex-shrink-0 shadow-brutal-sm ${
                    isIncome ? 'bg-[#00FF66]' : 'bg-[#FFE600]'
                  }`}>
                    {getCategoryIcon(trx.kategori, trx.tipe)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {trx.deskripsi}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex-wrap">
                      <span className="font-mono">{trx.tanggal}</span>
                      <span>•</span>
                      <span className="font-display font-bold px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 text-[10px]">
                        {trx.dompet || 'Cash'}
                      </span>
                      <span>•</span>
                      <span className="truncate">{trx.kategori}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm sm:text-base font-extrabold font-display ${
                      isIncome
                        ? 'text-[#006970] dark:text-[#00F0FF]'
                        : 'text-[#FF4365]'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatRupiah(trx.nominal)}
                  </p>
                  <span className={`inline-block text-[9px] font-display font-bold px-1.5 py-0.2 rounded-full border border-[#121212] mt-0.5 ${
                    isIncome ? 'bg-[#00FF66] text-[#121212]' : 'bg-[#FFD1DC] text-[#121212]'
                  }`}>
                    {isIncome ? 'PEMASUKAN' : 'PENGELUARAN'}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-8 text-center text-zinc-400 text-xs">
            Belum ada transaksi tercatat. Mulai catat transaksi baru Anda!
          </div>
        )}
      </div>
    </div>
  )
}
