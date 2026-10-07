'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, Sparkles, Calendar } from 'lucide-react'

type HeaderProps = {
  userEmail?: string
}

export default function Header({ userEmail }: HeaderProps) {
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const displayName = userEmail ? userEmail.split('@')[0] : 'Sobat Dompi'

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>{todayFormatted}</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-[-0.02em]">
          Selamat Datang, <span>{displayName}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Ikhtisar aktivitas finansial dan alokasi saldo dompet Anda hari ini.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Chat Dompi Button */}
        <Link
          href="/chat"
          className="inline-flex items-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] hover:border-cyan-500/40 font-medium py-2 px-4 rounded-full transition-all duration-200 text-xs sm:text-sm active:scale-95 group shadow-sm"
        >
          <div className="w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>Chat Dompi</span>
        </Link>

        {/* Catat Transaksi Button (Nested Button Architecture) */}
        <Link
          href="/transaksi?action=create"
          className="inline-flex items-center gap-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-2 pl-4 pr-2 rounded-full transition-all duration-200 text-xs sm:text-sm shadow-[0_4px_20px_rgba(34,211,238,0.25)] active:scale-[0.98] group"
        >
          <span>Catat Transaksi</span>
          <div className="w-6 h-6 rounded-full bg-slate-950/15 flex items-center justify-center text-slate-950 group-hover:rotate-90 transition-transform duration-200">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
        </Link>
      </div>
    </div>
  )
}
