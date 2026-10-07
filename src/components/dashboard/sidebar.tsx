'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Home,
  List,
  Wallet,
  PieChart as PieChartIcon,
  Target,
  BarChart2,
  CheckSquare,
  MessageSquare,
  Settings,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/transaksi', label: 'Transaksi', icon: List },
  { href: '/chat', label: 'Chat Dompi', icon: MessageSquare, badge: 'AI' },
  { href: '/dompet', label: 'Dompet', icon: Wallet },
  { href: '/anggaran', label: 'Anggaran', icon: PieChartIcon },
  { href: '/laporan', label: 'Laporan', icon: BarChart2 },
  { href: '/target', label: 'Target Tabungan', icon: Target },
  { href: '/tagihan', label: 'Tagihan Rutin', icon: CheckSquare },
  { href: '/pengaturan', label: 'Pengaturan', icon: Settings },
]

type SidebarProps = {
  collapsed: boolean
  onToggleCollapse: () => void
  currentPath: string
  userEmail?: string
  onLogout: () => void
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  currentPath,
  userEmail,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      className={`hidden lg:flex flex-col justify-between bg-[#070a12] border-r border-white/[0.06] transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 flex-shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo & Toggle Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 bg-white/[0.03] border border-white/[0.08] p-1">
              <Image
                src="/logo.png"
                alt="Logo Dompi"
                width={36}
                height={36}
                className="w-8 h-8 object-contain drop-shadow-md"
                priority
              />
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-xl font-extrabold text-white tracking-[-0.03em]">dompi</span>
                <span className="text-[9px] font-bold border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Pro
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors duration-150 cursor-pointer focus:outline-none active:scale-95 border border-transparent hover:border-white/[0.08]"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <Link
            href="/transaksi?action=create"
            className={`w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-2.5 px-3 rounded-2xl transition-all duration-200 shadow-[0_4px_20px_rgba(34,211,238,0.25)] active:scale-[0.98] ${
              collapsed ? 'p-2.5' : ''
            }`}
            title="Catat Transaksi Baru"
          >
            <Plus className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
            {!collapsed && <span className="text-xs font-bold uppercase tracking-wider animate-fade-in">Catat Transaksi</span>}
          </Link>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1" aria-label="Navigasi Utama">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-white/[0.08] text-white border border-white/[0.1] shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.03] hover:translate-x-0.5'
                  } ${collapsed ? 'justify-center px-0 hover:translate-x-0' : ''}`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-cyan-400 rounded-r-full" />
                  )}
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-150 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 overflow-hidden animate-fade-in">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <div
          className={`bg-white/[0.03] border border-white/[0.06] rounded-2xl p-2.5 flex items-center justify-between ${
            collapsed ? 'flex-col gap-2 p-2' : 'gap-3'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border border-white/20">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'M'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate" title={userEmail || 'User'}>
                  {userEmail ? userEmail.split('@')[0] : 'Sobat Dompi'}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            aria-label="Keluar dari akun"
            title="Keluar dari akun"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-xl hover:bg-white/[0.05] transition cursor-pointer flex-shrink-0 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
