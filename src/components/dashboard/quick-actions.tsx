'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, Plus, ArrowRight } from 'lucide-react'

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 1. Akses Cepat Chat Dompi */}
      <Link
        href="/chat"
        className="bg-gradient-to-br from-[#0f172a] to-[#111c3a] border border-cyan-500/30 hover:border-cyan-400/60 rounded-2xl p-5 transition group relative overflow-hidden flex flex-col justify-between"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full">
            AI Assistant
          </span>
        </div>
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
            Chat Dompi
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Catat, koreksi transaksi, atau tanyakan pengeluaran dengan bahasa santai sehari-hari.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-cyan-400">
          <span>Mulai percakapan</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* 2. Tombol Catat Transaksi Manual */}
      <Link
        href="/transaksi?action=create"
        className="bg-[#0f172a] hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition group flex flex-col justify-between"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700/60 group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
            Form Manual
          </span>
        </div>
        <div>
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1">
            Catat Transaksi Manual
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Input transaksi secara terperinci dengan form pilihan dompet, kategori, dan tanggal.
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
          <span>Buka formulir</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  )
}
