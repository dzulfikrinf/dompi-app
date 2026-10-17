'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Home,
  List,
  MessageSquare,
  Menu,
  X,
  Wallet,
  PieChart as PieChartIcon,
  BarChart2,
  Target,
  CheckSquare,
  BookOpen,
  Settings,
  LogOut,
  Plus,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

type MobileNavProps = {
  currentPath: string
  userEmail?: string
  onLogout: () => void
}

export default function MobileNav({
  currentPath,
  userEmail,
  onLogout,
}: MobileNavProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Tutup drawer ketika menekan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false)
      }
    }
    if (isDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen])

  const DRAWER_ITEMS = [
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

  return (
    <>
      {/* 1. Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-950 border-t-2 border-[#121212] dark:border-zinc-800 z-40 px-3 flex items-center justify-around shadow-brutal">
        <Link
          href="/beranda"
          prefetch={true}
          className={`flex flex-col items-center gap-1 text-[11px] font-display transition py-1 px-2.5 rounded-lg ${currentPath === '/beranda'
              ? 'text-zinc-950 dark:text-zinc-50 font-black'
              : 'text-zinc-500 dark:text-zinc-400 font-bold hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
        >
          <Home className="w-4 h-4 stroke-[2.2]" />
          <span>Beranda</span>
        </Link>

        <Link
          href="/transaksi"
          prefetch={true}
          className={`flex flex-col items-center gap-1 text-[11px] font-display transition py-1 px-2.5 rounded-lg ${currentPath === '/transaksi'
              ? 'text-zinc-950 dark:text-zinc-50 font-black'
              : 'text-zinc-500 dark:text-zinc-400 font-bold hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
        >
          <List className="w-4 h-4 stroke-[2.2]" />
          <span>Transaksi</span>
        </Link>

        {/* Center Quick Action Floating-style */}
        <Link
          href="/transaksi?action=create"
          prefetch={true}
          aria-label="Catat Cepat Transaksi"
          className="w-12 h-12 -mt-6 rounded-full bg-[#FFE600] text-[#121212] border-2 border-[#121212] flex items-center justify-center shadow-brutal btn-brutal transition active:scale-95"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </Link>

        <Link
          href="/chat"
          prefetch={true}
          className={`flex flex-col items-center gap-1 text-[11px] font-display transition py-1 px-2.5 rounded-lg ${currentPath === '/chat'
              ? 'text-zinc-950 dark:text-zinc-50 font-black'
              : 'text-zinc-500 dark:text-zinc-400 font-bold hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
        >
          <MessageSquare className="w-4 h-4 stroke-[2.2]" />
          <span>Chat AI</span>
        </Link>

        <button
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Buka menu navigasi lainnya"
          className="flex flex-col items-center gap-1 text-[11px] font-display font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition py-1 px-2.5 rounded-lg cursor-pointer"
        >
          <Menu className="w-4 h-4 stroke-[2.2]" />
          <span>Menu</span>
        </button>
      </div>

      {/* 2. Mobile Drawer Modal */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-white dark:bg-zinc-950 border-l-2 border-[#121212] dark:border-zinc-800 p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#121212] dark:border-zinc-800">
                <Link
                  href="/beranda"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-[#121212] flex items-center justify-center p-1 shadow-brutal-sm">
                    <Image
                      src="/logo.png"
                      alt="Logo Dompi"
                      width={24}
                      height={24}
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-base font-bold font-display text-zinc-900 dark:text-zinc-50 block leading-tight">
                      Dompi
                    </span>
                  </div>
                </Link>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    aria-label="Tutup menu"
                    className="p-1.5 rounded-lg border border-[#121212] dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-[#FFE600] dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Navigation list */}
              <nav className="mt-4 space-y-1.5">
                {DRAWER_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPath === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-display tracking-tight transition ${isActive
                          ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm font-black'
                          : 'font-bold text-zinc-700 dark:text-zinc-300 border-2 border-transparent hover:border-[#121212] dark:hover:border-zinc-700 hover:bg-[#FBF9F4] dark:hover:bg-zinc-900'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-display font-black px-1.5 py-0.5 rounded-full bg-[#00F0FF] text-[#121212] border border-[#121212]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* User info & Logout */}
            <div className="pt-4 border-t-2 border-[#121212] dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-mono truncate max-w-[150px]">{userEmail || 'Pengguna'}</span>
              <button
                onClick={() => {
                  setIsDrawerOpen(false)
                  onLogout()
                }}
                className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold font-display hover:underline cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
