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
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
        {/* Page Title */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">Pengaturan Akun & Sistem</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Informasi profil pengguna, status integrasi bot, dan konfigurasi aplikasi.
            </p>
          </div>
        </div>

        {/* 1. Profil Pengguna */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-sm font-bold text-white border-b border-slate-800/80 pb-3">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Profil Pengguna & Sesi</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-800/60 gap-1">
              <span className="text-slate-400 font-medium">Email Pemilik</span>
              <span className="text-white font-semibold font-mono">{userEmail || 'dzulfikrinfalah@gmail.com'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-slate-800/60 gap-1">
              <span className="text-slate-400 font-medium">User ID (Supabase Auth)</span>
              <span className="text-slate-400 font-mono text-xs truncate max-w-xs">{userId || '-'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-1">
              <span className="text-slate-400 font-medium">Status Keamanan Database</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Row Level Security (RLS) Aktif
              </span>
            </div>
          </div>
        </div>

        {/* 2. Integrasi Bot Telegram */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-sm font-bold text-white">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>Integrasi Bot Telegram</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Tersambung
            </span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-slate-300">
            <p className="leading-relaxed">
              Bot Telegram Dompi telah terpasang untuk akun Anda. Anda dapat mencatat dan mengoreksi transaksi langsung lewat chat Telegram pribadi tanpa perlu membuka aplikasi web.
            </p>
            <div className="p-3.5 rounded-xl bg-[#0a0f1c] border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Mode Akses:</span>
                <span className="text-white font-medium">Pribadi (Single-User Whitelist)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Proteksi Webhook:</span>
                <span className="text-white font-medium">Secret Token & Chat ID Whitelist</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Asisten AI Dompi */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5 text-sm font-bold text-white">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Asisten Natural Language</span>
            </div>
            <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded-full">
              Gemini 3.5 Flash Lite
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Mendukung pemahaman bahasa Indonesia sehari-hari untuk mencatat pengeluaran, mengubah data, soft-delete, undo, serta ringkasan keuangan bulanan.
          </p>
        </div>

        {/* 4. Keluar dari Akun */}
        <div className="bg-[#0f172a] border border-rose-900/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white">Keluar dari Akun</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Mengakhiri sesi aktif di peramban ini dan kembali ke halaman login.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs sm:text-sm font-bold transition cursor-pointer flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Sekarang</span>
          </button>
        </div>

        {/* 5. Info Versi */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-4">
          <Info className="w-3.5 h-3.5" />
          <span>Dompi MVP v1.0 • Pencatat Keuangan Pribadi</span>
        </div>
      </div>
    </AppLayout>
  )
}
