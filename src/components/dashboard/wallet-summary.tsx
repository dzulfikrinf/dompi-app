'use client'

import React from 'react'
import Link from 'next/link'
import { Wallet, ArrowUpRight, CreditCard, Plus, Layers } from 'lucide-react'

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
    <div className="rounded-3xl p-1 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent border border-white/[0.07] shadow-xl h-full flex flex-col justify-between">
      <div className="rounded-[calc(1.5rem-0.25rem)] p-5 lg:p-6 bg-[#0b0f19] border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] h-full flex flex-col justify-between">
        <div>
          {/* Card Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-200">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Pos & Rekening</h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  {wallets.length} pos simpanan aktif
                </p>
              </div>
            </div>

            <Link
              href="/dompet"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-3 py-1 rounded-full transition-all group active:scale-95"
            >
              <span>Kelola</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          {/* List of Wallets */}
          <div className="space-y-2.5 mt-2">
            {wallets.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-3 border border-white/[0.06] border-dashed rounded-2xl p-5">
                <p>Belum ada dompet atau rekening yang tercatat.</p>
                <Link
                  href="/dompet"
                  className="inline-flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1] px-3.5 py-1.5 rounded-full text-xs font-semibold transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Rekening Baru</span>
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
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-150 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 text-slate-400 group-hover:text-cyan-400 transition-colors">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-bold text-white truncate">{wallet.nama}</p>
                        <p className="text-[10px] text-slate-400 truncate">{wallet.tipe}</p>
                      </div>
                    </div>
                    <p className="text-xs font-extrabold text-white flex-shrink-0 pl-2 font-mono">
                      {formatRupiah(saldoTerakhir)}
                    </p>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
          <span>Mutasi & Saldo Awal</span>
          <Link href="/dompet" className="font-semibold text-slate-200 hover:text-white transition">
            Lihat Semua →
          </Link>
        </div>
      </div>
    </div>
  )
}
