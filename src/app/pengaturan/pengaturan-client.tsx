'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AppLayout from '@/components/layout/app-layout'
import { LogoutModal } from '@/components/ui/logout-modal'
import { TelegramConnectionInfo } from '@/lib/services/telegram-service'
import {
  generateTelegramPairingTokenAction,
  disconnectTelegramAction,
  getTelegramStatusAction,
} from './actions'
import {
  Settings,
  User,
  ShieldCheck,
  Send,
  Sparkles,
  LogOut,
  Info,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Unlink,
  CheckCircle2,
} from 'lucide-react'

type PengaturanClientProps = {
  userEmail?: string
  userId?: string
  initialTelegramInfo?: TelegramConnectionInfo
}

export default function PengaturanClient({
  userEmail,
  userId,
  initialTelegramInfo,
}: PengaturanClientProps) {
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // State Integrasi Telegram
  const [telegramInfo, setTelegramInfo] = useState<TelegramConnectionInfo>(
    initialTelegramInfo || { isConnected: false }
  )
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const [pairingUrl, setPairingUrl] = useState<string | null>(null)
  const [pairingToken, setPairingToken] = useState<string | null>(null)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Error logging out:', err)
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const handleGeneratePairing = async () => {
    setErrorMsg(null)
    setIsGeneratingToken(true)
    try {
      const res = await generateTelegramPairingTokenAction()
      if (res.success && res.botUrl && res.token) {
        setPairingUrl(res.botUrl)
        setPairingToken(res.token)
      } else {
        setErrorMsg(res.error || 'Gagal membuat tautan penghubung.')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat menghubungi server.')
    } finally {
      setIsGeneratingToken(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Apakah Anda yakin ingin memutuskan tautan bot Telegram dari akun Dompi ini?')) {
      return
    }

    setIsDisconnecting(true)
    setErrorMsg(null)
    try {
      const res = await disconnectTelegramAction()
      if (res.success) {
        setTelegramInfo({ isConnected: false })
        setPairingUrl(null)
        setPairingToken(null)
      } else {
        setErrorMsg(res.error || 'Gagal memutuskan tautan Telegram.')
      }
    } catch {
      setErrorMsg('Terjadi kendala saat memutuskan tautan.')
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleCheckStatus = async () => {
    try {
      const res = await getTelegramStatusAction()
      if (res.success && res.data) {
        setTelegramInfo(res.data)
        if (res.data.isConnected) {
          setPairingUrl(null)
          setPairingToken(null)
        }
      }
    } catch {
      //
    }
  }

  const handleCopyCommand = async () => {
    if (!pairingToken) return
    try {
      await navigator.clipboard.writeText(`/start ${pairingToken}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      //
    }
  }

  return (
    <AppLayout currentPath="/pengaturan" userEmail={userEmail}>
      <div className="max-w-4xl mx-auto space-y-6 text-zinc-900 dark:text-zinc-100 pb-16">
        {/* Page Title Neo-Brutalist */}
        <div className="flex items-center gap-3.5 pb-4 border-b-2 border-[#121212] dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-[#FFE600] text-[#121212] flex items-center justify-center border-2 border-[#121212] shadow-brutal flex-shrink-0">
            <Settings className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
              Pengaturan Akun & Sistem
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
              Informasi profil pengguna, status integrasi bot, dan konfigurasi aplikasi.
            </p>
          </div>
        </div>

        {/* 1. Profil Pengguna */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-6 sm:p-7 space-y-4 shadow-brutal">
          <div className="flex items-center gap-2.5 text-sm sm:text-base font-black font-display border-b-2 border-zinc-100 dark:border-zinc-800 pb-3 text-zinc-950 dark:text-zinc-50">
            <div className="w-7 h-7 rounded-lg bg-[#FFE600] border border-[#121212] flex items-center justify-center text-[#121212]">
              <User className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>Profil Pengguna & Sesi</span>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 gap-2">
              <span className="text-zinc-600 dark:text-zinc-400 font-display font-bold">Email Akun</span>
              <span className="font-bold font-mono bg-[#FBF9F4] dark:bg-zinc-950 px-3 py-1 rounded-xl border border-[#121212] dark:border-zinc-800">
                {userEmail || 'Pengguna'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 gap-2">
              <span className="text-zinc-600 dark:text-zinc-400 font-display font-bold">User ID (Supabase Auth)</span>
              <span className="text-zinc-500 font-mono text-xs truncate max-w-xs bg-[#FBF9F4] dark:bg-zinc-950 px-3 py-1 rounded-xl border border-[#121212] dark:border-zinc-800">
                {userId || '-'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
              <span className="text-zinc-600 dark:text-zinc-400 font-display font-bold">Status Keamanan Database</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-[#121212] font-display font-black bg-[#00FF66] border-2 border-[#121212] px-3 py-1 rounded-full shadow-2xs">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                Row Level Security (RLS) Aktif
              </span>
            </div>
          </div>
        </div>

        {/* 2. Integrasi Bot Telegram Multi-User */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-6 sm:p-7 space-y-4 shadow-brutal">
          <div className="flex items-center justify-between border-b-2 border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-black font-display text-zinc-950 dark:text-zinc-50">
              <div className="w-7 h-7 rounded-lg bg-[#00F0FF] border border-[#121212] flex items-center justify-center text-[#121212]">
                <Send className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Integrasi Bot Telegram</span>
            </div>
            {telegramInfo.isConnected ? (
              <span className="inline-flex items-center gap-1 text-xs font-black font-display text-[#121212] bg-[#00FF66] border-2 border-[#121212] px-3 py-1 rounded-full shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                Tersambung
              </span>
            ) : (
              <span className="text-xs font-black font-display text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 px-3 py-1 rounded-full">
                Belum Terhubung
              </span>
            )}
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
            <p className="leading-relaxed font-medium">
              Hubungkan akun Telegram pribadimu dengan Dompi agar kamu bisa langsung mencatat pengeluaran, mengecek saldo, atau minta analisis bulanan hanya lewat pesan chat.
            </p>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-[#121212] text-rose-800 dark:text-rose-200 text-xs font-bold shadow-brutal-sm">
                {errorMsg}
              </div>
            )}

            {/* Jika SUDAH terhubung */}
            {telegramInfo.isConnected ? (
              <div className="space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 space-y-3 text-xs shadow-brutal-sm">
                  <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="font-display font-bold text-zinc-600 dark:text-zinc-400">Nama Telegram:</span>
                    <span className="font-extrabold font-display text-zinc-900 dark:text-zinc-100">
                      {telegramInfo.telegramFirstName || '-'}
                    </span>
                  </div>
                  {telegramInfo.telegramUsername && (
                    <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-zinc-800">
                      <span className="font-display font-bold text-zinc-600 dark:text-zinc-400">Username:</span>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        @{telegramInfo.telegramUsername}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="font-display font-bold text-zinc-600 dark:text-zinc-400">Telegram Chat ID:</span>
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">
                      {telegramInfo.telegramChatId || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-display font-bold text-zinc-600 dark:text-zinc-400">Status Keamanan:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-display font-extrabold">
                      Terkunci Khusus Akun Anda
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="https://t.me/dompi25_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-[#FFE600] text-[#121212] hover:bg-[#ffe81a] border-2 border-[#121212] text-xs font-display font-black shadow-brutal btn-brutal transition cursor-pointer"
                  >
                    <span>Buka Chat di Telegram</span>
                    <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                  </a>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-2 border-[#121212] dark:border-zinc-700 text-xs font-display font-bold shadow-brutal-sm btn-brutal transition cursor-pointer disabled:opacity-50"
                  >
                    {isDisconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlink className="w-3.5 h-3.5 stroke-[2.5]" />}
                    <span>Putuskan Tautan</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Jika BELUM terhubung */
              <div className="space-y-4 pt-1">
                {pairingUrl && pairingToken ? (
                  <div className="p-5 rounded-2xl bg-[#FFE600]/15 dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 space-y-4 shadow-brutal-sm">
                    <div className="space-y-1">
                      <p className="font-black font-display text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                        Langkah Menghubungkan ke Telegram:
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        Klik tombol di bawah untuk langsung membuka bot Telegram, atau salin kode perintah ke obrolan bot.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <a
                        href={pairingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FFE600] text-[#121212] hover:bg-[#ffe81a] border-2 border-[#121212] text-xs font-display font-black shadow-brutal btn-brutal transition text-center cursor-pointer"
                      >
                        <span>1. Buka Bot Telegram (@dompi25_bot)</span>
                        <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyCommand}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 text-xs font-display font-bold text-zinc-900 dark:text-zinc-100 shadow-brutal-sm btn-brutal transition cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Salin Perintah</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                      <span>Kode: <strong className="font-mono text-zinc-900 dark:text-zinc-100 font-bold">/start {pairingToken}</strong> (Berlaku 15 menit)</span>
                      <button
                        type="button"
                        onClick={handleCheckStatus}
                        className="font-display font-bold text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 stroke-[2.5]" />
                        <span>Cek Status</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={handleGeneratePairing}
                      disabled={isGeneratingToken}
                      className="inline-flex items-center gap-2 py-3 px-5 rounded-2xl bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] border-2 border-[#121212] text-xs sm:text-sm font-display font-black shadow-brutal btn-brutal transition cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingToken ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Menyiapkan Tautan...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 stroke-[2.5]" />
                          <span>Hubungkan ke Telegram</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Asisten AI Dompi */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-6 sm:p-7 space-y-3 shadow-brutal">
          <div className="flex items-center justify-between border-b-2 border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-black font-display text-zinc-950 dark:text-zinc-50">
              <div className="w-7 h-7 rounded-lg bg-[#FFE600] border border-[#121212] flex items-center justify-center text-[#121212]">
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Asisten Natural Language</span>
            </div>
            <span className="text-xs font-black font-display text-[#121212] bg-[#00F0FF] border-2 border-[#121212] px-3 py-0.5 rounded-full shadow-2xs">
              Gemini 3.5 Flash Lite
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Mendukung pemahaman bahasa Indonesia sehari-hari untuk mencatat pengeluaran jamak, transfer saldo, penyesuaian nominal riil, evaluasi arus kas, serta saran keuangan yang dapat langsung diterapkan.
          </p>
        </div>

        {/* 4. Keluar dari Akun */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-brutal">
          <div>
            <h2 className="text-base font-black font-display text-zinc-950 dark:text-zinc-50">Keluar dari Akun</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              Mengakhiri sesi aktif di peramban ini dan kembali ke halaman login.
            </p>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FF4365] text-white hover:bg-rose-600 border-2 border-[#121212] text-xs sm:text-sm font-display font-black shadow-brutal btn-brutal transition cursor-pointer flex-shrink-0"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
            <span>Keluar Sekarang</span>
          </button>
        </div>

        {/* 5. Info Versi */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 pt-2 font-display font-bold">
          <Info className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Dompi • Pencatat Keuangan Pribadi</span>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => !isLoggingOut && setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </AppLayout>
  )
}
