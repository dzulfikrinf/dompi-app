'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/app-layout'
import {
  Settings,
  User,
  ShieldCheck,
  Send,
  Sparkles,
  LogOut,
  Info,
} from 'lucide-react'

type PengaturanClientProps = {
  userEmail?: string
  userId?: string
}

export default function PengaturanClient({
  userEmail,
  userId,
}: PengaturanClientProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <AppLayout currentPath="/pengaturan" userEmail={userEmail}>
      <div className="max-w-3xl mx-auto space-y-5 text-zinc-900 dark:text-zinc-100">
        {/* Page Title */}
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Pengaturan Akun & Sistem</h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Informasi profil pengguna, status integrasi bot, dan konfigurasi aplikasi.
            </p>
          </div>
        </div>

        {/* 1. Profil Pengguna */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
            <User className="w-4 h-4 text-zinc-500" />
            <span>Profil Pengguna & Sesi</span>
          </div>

          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800 gap-1">
              <span className="text-zinc-500">Email Pemilik</span>
              <span className="font-medium font-mono">{userEmail || 'dzulfikrinfalah@gmail.com'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 border-b border-zinc-100 dark:border-zinc-800 gap-1">
              <span className="text-zinc-500">User ID (Supabase Auth)</span>
              <span className="text-zinc-400 font-mono text-xs truncate max-w-xs">{userId || '-'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1.5 gap-1">
              <span className="text-zinc-500">Status Keamanan Database</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3.5 h-3.5" />
                Row Level Security (RLS) Aktif
              </span>
            </div>
          </div>
        </div>

        {/* 2. Integrasi Bot Telegram */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Send className="w-4 h-4 text-zinc-500" />
              <span>Integrasi Bot Telegram</span>
            </div>
            <span className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded">
              Tersambung
            </span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <p className="leading-relaxed">
              Bot Telegram Dompi telah terpasang untuk akun Anda. Anda dapat mencatat dan mengoreksi transaksi langsung lewat chat Telegram pribadi tanpa perlu membuka aplikasi web.
            </p>
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Mode Akses:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Pribadi (Single-User Whitelist)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Proteksi Webhook:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Secret Token & Chat ID Whitelist</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Asisten AI Dompi */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-zinc-500" />
              <span>Asisten Natural Language</span>
            </div>
            <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded">
              Gemini 3.5 Flash Lite
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Mendukung pemahaman bahasa Indonesia sehari-hari untuk mencatat pengeluaran, mengubah data, soft-delete, undo, serta ringkasan keuangan bulanan.
          </p>
        </div>

        {/* 4. Keluar dari Akun */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold">Keluar dari Akun</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Mengakhiri sesi aktif di peramban ini dan kembali ke halaman login.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 text-xs font-medium transition cursor-pointer flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sekarang</span>
          </button>
        </div>

        {/* 5. Info Versi */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 pt-3">
          <Info className="w-3.5 h-3.5" />
          <span>Dompi MVP v1.0 • Pencatat Keuangan Pribadi</span>
        </div>
      </div>
    </AppLayout>
  )
}
