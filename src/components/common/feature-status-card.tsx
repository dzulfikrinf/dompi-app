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
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-850 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h1>
              <span className="text-[10px] font-medium uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Segera Hadir
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
          </div>
        </div>

        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 py-1.5 px-3 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Beranda</span>
        </Link>
      </div>

      {/* Status Notice Box */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Sparkles className="w-4 h-4 text-zinc-500" />
          <span>Rencana Pengembangan Fitur Ini:</span>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-350">
          {plannedFeatures.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-2 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-3.5 rounded-lg">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            <strong className="text-zinc-900 dark:text-zinc-100 font-medium">Aksi Saat Ini:</strong> {currentAlternative}
          </p>
        </div>
      </div>

      {/* Action links */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <Link
          href="/transaksi"
          className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs sm:text-sm py-2 px-3.5 rounded-lg transition"
        >
          Buka Riwayat Transaksi
        </Link>
        <Link
          href="/chat"
          className="bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 font-medium text-xs sm:text-sm py-2 px-3.5 rounded-lg transition"
        >
          Tanya Asisten Dompi
        </Link>
        <Link
          href="/"
          className="sm:hidden text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 py-2 px-2.5"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
