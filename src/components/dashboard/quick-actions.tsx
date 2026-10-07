'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, MessageSquare, Plus } from 'lucide-react'

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 1. Akses Cepat Chat Dompi */}
      <Link
        href="/chat"
        className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl p-5 transition flex flex-col justify-between shadow-xs active:scale-[0.99]"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
            AI Assistant
          </span>
        </div>

        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
            Asisten Chat Dompi
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Catat atau periksa mutasi keuangan cukup dengan percakapan bahasa alami sehari-hari.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
          <span>Buka percakapan</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>

      {/* 2. Tombol Catat Transaksi Manual */}
      <Link
        href="/transaksi?action=create"
        className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-xl p-5 transition flex flex-col justify-between shadow-xs active:scale-[0.99]"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-mono uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
            Manual
          </span>
        </div>

        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
            Input Transaksi Manual
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Formulir pencatatan lengkap dengan pemilihan dompet, tanggal, kategori, dan deskripsi.
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
          <span>Buka formulir</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  )
}
