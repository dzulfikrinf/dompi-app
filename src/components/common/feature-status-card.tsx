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
    <div className="max-w-3xl mx-auto space-y-6 py-6 px-4 sm:px-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">{title}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Segera Hadir
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>

        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white py-2 px-3 rounded-xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Beranda</span>
        </Link>
      </div>

      {/* Honest Status Notice Box */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Rencana Pengembangan Fitur Ini:</span>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
          {plannedFeatures.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 pt-4 border-t border-slate-800/80 bg-[#0a0f1c]/60 p-4 rounded-xl">
          <p className="text-xs text-slate-400">
            <strong className="text-white">Aksi Saat Ini:</strong> {currentAlternative}
          </p>
        </div>
      </div>

      {/* Action links */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Link
          href="/transaksi"
          className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          Buka Riwayat Transaksi
        </Link>
        <Link
          href="/chat"
          className="bg-[#0f172a] hover:bg-slate-800 text-cyan-400 border border-slate-800 font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition"
        >
          Tanya Asisten Dompi
        </Link>
        <Link
          href="/"
          className="sm:hidden text-xs text-slate-400 hover:text-white py-2.5 px-3"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  )
}
