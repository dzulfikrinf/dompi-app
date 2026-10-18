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
  BookOpen,
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
  { href: '/beranda', label: 'Beranda', icon: Home },
  { href: '/transaksi', label: 'Transaksi', icon: List },
  { href: '/chat', label: 'Chat AI Dompi', icon: MessageSquare, badge: 'PRO' },
  { href: '/dompet', label: 'Dompet & Bank', icon: Wallet },
  { href: '/anggaran', label: 'Anggaran', icon: PieChartIcon },
  { href: '/laporan', label: 'Laporan', icon: BarChart2 },
  { href: '/target', label: 'Target Tabungan', icon: Target },
  { href: '/tagihan', label: 'Tagihan Rutin', icon: CheckSquare },
  { href: '/panduan', label: 'Panduan & Tips', icon: BookOpen },
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
      className={`hidden lg:flex flex-col justify-between bg-white dark:bg-zinc-950 border-r-2 border-[#121212] dark:border-zinc-800 transition-[width] duration-200 ease-in-out z-20 flex-shrink-0 ${collapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div>
        {/* Logo & Toggle Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b-2 border-[#121212] dark:border-zinc-800">
          <Link href="/beranda" className="flex items-center gap-2.5 py-1 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#FFE600] border-2 border-[#121212] p-1 shadow-brutal-sm">
              <Image
                src="/logo.png"
                alt="Logo Dompi"
                width={26}
                height={26}
                className="w-5 h-5 object-contain"
                priority
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-black font-display text-zinc-950 dark:text-zinc-50 tracking-tight leading-none">
                  Dompi
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className="p-1.5 rounded-lg border-2 border-[#121212] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-[#FFE600] dark:hover:bg-zinc-800 shadow-brutal-sm transition cursor-pointer btn-brutal"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" /> : <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />}
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="p-3">
          <Link
            href="/transaksi?action=create"
            className={`w-full flex items-center justify-center gap-2 bg-[#FFE600] text-[#121212] border-2 border-[#121212] font-display font-black py-2.5 px-3 rounded-xl transition text-xs tracking-wider shadow-brutal btn-brutal active:scale-[0.98] ${collapsed ? 'p-2' : ''
              }`}
            title="Catat Cepat Transaksi"
          >
            <Plus className="w-4 h-4 stroke-[3] flex-shrink-0" />
            {!collapsed && <span className="tracking-wider uppercase font-black">+ CATAT CEPAT</span>}
          </Link>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1.5" aria-label="Navigasi Utama">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-display tracking-tight transition ${isActive
                    ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm font-black'
                    : 'font-bold text-zinc-700 dark:text-zinc-300 border-2 border-transparent hover:border-[#121212] dark:hover:border-zinc-700 hover:bg-[#FBF9F4] dark:hover:bg-zinc-900'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 stroke-[2.2]" />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-display font-black px-1.5 py-0.5 rounded-full bg-[#00F0FF] text-[#121212] border border-[#121212]">
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
      <div className="p-3 border-t-2 border-[#121212] dark:border-zinc-800">
        <div
          className={`bg-white dark:bg-zinc-900 rounded-xl p-2.5 flex items-center justify-between border-2 border-[#121212] dark:border-zinc-700 shadow-brutal-sm ${collapsed ? 'flex-col gap-2 p-1.5' : 'gap-2'
            }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#FFE600] text-[#121212] border-2 border-[#121212] flex items-center justify-center text-xs font-black font-display flex-shrink-0 shadow-brutal-sm">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'D'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 truncate font-display" title={userEmail || 'Pengguna'}>
                  {userEmail ? userEmail.split('@')[0] : 'Pengguna'}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-medium truncate">
                  {userEmail || 'online'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            aria-label="Keluar dari akun"
            title="Keluar dari akun"
            className="text-zinc-700 hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-400 p-1.5 rounded-lg border border-transparent hover:border-[#121212] dark:hover:border-zinc-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer flex-shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </aside>
  )
}
