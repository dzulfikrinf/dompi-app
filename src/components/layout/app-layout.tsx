'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/dashboard/sidebar'
import MobileNav from '@/components/dashboard/mobile-nav'

type AppLayoutProps = {
  currentPath: string
  userEmail?: string
  children: React.ReactNode
}

export default function AppLayout({
  currentPath,
  userEmail,
  children,
}: AppLayoutProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-[#050811] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* 1. Desktop Collapsible Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        currentPath={currentPath}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-10 animate-fade-in">
          {children}
        </main>
      </div>

      {/* 3. Mobile Navigation Bottom Bar & Drawer */}
      <MobileNav
        currentPath={currentPath}
        userEmail={userEmail}
        onLogout={handleLogout}
      />
    </div>
  )
}
