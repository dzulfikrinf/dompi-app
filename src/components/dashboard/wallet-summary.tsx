'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Plus } from 'lucide-react'

type WalletItem = {
  id: number
  nama: string
  tipe: string
  saldo_awal: number
}

type Transaction = {
  tipe: 'Pengeluaran' | 'Pemasukan'
  dompet?: string
  nominal: number
}

type WalletSummaryProps = {
  wallets: WalletItem[]
  transactions: Transaction[]
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

export default function WalletSummary({ wallets, transactions }: WalletSummaryProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xs h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Pos & Rekening
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {wallets.length} pos simpanan terdaftar
            </p>
          </div>

          <Link
            href="/dompet"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition inline-flex items-center gap-1"
          >
            <span>Kelola</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* List of Wallets */}
        <div className="space-y-2 mt-2">
          {wallets.length === 0 ? (
            <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 text-xs space-y-2 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-lg p-4">
              <p>Belum ada dompet tercatat.</p>
              <Link
                href="/dompet"
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 underline underline-offset-4"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pos Baru</span>
              </Link>
            </div>
          ) : (
            wallets.slice(0, 5).map((wallet) => {
              const inWallet = transactions
                .filter(
                  (t) =>
                    t.tipe === 'Pemasukan' &&
                    t.dompet?.toLowerCase() === wallet.nama.toLowerCase()
                )
                .reduce((a, b) => a + Number(b.nominal), 0)

              const outWallet = transactions
                .filter(
                  (t) =>
                    t.tipe === 'Pengeluaran' &&
                    t.dompet?.toLowerCase() === wallet.nama.toLowerCase()
                )
                .reduce((a, b) => a + Number(b.nominal), 0)

              const saldoTerakhir = wallet.saldo_awal + inWallet - outWallet

              return (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {wallet.nama}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                      {wallet.tipe}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 font-mono flex-shrink-0">
                    {formatRupiah(saldoTerakhir)}
                  </p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>Rincian saldo pos</span>
        <Link href="/dompet" className="font-medium text-zinc-900 dark:text-zinc-100 hover:underline">
          Lihat Semua →
        </Link>
      </div>
    </div>
  )
}
