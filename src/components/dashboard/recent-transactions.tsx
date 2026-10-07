'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const displayItems = transactions.slice(0, 5)

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Transaksi Terkini
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Aktivitas mutasi pemasukan dan pengeluaran terbaru
          </p>
        </div>

        <Link
          href="/transaksi"
          className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition"
        >
          <span>Semua Transaksi</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Transaction Rows */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {displayItems.length > 0 ? (
          displayItems.map((trx) => {
            const isIncome = trx.tipe === 'Pemasukan'
            return (
              <div
                key={trx.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 px-2 -mx-2 rounded-lg transition"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate mb-0.5">
                    {trx.deskripsi}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-mono">{trx.tanggal}</span>
                    <span>•</span>
                    <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-mono">
                      {trx.dompet || 'Tunai'}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-400">{trx.kategori}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-semibold font-mono ${
                      isIncome
                        ? 'text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatRupiah(trx.nominal)}
                  </p>
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
