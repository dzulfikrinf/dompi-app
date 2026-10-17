'use client'

import React from 'react'
import { LogOut, Loader2 } from 'lucide-react'

type LogoutModalProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-brutal-xl p-6 text-center space-y-4 text-zinc-900 dark:text-zinc-100 animate-scale-in">
        <div className="w-12 h-12 rounded-2xl bg-[#FFE600] border-2 border-[#121212] text-[#121212] flex items-center justify-center mx-auto shadow-brutal-sm">
          <LogOut className="w-6 h-6 stroke-[2.5]" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
            Konfirmasi Keluar
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Apakah Anda yakin ingin keluar dari akun Dompi? Anda perlu masuk kembali untuk mengakses catatan keuangan.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2.5 pt-2 border-t-2 border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-display font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-2 border-[#121212] dark:border-zinc-700 shadow-brutal-sm btn-brutal transition cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl text-xs sm:text-sm font-display font-black bg-[#FF4365] hover:bg-[#ff2b52] text-white border-2 border-[#121212] shadow-brutal btn-brutal transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
