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

  return (
    <>
      {/* 1. Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 z-40 px-4 flex items-center justify-around shadow-sm">
        <Link
          href="/"
          prefetch={true}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition py-1 px-2 rounded-lg ${
            currentPath === '/'
              ? 'text-zinc-950 dark:text-zinc-50 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Beranda</span>
        </Link>

        <Link
          href="/transaksi"
          prefetch={true}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition py-1 px-2 rounded-lg ${
            currentPath === '/transaksi'
              ? 'text-zinc-950 dark:text-zinc-50 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Transaksi</span>
        </Link>

        {/* Center Quick Action Floating-style */}
        <Link
          href="/transaksi?action=create"
          prefetch={true}
          aria-label="Catat Transaksi Baru"
          className="w-11 h-11 -mt-5 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 flex items-center justify-center shadow-md transition active:scale-95 border-2 border-white dark:border-zinc-950"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </Link>

        <Link
          href="/chat"
          prefetch={true}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition py-1 px-2 rounded-lg ${
            currentPath === '/chat'
              ? 'text-zinc-950 dark:text-zinc-50 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </Link>

        <button
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Buka menu navigasi lainnya"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition py-1 px-2 rounded-lg cursor-pointer"
        >
          <Menu className="w-4 h-4" />
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
          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between shadow-xl z-10 overflow-y-auto">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center p-1">
                    <Image
                      src="/logo.png"
                      alt="Logo Dompi"
                      width={24}
                      height={24}
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    dompi
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeToggle />
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    aria-label="Tutup menu"
                    className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Navigation list */}
              <nav className="mt-4 space-y-1">
                {DRAWER_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPath === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-50 font-bold'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* User info & Logout */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 truncate max-w-[150px]">{userEmail || 'Pengguna'}</span>
              <button
                onClick={() => {
                  setIsDrawerOpen(false)
                  onLogout()
                }}
                className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
