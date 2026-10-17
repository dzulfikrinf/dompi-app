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
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 text-center space-y-4 text-zinc-900 dark:text-zinc-100 animate-scale-in">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mx-auto shadow-xs">
          <LogOut className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold tracking-tight">Konfirmasi Keluar</h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Apakah Anda yakin ingin keluar dari akun Dompi? Anda perlu masuk kembali untuk mengakses catatan keuangan.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
