'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, MessageSquare, Calendar } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

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

  const displayName = userEmail ? userEmail.split('@')[0] : 'Pengguna'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-1">
          <Calendar className="w-3.5 h-3.5" />
          <span suppressHydrationWarning>{todayFormatted}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Selamat Datang, {displayName}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Ringkasan posisi keuangan dan arus kas akun Anda.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <ThemeToggle />

        <Link
          href="/chat"
          className="inline-flex items-center justify-center h-9 gap-1.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 rounded-lg text-xs font-medium transition active:scale-95 shadow-xs"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat Dompi</span>
        </Link>

        <Link
          href="/transaksi?action=create"
          className="inline-flex items-center justify-center h-9 gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 px-3 rounded-lg text-xs font-medium transition active:scale-95 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Transaksi</span>
        </Link>
      </div>
    </div>
  )
}
