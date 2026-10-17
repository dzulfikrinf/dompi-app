'use client'

import React from 'react'
import Link from 'next/link'
import { PieChart, ArrowRight } from 'lucide-react'

type Transaction = {
  kategori: string
  nominal: number
  tipe: 'Pengeluaran' | 'Pemasukan'
}

type CategoryAllocationProps = {
  transactions: Transaction[]
}

const COLOR_MAP = [
  { bar: 'bg-[#FFE600]', badge: 'bg-[#FFE600] text-[#121212]', dot: 'bg-[#FFE600]' },
  { bar: 'bg-[#00F0FF]', badge: 'bg-[#00F0FF] text-[#121212]', dot: 'bg-[#00F0FF]' },
  { bar: 'bg-[#FF4365]', badge: 'bg-[#FF4365] text-white', dot: 'bg-[#FF4365]' },
  { bar: 'bg-[#00FF66]', badge: 'bg-[#00FF66] text-[#121212]', dot: 'bg-[#00FF66]' },
  { bar: 'bg-purple-400', badge: 'bg-purple-400 text-white', dot: 'bg-purple-400' },
]

export default function CategoryAllocation({ transactions }: CategoryAllocationProps) {
  const expenseTrx = transactions.filter((t) => t.tipe === 'Pengeluaran')
  const totalExpense = expenseTrx.reduce((a, b) => a + Number(b.nominal), 0)

  // Kelompokkan per kategori
  const grouped = expenseTrx.reduce((acc, curr) => {
    const cat = curr.kategori || 'Lainnya'
    acc[cat] = (acc[cat] || 0) + Number(curr.nominal)
    return acc
  }, {} as Record<string, number>)

  const sortedCategories = Object.entries(grouped)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 sm:p-6 shadow-brutal flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-[#121212] dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00F0FF] border-2 border-[#121212] flex items-center justify-center text-[#121212] shadow-brutal-sm">
              <PieChart className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                Alokasi Kategori
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Dari total Rp {totalExpense.toLocaleString('id-ID')} pengeluaran
              </p>
            </div>
          </div>

          <Link
            href="/anggaran"
            className="text-xs font-display font-bold text-[#006970] dark:text-[#00F0FF] hover:underline inline-flex items-center gap-1"
          >
            <span>Atur Kuota</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {sortedCategories.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500 dark:text-zinc-400">
              Belum ada transaksi pengeluaran.
            </div>
          ) : (
            sortedCategories.map(([kategori, nominal], index) => {
              const percentage = totalExpense > 0 ? Math.round((nominal / totalExpense) * 100) : 0
              const theme = COLOR_MAP[index % COLOR_MAP.length]

              return (
                <div key={kategori} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full border border-[#121212] ${theme.dot}`} />
                      <span>{kategori}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-mono text-zinc-600 dark:text-zinc-400">
                        Rp {nominal.toLocaleString('id-ID')}
                      </span>
                      <span className={`text-[10px] font-display font-bold px-2 py-0.5 rounded-full border border-[#121212] shadow-2xs ${theme.badge}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar with Neo-Brutalist Border */}
                  <div className="w-full h-3 rounded-full bg-[#FBF9F4] dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 overflow-hidden">
                    <div
                      className={`h-full ${theme.bar} transition-all duration-300 border-r-2 border-[#121212]`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>Evaluasi otomatis pos pengeluaran terbesar</span>
        <span className="font-display font-bold text-zinc-800 dark:text-zinc-200">Rule 50/30/20</span>
      </div>
    </div>
  )
}
