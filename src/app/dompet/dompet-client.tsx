'use client'

import React from 'react'
import AppLayout from '@/components/layout/app-layout'
import FeatureStatusCard from '@/components/common/feature-status-card'
import { CreditCard } from 'lucide-react'

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

type DompetClientProps = {
  wallets: WalletItem[]
  transactions: Transaction[]
  userEmail?: string
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

export default function DompetClient({
  wallets,
  transactions,
  userEmail,
}: DompetClientProps) {
  return (
    <AppLayout currentPath="/dompet" userEmail={userEmail}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in-up">
        {/* Active Wallets Real Data Display */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Daftar Dompet & Rekening Aktif</h2>
              <p className="text-xs text-slate-400">
                Saldo terkini dihitung secara otomatis dari saldo awal dan seluruh mutasi transaksi Anda.
              </p>
            </div>
            <span className="text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 px-2.5 py-1 rounded-full">
              {wallets.length} Akun
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wallets.map((wallet) => {
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
                  className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 hover:border-slate-700/80 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {wallet.tipe}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{wallet.nama}</h3>
                  <p className="text-2xl font-extrabold text-cyan-400 mb-2">
                    {formatRupiah(saldoTerakhir)}
                  </p>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                    <span>Saldo Awal: {formatRupiah(wallet.saldo_awal)}</span>
                    <span>Arus: {inWallet > outWallet ? '+' : ''}{formatRupiah(inWallet - outWallet)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Honest Status Notice Card */}
        <FeatureStatusCard
          title="Kelola & Tambah Dompet Baru"
          icon="wallet"
          description="Form tambah dompet dan transfer antar-rekening."
          plannedFeatures={[
            'Penambahan dompet / rekening bank baru tanpa batasan.',
            'Pencatatan mutasi transfer antar-dompet (misal: BCA ke GoPay).',
            'Penyesuaian saldo awal dan rekonsiliasi manual.',
          ]}
          currentAlternative="Untuk saat ini, Anda dapat menggunakan 4 dompet default di atas dan memilihnya langsung saat mencatat transaksi manual atau via Chat Dompi."
        />
      </div>
    </AppLayout>
  )
}
