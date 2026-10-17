import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Sparkles,
  BarChart2,
  PieChart as PieChartIcon,
  Target,
  CheckSquare,
  Wallet,
  Check,
} from 'lucide-react'

const ICON_MAP = {
  chart: BarChart2,
  pie: PieChartIcon,
  target: Target,
  check: CheckSquare,
  wallet: Wallet,
} as const

export type FeatureIconType = keyof typeof ICON_MAP

type FeatureStatusCardProps = {
  title: string
  icon: FeatureIconType
  description: string
  plannedFeatures: string[]
  currentAlternative: string
}

export default function FeatureStatusCard({
  title,
  icon,
  description,
  plannedFeatures,
  currentAlternative,
}: FeatureStatusCardProps) {
  const IconComponent = ICON_MAP[icon] || Sparkles

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b-2 border-[#121212] dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FFE600] text-[#121212] flex items-center justify-center border-2 border-[#121212] shadow-brutal-sm">
            <IconComponent className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                {title}
              </h1>
              <span className="text-[10px] font-display font-black uppercase tracking-wider bg-[#FFD1DC] text-[#121212] border-2 border-[#121212] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <Clock className="w-3 h-3 stroke-[2.5]" />
                Segera Hadir
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
              {description}
            </p>
          </div>
        </div>

        <Link
          href="/beranda"
          className="hidden sm:flex items-center gap-1.5 text-xs font-display font-bold text-zinc-900 dark:text-zinc-100 py-2 px-3.5 rounded-xl bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 shadow-brutal-sm btn-brutal transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Beranda</span>
        </Link>
      </div>

      {/* Status Notice Box */}
      <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 shadow-brutal space-y-4">
        <div className="flex items-center gap-2 text-sm font-extrabold font-display text-zinc-950 dark:text-zinc-50 border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
          <Sparkles className="w-4 h-4 text-[#006970] dark:text-[#00F0FF] stroke-[2.5]" />
          <span>Rencana Pengembangan Fitur Ini:</span>
        </div>
        <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
          {plannedFeatures.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-md bg-[#00FF66] border border-[#121212] text-[#121212] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-3 border-t-2 border-[#121212]/20 dark:border-zinc-800 bg-[#FFE600]/20 dark:bg-zinc-950 border-2 border-[#121212] p-4 rounded-xl shadow-brutal-sm">
          <p className="text-xs text-zinc-900 dark:text-zinc-200 font-medium leading-relaxed">
            <strong className="font-display font-black text-[#121212] dark:text-[#FFE600] block mb-0.5">Aksi Alternatif Saat Ini:</strong>{' '}
            {currentAlternative}
          </p>
        </div>
      </div>

      {/* Action links */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link
          href="/transaksi"
          className="bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] border-2 border-[#121212] font-display font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-brutal btn-brutal transition cursor-pointer"
        >
          Buka Riwayat Transaksi
        </Link>
        <Link
          href="/chat"
          className="bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-950 dark:text-zinc-50 border-2 border-[#121212] dark:border-zinc-700 font-display font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-brutal btn-brutal transition cursor-pointer"
        >
          Tanya Asisten Dompi
        </Link>
        <Link
          href="/beranda"
          className="sm:hidden text-xs font-display font-bold text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 py-2 px-2.5 underline"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
