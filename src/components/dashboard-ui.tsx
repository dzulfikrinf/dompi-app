'use client'

import React, { useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/dashboard/sidebar'
import MobileNav from '@/components/dashboard/mobile-nav'
import Header from '@/components/dashboard/header'
import SummaryCards from '@/components/dashboard/summary-cards'
import CashflowChart from '@/components/dashboard/cashflow-chart'
import RecentTransactions from '@/components/dashboard/recent-transactions'
import WalletSummary from '@/components/dashboard/wallet-summary'
import QuickActions from '@/components/dashboard/quick-actions'

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
  budget: number
  wallets: Wallet[]
  userEmail?: string
}

export default function DashboardUI({
  data,
  budget,
  wallets,
  userEmail,
}: DashboardUIProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // 1. Perhitungan Saldo & Ringkasan Arus Kas
  const totalPemasukan = data
    .filter((t) => t.tipe === 'Pemasukan')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0)

  const totalPengeluaran = data
    .filter((t) => t.tipe === 'Pengeluaran')
    .reduce((acc, curr) => acc + Number(curr.nominal), 0)

  const totalSaldoAwal = wallets.reduce((acc, curr) => acc + Number(curr.saldo_awal), 0)
  const saldo = totalSaldoAwal + totalPemasukan - totalPengeluaran

  const budgetBulanan = budget
  const sisaAnggaran = budgetBulanan - totalPengeluaran
  const persentaseAnggaran = Math.min(
    Math.round((totalPengeluaran / budgetBulanan) * 100),
    100
  )

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
    <div className="flex h-screen bg-[#050811] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* 1. Desktop Collapsible Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        currentPath="/"
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 pb-24 lg:pb-10 animate-fade-in">
          {/* Top Header */}
          <Header userEmail={userEmail} />

          {/* 1-4. Summary Metrics Cards */}
          <SummaryCards
            saldo={saldo}
            totalPemasukan={totalPemasukan}
            totalPengeluaran={totalPengeluaran}
            sisaAnggaran={sisaAnggaran}
            budgetBulanan={budgetBulanan}
            persentaseAnggaran={persentaseAnggaran}
          />

          {/* 7-8. Akses Cepat Catat Transaksi & Chat Dompi */}
          <QuickActions />

          {/* 5 & 9. Grafik Arus Kas & Ringkasan Dompet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <CashflowChart
                data={lineChartData}
                totalPemasukan={totalPemasukan}
                totalPengeluaran={totalPengeluaran}
              />
            </div>
            <div className="lg:col-span-4">
              <WalletSummary wallets={wallets} transactions={data} />
            </div>
          </div>

          {/* 6. Transaksi Terbaru */}
          <RecentTransactions transactions={data} />
        </main>
      </div>

      {/* 3. Mobile Navigation Bottom Bar & Drawer */}
      <MobileNav
        currentPath="/"
        userEmail={userEmail}
        onLogout={handleLogout}
      />
    </div>
  )
}