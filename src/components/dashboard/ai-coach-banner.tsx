'use client'

import React from 'react'
import Link from 'next/link'
import { PiggyBank, ArrowRight } from 'lucide-react'

export default function AiCoachBanner() {
  return (
    <div className="bg-[#FFE600] border-2 border-[#121212] rounded-2xl p-5 shadow-brutal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-12 h-12 rounded-xl bg-[#FF4365] border-2 border-[#121212] flex items-center justify-center text-white flex-shrink-0 shadow-brutal-sm">
          <PiggyBank className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <span className="inline-block text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white text-[#121212] border border-[#121212] mb-1">
            TIPS CERDAS DOMPI
          </span>
          <p className="text-xs sm:text-sm font-bold text-[#121212] leading-snug">
            Ingin evaluasi pos paling boros dan rekomendasi alokasi 50/30/20 bulan ini?
          </p>
          <p className="text-[11px] text-[#121212]/80 mt-0.5">
            Tanyakan langsung pada asisten AI Dompi untuk saran keuangan personal.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
        <Link
          href="/chat?q=Analisis%20keuangan%20bulan%20ini"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#121212] text-white hover:bg-zinc-800 text-xs font-display font-bold shadow-brutal-sm btn-brutal transition cursor-pointer"
        >
          <span>Tanya Dompi Sekarang</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </Link>
      </div>
    </div>
  )
}
