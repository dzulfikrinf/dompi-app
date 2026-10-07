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
      className={`hidden lg:flex flex-col justify-between bg-[#0a0f1c] border-r border-slate-800/80 transition-[width] duration-300 ease-in-out z-20 flex-shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo & Toggle Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800/80">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Logo Dompi"
                width={40}
                height={40}
                className="w-10 h-10 object-contain drop-shadow-md"
                priority
              />
            </div>
            {!collapsed && (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-xl font-extrabold text-white tracking-tight">dompi</span>
                <span className="text-[10px] font-bold border border-cyan-500/50 bg-[#0a0f1c] text-cyan-400 px-2 py-0.5 rounded-full uppercase">
                  Pro
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 active:scale-95"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <Link
            href="/transaksi?action=create"
            className={`w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-3 px-3 rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.35)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
              collapsed ? 'p-3' : ''
            }`}
            title="Catat Transaksi Baru"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm animate-fade-in">Catat Transaksi</span>}
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    isActive
                      ? 'bg-[#111c3a] text-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:translate-x-1'
                  } ${collapsed ? 'justify-center px-0 hover:translate-x-0' : ''}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 transition-transform duration-150" />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 overflow-hidden animate-fade-in">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded-md">
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
      <div className="p-3 border-t border-slate-800/80">
        <div
          className={`bg-[#0f172a] rounded-xl p-2.5 flex items-center justify-between border border-slate-800/80 ${
            collapsed ? 'flex-col gap-2 p-2' : 'gap-3'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'M'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate" title={userEmail || 'Masjul'}>
                  {userEmail ? userEmail.split('@')[0] : 'Masjul'}
                </p>
                <p className="text-[10px] text-slate-400">Aktif</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            aria-label="Keluar dari akun"
            title="Keluar dari akun"
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800/60 transition cursor-pointer flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
