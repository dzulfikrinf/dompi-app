'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Activity } from 'lucide-react'

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
    <div className="rounded-3xl p-1 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent border border-white/[0.07] shadow-xl">
      <div className="rounded-[calc(1.5rem-0.25rem)] p-5 lg:p-6 bg-[#0b0f19] border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] flex flex-col justify-between">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-200">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Tren Arus Kas
              </h2>
              <p className="text-xs text-slate-400">Dinamika mutasi dana harian</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium flex-wrap">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px]">Masuk:</span>
              <strong className="text-white font-mono">{formatRupiah(totalPemasukan)}</strong>
            </div>
            <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[11px]">Keluar:</span>
              <strong className="text-white font-mono">{formatRupiah(totalPengeluaran)}</strong>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-64 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="chartExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  dy={10}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const inc = payload.find((p) => p.dataKey === 'income')?.value || 0
                      const exp = payload.find((p) => p.dataKey === 'expense')?.value || 0
                      return (
                        <div className="backdrop-blur-xl bg-[#070a12]/95 border border-white/10 p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[140px]">
                          <p className="font-semibold text-slate-300 pb-1.5 border-b border-white/[0.08] text-[11px] uppercase tracking-wider">
                            Tanggal {label}
                          </p>
                          {Number(inc) > 0 && (
                            <p className="text-emerald-400 flex items-center justify-between font-mono">
                              <span>Masuk:</span>
                              <strong>{formatRupiah(Number(inc))}</strong>
                            </p>
                          )}
                          {Number(exp) > 0 && (
                            <p className="text-rose-400 flex items-center justify-between font-mono">
                              <span>Keluar:</span>
                              <strong>{formatRupiah(Number(exp))}</strong>
                            </p>
                          )}
                          {Number(inc) === 0 && Number(exp) === 0 && (
                            <p className="text-slate-500 text-[11px]">Tidak ada mutasi</p>
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
              Belum ada riwayat mutasi untuk ditampilkan pada grafik
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
