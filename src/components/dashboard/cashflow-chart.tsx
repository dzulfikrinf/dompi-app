'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

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
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Arus Kas Harian
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Perbandingan mutasi masuk dan keluar per hari
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
            <span className="w-2.5 h-2.5 rounded-xs bg-zinc-900 dark:bg-zinc-100" />
            <span>Masuk: {formatRupiah(totalPemasukan)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <span className="w-2.5 h-2.5 rounded-xs bg-zinc-400 dark:bg-zinc-600" />
            <span>Keluar: {formatRupiah(totalPengeluaran)}</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartIncomeMonochrome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#71717a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#71717a" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="chartExpenseMonochrome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 11 }}
                dy={10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const inc = payload.find((p) => p.dataKey === 'income')?.value || 0
                    const exp = payload.find((p) => p.dataKey === 'expense')?.value || 0
                    return (
                      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg shadow-md text-xs space-y-1 min-w-[130px]">
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300 pb-1 border-b border-zinc-100 dark:border-zinc-800 font-mono">
                          {label}
                        </p>
                        {Number(inc) > 0 && (
                          <p className="text-zinc-900 dark:text-zinc-100 flex items-center justify-between font-mono">
                            <span>Masuk:</span>
                            <strong>{formatRupiah(Number(inc))}</strong>
                          </p>
                        )}
                        {Number(exp) > 0 && (
                          <p className="text-zinc-500 dark:text-zinc-400 flex items-center justify-between font-mono">
                            <span>Keluar:</span>
                            <strong>{formatRupiah(Number(exp))}</strong>
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
                stroke="#52525b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#chartIncomeMonochrome)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#a1a1aa"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                fillOpacity={1}
                fill="url(#chartExpenseMonochrome)"
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
