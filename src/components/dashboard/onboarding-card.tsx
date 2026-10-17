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
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#121212] dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-brutal transition-all animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFE600] border-2 border-[#121212] text-[#121212] flex items-center justify-center font-extrabold shadow-brutal-sm flex-shrink-0">
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold font-display tracking-tight text-zinc-950 dark:text-zinc-50">
              Selamat datang di Dompi
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
              Dompi sudah otomatis menyiapkan 2 dompet dasar: <span className="font-bold text-[#121212] dark:text-zinc-100 px-1 py-0.2 rounded bg-[#FFE600] border border-[#121212]">Cash</span> dan <span className="font-bold text-[#121212] dark:text-zinc-100 px-1 py-0.2 rounded bg-[#00F0FF] border border-[#121212]">Rekening Utama</span>.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-1.5 rounded-lg border border-transparent hover:border-[#121212] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          title="Tutup panduan"
          aria-label="Tutup panduan"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-5 relative z-10">
        {/* Step 1 */}
        <Link
          href="/dompet"
          className="group flex flex-col justify-between p-4 rounded-xl border-2 border-[#121212] dark:border-zinc-700 bg-[#FBF9F4] dark:bg-zinc-950 hover:bg-[#FFE600]/20 shadow-brutal-sm transition"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold font-display text-zinc-900 dark:text-zinc-100">
              <Wallet className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[2.5]" />
              <span>1. Atur Saldo Awal</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Sesuaikan saldo riil uang tunai atau rekening bank Anda agar pencatatan langsung akurat.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-display font-bold text-zinc-900 dark:text-zinc-100 mt-3 group-hover:translate-x-1 transition-transform">
            <span>Buka Menu Dompet</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </Link>

        {/* Step 2 */}
        <Link
          href="/chat"
          className="group flex flex-col justify-between p-4 rounded-xl border-2 border-[#121212] dark:border-zinc-700 bg-[#FBF9F4] dark:bg-zinc-950 hover:bg-[#00F0FF]/20 shadow-brutal-sm transition"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold font-display text-zinc-900 dark:text-zinc-100">
              <Sparkles className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[2.5]" />
              <span>2. Coba Chat Pertama</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Ketik santai: &ldquo;Makan siang 25rb Cash dan beli bensin 50rb&rdquo;, Dompi akan memprosesnya.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-display font-bold text-zinc-900 dark:text-zinc-100 mt-3 group-hover:translate-x-1 transition-transform">
            <span>Mulai Obrolan AI</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </Link>

        {/* Step 3 */}
        <Link
          href="/panduan"
          className="group flex flex-col justify-between p-4 rounded-xl border-2 border-[#121212] dark:border-zinc-700 bg-[#FBF9F4] dark:bg-zinc-950 hover:bg-[#FFD1DC]/40 shadow-brutal-sm transition"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold font-display text-zinc-900 dark:text-zinc-100">
              <BookOpen className="w-4 h-4 text-zinc-700 dark:text-zinc-300 stroke-[2.5]" />
              <span>3. Panduan & Tips</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Pelajari contoh kalimat chat untuk transfer saldo, koreksi data, dan minta analisis bulanan.
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-display font-bold text-zinc-900 dark:text-zinc-100 mt-3 group-hover:translate-x-1 transition-transform">
            <span>Lihat Cheat Sheet</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </Link>
      </div>
    </div>
  )
}
