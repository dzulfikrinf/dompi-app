'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, Plus, ArrowUpRight, MessageSquareQuote } from 'lucide-react'

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
      {/* 1. Akses Cepat Chat Dompi */}
      <Link
        href="/chat"
        className="group relative rounded-3xl p-1 bg-gradient-to-br from-cyan-500/20 via-white/[0.04] to-transparent border border-cyan-500/25 hover:border-cyan-400/50 shadow-lg hover:shadow-cyan-950/20 transition-all duration-300 active:scale-[0.99] flex flex-col justify-between overflow-hidden"
      >
        <div className="rounded-[calc(1.5rem-0.25rem)] p-5 sm:p-6 bg-[#0b0f19] border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] h-full flex flex-col justify-between relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 px-2.5 py-0.5 rounded-full">
              Natural AI
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1.5 flex items-center gap-1.5">
              <span>Asisten Chat Dompi</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catat, koreksi mutasi, atau minta rekap keuangan cukup dengan bahasa percakapan sehari-hari.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-cyan-400">
            <span>Mulai ngobrol sekarang</span>
            <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Link>

      {/* 2. Tombol Catat Transaksi Manual */}
      <Link
        href="/transaksi?action=create"
        className="group relative rounded-3xl p-1 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent border border-white/[0.08] hover:border-white/[0.18] shadow-lg transition-all duration-300 active:scale-[0.99] flex flex-col justify-between overflow-hidden"
      >
        <div className="rounded-[calc(1.5rem-0.25rem)] p-5 sm:p-6 bg-[#0b0f19] border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] h-full flex flex-col justify-between relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-2xl bg-white/[0.05] text-slate-200 flex items-center justify-center border border-white/[0.08] group-hover:scale-105 transition-transform duration-200">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Formulir Web
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white group-hover:text-slate-100 transition-colors mb-1.5">
              Input Transaksi Manual
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catat pengeluaran atau pemasukan secara manual dengan rincian kategori, dompet, dan tanggal spesifik.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
            <span>Buka formulir input</span>
            <div className="w-6 h-6 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
