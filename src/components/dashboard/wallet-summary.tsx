'use client'

import React from 'react'
import Link from 'next/link'
import { Wallet, Plus, ArrowRight } from 'lucide-react'

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

const BADGE_COLORS = [
  'bg-[#FFE600] text-[#121212]',
  'bg-[#00F0FF] text-[#121212]',
  'bg-[#00FF66] text-[#121212]',
  'bg-[#FFD1DC] text-[#121212]',
]

export default function WalletSummary({ wallets, transactions }: WalletSummaryProps) {
  const displayWallets = wallets.slice(0, 4)

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 sm:p-6 shadow-brutal flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#121212] dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-[#121212] flex items-center justify-center text-[#121212] shadow-brutal-sm">
              <Wallet className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                Dompet & Bank
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {wallets.length} pos simpanan terdaftar
              </p>
            </div>
          </div>

          <Link
            href="/dompet"
            className="text-xs font-display font-bold text-[#006970] dark:text-[#00F0FF] hover:underline inline-flex items-center gap-1"
          >
            <span>Kelola</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* 2x2 Grid of Wallets */}
        {wallets.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 dark:text-zinc-400 text-xs space-y-2 border-2 border-dashed border-[#121212] dark:border-zinc-700 rounded-xl p-4 bg-[#FBF9F4] dark:bg-zinc-950">
            <p>Belum ada dompet tercatat.</p>
            <Link
              href="/dompet"
              className="inline-flex items-center gap-1 text-xs font-display font-bold text-zinc-900 dark:text-zinc-100 underline underline-offset-4"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tambah Pos Baru</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {displayWallets.map((wallet, idx) => {
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
              const badgeStyle = BADGE_COLORS[idx % BADGE_COLORS.length]

              return (
                <div
                  key={wallet.id}
                  className="p-3.5 rounded-xl border-2 border-[#121212] dark:border-zinc-700 bg-[#FBF9F4] dark:bg-zinc-950 shadow-brutal-sm hover:translate-x-0.5 transition"
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-[10px] font-display font-bold px-2 py-0.5 rounded-full border border-[#121212] truncate max-w-[110px] ${badgeStyle}`}>
                      {wallet.nama}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  <p className="text-sm sm:text-base font-extrabold font-display text-zinc-950 dark:text-zinc-50 truncate">
                    {formatRupiah(saldoTerakhir)}
                  </p>

                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium truncate mt-1">
                    {wallet.tipe || 'Pos Keuangan'}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Button: Hubungkan Rekening Baru */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <Link
          href="/dompet"
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-zinc-800 hover:bg-[#FFE600] dark:hover:bg-zinc-700 text-[#121212] dark:text-zinc-100 border-2 border-[#121212] dark:border-zinc-700 font-display font-bold text-xs shadow-brutal-sm btn-brutal transition"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Tambah / Sesuaikan Saldo Dompet</span>
        </Link>
      </div>
    </div>
  )
}
