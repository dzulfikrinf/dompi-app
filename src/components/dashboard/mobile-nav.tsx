'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0f1c]/95 backdrop-blur-md border-t border-slate-800/80 z-40 px-4 flex items-center justify-around">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition py-1 px-2 rounded-lg ${
            currentPath === '/' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Beranda</span>
        </Link>

        <Link
          href="/transaksi"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition py-1 px-2 rounded-lg ${
            currentPath === '/transaksi' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <List className="w-5 h-5" />
          <span>Transaksi</span>
        </Link>

        {/* Center Quick Action Floating-style */}
        <Link
          href="/transaksi?action=create"
          aria-label="Catat Transaksi Baru"
          className="w-11 h-11 -mt-5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] transition"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </Link>

        <Link
          href="/chat"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition py-1 px-2 rounded-lg ${
            currentPath === '/chat' ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Chat</span>
        </Link>

        <button
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Buka menu navigasi lainnya"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition py-1 px-2 rounded-lg cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span>Menu</span>
        </button>
      </div>

      {/* 2. Mobile Drawer Modal */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative ml-auto w-4/5 max-w-xs h-full bg-[#0a0f1c] border-l border-slate-800 p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto animate-slide-right">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center font-bold text-black font-serif text-lg">
                    d
                  </div>
                  <span className="font-extrabold text-white text-lg">Menu Dompi</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  aria-label="Tutup menu"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation items */}
              <nav className="mt-4 space-y-1" aria-label="Navigasi Menu Mobile">
                {DRAWER_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPath === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? 'bg-[#111c3a] text-cyan-400'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.5 rounded-md">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* User profile & Logout */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{userEmail || 'Masjul'}</p>
                  <p className="text-[10px] text-slate-400">Pengguna Aktif</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDrawerOpen(false)
                  onLogout()
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-400 hover:bg-rose-900/40 font-semibold text-xs transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
