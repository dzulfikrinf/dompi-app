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
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 lg:p-6 flex flex-col justify-between animate-fade-in-up delay-100 hover:border-slate-700/80 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white">Arus Kas Harian</h2>
          <p className="text-xs text-slate-400">Tren pemasukan dan pengeluaran per tanggal</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-400">
              Masuk: <strong className="text-white">{formatRupiah(totalPemasukan)}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-400">
              Keluar: <strong className="text-white">{formatRupiah(totalPengeluaran)}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="chartExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
                dy={10}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const inc = payload.find((p) => p.dataKey === 'income')?.value || 0
                    const exp = payload.find((p) => p.dataKey === 'expense')?.value || 0
                    return (
                      <div className="bg-[#0a0f1c] border border-slate-700/80 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-semibold text-slate-300 pb-1 border-b border-slate-800">
                          {label}
                        </p>
                        {Number(inc) > 0 && (
                          <p className="text-emerald-400">
                            Masuk: <strong>{formatRupiah(Number(inc))}</strong>
                          </p>
                        )}
                        {Number(exp) > 0 && (
                          <p className="text-rose-400">
                            Keluar: <strong>{formatRupiah(Number(exp))}</strong>
                          </p>
                        )}
                        {Number(inc) === 0 && Number(exp) === 0 && (
                          <p className="text-slate-500">Tidak ada transaksi</p>
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
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartIncome)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            Belum ada data arus kas untuk ditampilkan
          </div>
        )}
      </div>
    </div>
  )
}
