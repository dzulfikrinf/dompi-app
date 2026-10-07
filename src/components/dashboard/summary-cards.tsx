'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type SummaryCardsProps = {
  saldo: number
  pemasukanBulanIni: number
  totalPemasukan: number
  pengeluaranBulanIni: number
  totalPengeluaran: number
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
  pemasukanBulanIni,
  totalPemasukan,
  pengeluaranBulanIni,
  totalPengeluaran,
}: SummaryCardsProps) {
  const [hideBalance, setHideBalance] = useState(false)

  const selisihBulanIni = pemasukanBulanIni - pengeluaranBulanIni
  const isSurplus = selisihBulanIni >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
      {/* 1. HERO CARD: Total Saldo Konsolidasi */}
      <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              Total Saldo Aktif
            </span>
          </div>

          <button
            type="button"
            onClick={() => setHideBalance(!hideBalance)}
            aria-label={hideBalance ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 px-2.5 py-1 rounded-md transition cursor-pointer active:scale-95"
          >
            {hideBalance ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[11px]">Buka</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span className="text-[11px]">Tutup</span>
              </>
            )}
          </button>
        </div>

        <div className="my-auto py-2">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
            {hideBalance ? '••••••••••••' : formatRupiah(saldo)}
          </p>
        </div>

        <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="truncate">Akumulasi seluruh pos simpanan</span>
          <div className="font-mono text-zinc-700 dark:text-zinc-300">
            Net: {isSurplus ? `+${formatRupiah(selisihBulanIni)}` : formatRupiah(selisihBulanIni)}
          </div>
        </div>
      </div>

      {/* 2. Pemasukan Bulan Ini */}
      <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
            Pemasukan Bulan Ini
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            IN
          </span>
        </div>

        <div className="my-auto py-2">
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
            {formatRupiah(pemasukanBulanIni)}
          </p>
        </div>

        <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Historis:</span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatRupiah(totalPemasukan)}</span>
        </div>
      </div>

      {/* 3. Pengeluaran Bulan Ini */}
      <div className="col-span-1 md:col-span-1 lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
            Pengeluaran Bulan Ini
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            OUT
          </span>
        </div>

        <div className="my-auto py-2">
          <p className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
            {formatRupiah(pengeluaranBulanIni)}
          </p>
        </div>

        <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Historis:</span>
          <span className="font-mono text-zinc-700 dark:text-zinc-300">{formatRupiah(totalPengeluaran)}</span>
        </div>
      </div>
    </div>
  )
}
