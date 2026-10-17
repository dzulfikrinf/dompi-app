'use client'

import React, { useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/dashboard/sidebar'
import MobileNav from '@/components/dashboard/mobile-nav'
import Header from '@/components/dashboard/header'
import SummaryCards from '@/components/dashboard/summary-cards'
import CashflowChart from '@/components/dashboard/cashflow-chart'
import CategoryAllocation from '@/components/dashboard/category-allocation'
import RecentTransactions from '@/components/dashboard/recent-transactions'
import WalletSummary from '@/components/dashboard/wallet-summary'
import AiCoachBanner from '@/components/dashboard/ai-coach-banner'
import { OnboardingCard } from '@/components/dashboard/onboarding-card'
import { LogoutModal } from '@/components/ui/logout-modal'

type Transaction = {
  id: number
  tanggal: string
  kategori: string
  nominal: number
  tipe: 'Pengeluaran' | 'Pemasukan'
  dompet?: string
  deskripsi: string
}

type Wallet = {
  id: number
  nama: string
  tipe: string
  saldo_awal: number
}

type DailyGroup = {
  name: string
  income: number
  expense: number
  rawDate: string
}

type DashboardUIProps = {
  data: Transaction[]
  wallets: Wallet[]
  userEmail?: string
}

export default function DashboardUI({
  data,
  wallets,
  userEmail,
}: DashboardUIProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Error logging out:', err)
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  // 1. Perhitungan Saldo & Ringkasan Arus Kas dari Database
  const now = new Date()
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const totalPemasukan = data
    .filter((t) => t.tipe === 'Pemasukan')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0)

  const totalPengeluaran = data
    .filter((t) => t.tipe === 'Pengeluaran')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0)

  const thisMonthTransactions = data.filter((t) => t.tanggal.startsWith(currentMonthPrefix))

  const pemasukanBulanIni = thisMonthTransactions
    .filter((t) => t.tipe === 'Pemasukan')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0)

  const pengeluaranBulanIni = thisMonthTransactions
    .filter((t) => t.tipe === 'Pengeluaran')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0)

  const totalSaldoAwal = wallets.reduce((acc, curr) => acc + Number(curr.saldo_awal), 0)
  const saldo = totalSaldoAwal + totalPemasukan - totalPengeluaran

  // 2. Pengelompokan Data Grafik Harian
  const groupedByDate = data.reduce((acc, curr) => {
    const date = curr.tanggal
    if (!acc[date]) {
      const parts = date.split('-')
      const formattedLabel = `${parts[2]}/${parts[1]}`
      acc[date] = {
        name: formattedLabel,
        income: 0,
        expense: 0,
        rawDate: date,
      }
    }
    if (curr.tipe === 'Pemasukan') acc[date].income += Number(curr.nominal)
    if (curr.tipe === 'Pengeluaran') acc[date].expense += Number(curr.nominal)
    return acc
  }, {} as Record<string, DailyGroup>)

  const lineChartData = Object.values(groupedByDate).sort(
    (a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
  )

  if (!mounted) return null

  return (
    <div className="flex h-screen bg-[#FBF9F4] dark:bg-[#0F1011] text-[#121212] dark:text-[#FBF9F4] overflow-hidden font-sans selection:bg-[#FFE600] selection:text-[#121212] relative">
      {/* 1. Desktop Collapsible Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        currentPath="/beranda"
        userEmail={userEmail}
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5 pb-24 lg:pb-12 animate-fade-in max-w-[1600px] mx-auto w-full">
          {/* Top Header & Greeting */}
          <Header
            userEmail={userEmail}
            saldo={saldo}
            pemasukanBulanIni={pemasukanBulanIni}
            pengeluaranBulanIni={pengeluaranBulanIni}
          />

          {/* Onboarding Quick Start for New Users */}
          <OnboardingCard hasTransactions={data.length > 0} />

          {/* 4 Neo-Brutalist Summary Metrics Cards */}
          <SummaryCards
            saldo={saldo}
            pemasukanBulanIni={pemasukanBulanIni}
            totalPemasukan={totalPemasukan}
            pengeluaranBulanIni={pengeluaranBulanIni}
            totalPengeluaran={totalPengeluaran}
          />

          {/* Middle Row: Grafik Arus Kas & Alokasi Kategori */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8 flex flex-col">
              <CashflowChart
                data={lineChartData}
                totalPemasukan={totalPemasukan}
                totalPengeluaran={totalPengeluaran}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <CategoryAllocation transactions={data} />
            </div>
          </div>

          {/* Bottom Row: Transaksi Terbaru & Dompet 2x2 Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-7 flex flex-col">
              <RecentTransactions transactions={data} />
            </div>
            <div className="lg:col-span-5 flex flex-col">
              <WalletSummary wallets={wallets} transactions={data} />
            </div>
          </div>

          {/* Bottom Banner: Tips Cerdas Dompi */}
          <AiCoachBanner />
        </main>
      </div>

      {/* 3. Mobile Navigation Dock & Drawer */}
      <MobileNav
        currentPath="/beranda"
        userEmail={userEmail}
        onLogout={() => setShowLogoutModal(true)}
      />

      {/* 4. Modal Konfirmasi Logout */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => !isLoggingOut && setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </div>
  )
}
