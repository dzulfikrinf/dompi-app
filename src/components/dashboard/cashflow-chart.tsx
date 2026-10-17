'use client'

import React, { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3 } from 'lucide-react'

type DailyGroup = {
  name: string
  income: number
  expense: number
  rawDate: string
}

type CashflowChartProps = {
  data: DailyGroup[]
  totalPemasukan: number
  totalPengeluaran: number
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

export default function CashflowChart({
  data,
  totalPemasukan,
  totalPengeluaran,
}: CashflowChartProps) {
  const [rangeFilter, setRangeFilter] = useState<'7' | '30' | 'all'>('30')

  const filteredData = React.useMemo(() => {
    if (rangeFilter === '7') return data.slice(-7)
    if (rangeFilter === '30') return data.slice(-30)
    return data
  }, [data, rangeFilter])

  const netSurplus = totalPemasukan - totalPengeluaran

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 sm:p-6 shadow-brutal flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#121212] dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-[#121212] flex items-center justify-center text-[#121212] shadow-brutal-sm">
            <BarChart3 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-extrabold font-display tracking-tight text-zinc-950 dark:text-zinc-50">
              Arus Kas Bulanan
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Perbandingan mutasi pemasukan & pengeluaran harian
            </p>
          </div>
        </div>

        {/* Range Selector Pill Buttons */}
        <div className="flex items-center gap-1 bg-[#FBF9F4] dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 p-1 rounded-xl">
          <button
            onClick={() => setRangeFilter('7')}
            className={`px-2.5 py-1 text-xs font-display font-bold rounded-lg transition cursor-pointer ${
              rangeFilter === '7'
                ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setRangeFilter('30')}
            className={`px-2.5 py-1 text-xs font-display font-bold rounded-lg transition cursor-pointer ${
              rangeFilter === '30'
                ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            30 Hari
          </button>
          <button
            onClick={() => setRangeFilter('all')}
            className={`px-2.5 py-1 text-xs font-display font-bold rounded-lg transition cursor-pointer ${
              rangeFilter === 'all'
                ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Legend Badges */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-display font-bold px-2.5 py-1 rounded-full bg-[#00F0FF]/20 text-[#006970] dark:text-[#00F0FF] border border-[#121212] shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#006970] dark:bg-[#00F0FF]" />
          <span>Masuk: {formatRupiah(totalPemasukan)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-display font-bold px-2.5 py-1 rounded-full bg-[#FF4365]/20 text-[#FF4365] border border-[#121212] shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#FF4365]" />
          <span>Keluar: {formatRupiah(totalPengeluaran)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-display font-bold px-2.5 py-1 rounded-full bg-[#FFE600] text-[#121212] border border-[#121212] shadow-2xs">
          <span>Net: {netSurplus >= 0 ? `+${formatRupiah(netSurplus)}` : formatRupiah(netSurplus)}</span>
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartIncomeNeo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="chartExpenseNeo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF4365" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF4365" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'var(--font-space-grotesk)' }}
                dy={10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const inc = payload.find((p) => p.dataKey === 'income')?.value || 0
                    const exp = payload.find((p) => p.dataKey === 'expense')?.value || 0
                    return (
                      <div className="bg-white dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 p-3 rounded-xl shadow-brutal text-xs space-y-1 min-w-[140px]">
                        <p className="font-extrabold text-zinc-900 dark:text-zinc-100 pb-1 border-b border-zinc-200 dark:border-zinc-800 font-display">
                          {label}
                        </p>
                        {Number(inc) > 0 && (
                          <p className="text-[#006970] dark:text-[#00F0FF] flex items-center justify-between font-display font-bold">
                            <span>Masuk:</span>
                            <span>{formatRupiah(Number(inc))}</span>
                          </p>
                        )}
                        {Number(exp) > 0 && (
                          <p className="text-[#FF4365] flex items-center justify-between font-display font-bold">
                            <span>Keluar:</span>
                            <span>{formatRupiah(Number(exp))}</span>
                          </p>
                        )}
                        {Number(inc) === 0 && Number(exp) === 0 && (
                          <p className="text-zinc-400">Tidak ada mutasi</p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#006970"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartIncomeNeo)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#FF4365"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#chartExpenseNeo)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
            Belum ada data arus kas untuk ditampilkan
          </div>
        )}
      </div>
    </div>
  )
}
