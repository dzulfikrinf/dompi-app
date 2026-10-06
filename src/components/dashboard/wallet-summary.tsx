'use client'

import React from 'react'
import Link from 'next/link'
import { Wallet, ArrowRight, CreditCard } from 'lucide-react'

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
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 lg:p-6 flex flex-col justify-between animate-fade-in-up delay-150 hover:border-slate-700/80 transition-colors duration-200">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dompet & Rekening</h2>
              <p className="text-xs text-slate-400">{wallets.length} sumber dana aktif</p>
            </div>
          </div>
          <Link
            href="/dompet"
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition group"
          >
            <span>Detail</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="space-y-3 mt-4">
          {wallets.slice(0, 4).map((wallet) => {
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
                className="flex items-center justify-between p-3 rounded-xl bg-[#0a0f1c]/60 border border-slate-800/60 hover:border-slate-700/80 hover:bg-[#0a0f1c] transition-all duration-150 group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
                  <div className="min-w-0 truncate">
                    <p className="text-xs font-bold text-white truncate">{wallet.nama}</p>
                    <p className="text-[10px] text-slate-500 truncate">{wallet.tipe}</p>
                  </div>
                </div>
                <p className="text-xs font-extrabold text-white flex-shrink-0 pl-2">
                  {formatRupiah(saldoTerakhir)}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Perbarui saldo / rekening</span>
        <Link href="/dompet" className="font-semibold text-cyan-400 hover:underline">
          Buka Halaman Dompet
        </Link>
      </div>
    </div>
  )
}
