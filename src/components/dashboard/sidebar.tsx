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
      className={`hidden lg:flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-[width] duration-200 ease-in-out z-20 flex-shrink-0 ${
        collapsed ? 'w-18' : 'w-60'
      }`}
    >
      <div>
        {/* Logo & Toggle Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-zinc-200 dark:bg-zinc-800 p-1">
              <Image
                src="/logo.png"
                alt="Logo Dompi"
                width={28}
                height={28}
                className="w-6 h-6 object-contain"
                priority
              />
            </div>
            {!collapsed && (
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                dompi
              </span>
            )}
          </Link>
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <Link
            href="/transaksi?action=create"
            className={`w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold py-2 px-3 rounded-lg transition text-xs shadow-xs active:scale-[0.98] ${
              collapsed ? 'p-2' : ''
            }`}
            title="Catat Transaksi Baru"
          >
            <Plus className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
            {!collapsed && <span>Catat Transaksi</span>}
          </Link>

          {/* Navigation Links */}
          <nav className="mt-3 space-y-1" aria-label="Navigasi Utama">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-zinc-200/70 dark:bg-zinc-800/80 text-zinc-950 dark:text-zinc-50 font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
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
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
        <div
          className={`bg-zinc-100 dark:bg-zinc-900/60 rounded-lg p-2 flex items-center justify-between border border-zinc-200 dark:border-zinc-800 ${
            collapsed ? 'flex-col gap-2 p-1.5' : 'gap-2'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={userEmail || 'Pengguna'}>
                  {userEmail ? userEmail.split('@')[0] : 'Pengguna'}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Aktif</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            aria-label="Keluar dari akun"
            title="Keluar dari akun"
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
