'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, Sparkles } from 'lucide-react'

type HeaderProps = {
  userEmail?: string
}

export default function Header({ userEmail }: HeaderProps) {
  // Format tanggal riil hari ini dalam bahasa Indonesia
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const displayName = userEmail ? userEmail.split('@')[0] : 'Masjul'

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
      <div>
        <p className="text-xs font-semibold text-cyan-400 tracking-wide uppercase mb-1">
          {todayFormatted}
        </p>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
          Halo, {displayName}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Berikut ringkasan kondisi keuangan dan aktivitas terkini akun Anda.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/chat"
          className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-800 text-cyan-400 border border-slate-800 hover:border-cyan-500/40 font-semibold py-2.5 px-4 rounded-xl transition text-xs sm:text-sm shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Chat Dompi</span>
        </Link>
        <Link
          href="/transaksi?action=create"
          className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition shadow-[0_0_15px_rgba(34,211,238,0.25)] text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Transaksi</span>
        </Link>
      </div>
    </div>
  )
}
