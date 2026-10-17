'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Calendar, Plus, Bot, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

type HeaderProps = {
  userEmail?: string
  saldo?: number
  pemasukanBulanIni?: number
  pengeluaranBulanIni?: number
}

export default function Header({
  userEmail,
  saldo,
  pemasukanBulanIni = 0,
  pengeluaranBulanIni = 0,
}: HeaderProps) {
  void saldo // acknowledged for backward compatibility
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const todayMonthYear = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const displayName = userEmail
    ? userEmail.split('@')[0].replace(/[._-]/g, ' ')
    : 'Teman'

  const formattedName =
    displayName.charAt(0).toUpperCase() + displayName.slice(1)

  const isSaving = pemasukanBulanIni >= pengeluaranBulanIni

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    router.push(`/transaksi?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <div className="space-y-4">
      {/* 1. Top Bar: Search, Date Filter, Bot Status, Theme & CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b-2 border-[#121212] dark:border-zinc-800">
        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, tabungan, dompet..."
            className="w-full bg-white dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 pl-10 pr-4 py-2 rounded-full border-2 border-[#121212] dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#FFE600] shadow-brutal-sm transition"
          />
        </form>

        {/* Right Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Filter Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 text-xs font-display font-bold text-zinc-800 dark:text-zinc-200 shadow-brutal-sm">
            <Calendar className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="capitalize">{todayMonthYear}</span>
          </div>

          <ThemeToggle />

          {/* Primary Action Button */}
          <Link
            href="/transaksi?action=create"
            className="inline-flex items-center justify-center gap-1.5 bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] font-display font-bold px-4 py-1.5 rounded-full border-2 border-[#121212] shadow-brutal btn-brutal text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ CATAT CEPAT</span>
          </Link>
        </div>
      </div>

      {/* 2. Greeting & AI Coach Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-zinc-950 dark:text-zinc-50">
              Halo, {formattedName}!
            </h1>
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FFE600] text-[#121212] border-2 border-[#121212] text-xs font-display font-bold shadow-brutal-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Status Dompi: {isSaving ? 'Arus Kas Sehat' : 'Waspada Belanja'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            {isSaving
              ? 'Arus kas stabil, sisa budget harianmu sangat aman sampai akhir bulan.'
              : 'Pengeluaran bulan ini melebihi pemasukan, yuk kurangi pos jajan sekunder!'}
          </p>
        </div>

        {/* AI Coach Card */}
        <Link
          href="/chat?q=Analisis%20keuangan%20bulan%20ini"
          className="flex items-center gap-3 bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-xl p-3 shadow-brutal hover:bg-[#FFE600]/20 dark:hover:bg-zinc-800 transition btn-brutal max-w-sm"
        >
          <div className="w-10 h-10 rounded-lg bg-[#00F0FF] border-2 border-[#121212] flex items-center justify-center text-[#121212] flex-shrink-0 shadow-brutal-sm">
            <Bot className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1 text-[10px] font-display font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#FFE600] fill-[#FFE600]" />
              <span>DOMPI AI COACH</span>
            </div>
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">
              {isSaving
                ? `Net surplus Rp ${(pemasukanBulanIni - pengeluaranBulanIni).toLocaleString('id-ID')} terjaga.`
                : 'Peringatan: Pos belanja sudah melebihi budget bulanan.'}
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
