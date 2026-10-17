'use client'

import React, { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Sparkles, Wallet, BookOpen, ArrowRight, X } from 'lucide-react'

type OnboardingCardProps = {
  hasTransactions: boolean
}

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getDismissedSnapshot() {
  if (typeof window === 'undefined') return true
  return localStorage.getItem('dompi_onboarding_dismissed') === 'true'
}

function getServerSnapshot() {
  return true
}

export function OnboardingCard({ hasTransactions }: OnboardingCardProps) {
  const isPermanentlyDismissed = useSyncExternalStore(
    subscribe,
    getDismissedSnapshot,
    getServerSnapshot
  )
  const [closedLocally, setClosedLocally] = useState(false)

  if (hasTransactions || isPermanentlyDismissed || closedLocally) {
    return null
  }

  const handleDismiss = () => {
    setClosedLocally(true)
    try {
      localStorage.setItem('dompi_onboarding_dismissed', 'true')
    } catch {
      // Ignore storage errors
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 p-5 sm:p-6 shadow-sm transition-all animate-fade-in">
      {/* Background subtle decoration */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-zinc-200/50 dark:bg-zinc-800/40 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
            ✨
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Selamat datang di Dompi! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Dompi sudah otomatis menyiapkan 2 dompet dasar: <span className="font-medium text-zinc-800 dark:text-zinc-200">Cash</span> dan <span className="font-medium text-zinc-800 dark:text-zinc-200">Rekening Utama</span>.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg transition cursor-pointer"
          title="Tutup panduan"
          aria-label="Tutup panduan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5 relative z-10">
        {/* Step 1 */}
        <Link
          href="/dompet"
          className="group flex flex-col justify-between p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70 transition"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Wallet className="w-4 h-4 text-zinc-500" />
              <span>1. Atur Saldo Awal</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Sesuaikan saldo riil uang tunai atau rekening bank Anda agar pencatatan langsung akurat.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 mt-3 group-hover:translate-x-0.5 transition-transform">
            <span>Buka Menu Dompet</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Step 2 */}
        <Link
          href="/chat"
          className="group flex flex-col justify-between p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70 transition"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <Sparkles className="w-4 h-4 text-zinc-500" />
              <span>2. Coba Chat Pertama</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Ketik santai seperti: &ldquo;Makan siang 25rb Cash dan beli bensin 50rb&rdquo;, Dompi akan mencatatnya.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 mt-3 group-hover:translate-x-0.5 transition-transform">
            <span>Mulai Obrolan</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        {/* Step 3 */}
        <Link
          href="/panduan"
          className="group flex flex-col justify-between p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70 transition"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <BookOpen className="w-4 h-4 text-zinc-500" />
              <span>3. Panduan & Tips</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Pelajari contoh kalimat chat untuk transfer saldo, koreksi data, dan minta analisis bulanan.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-800 dark:text-zinc-200 mt-3 group-hover:translate-x-0.5 transition-transform">
            <span>Lihat Cheat Sheet</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      </div>
    </div>
  )
}
