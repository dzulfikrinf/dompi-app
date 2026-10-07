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
    <div className="flex h-screen bg-[#06080e] text-slate-100 overflow-hidden font-sans selection:bg-cyan-500/30 relative">
      {/* Ambient Lighting Orbs */}
      <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* 1. Desktop Collapsible Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        currentPath={currentPath}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-10 animate-fade-in max-w-[1600px] mx-auto w-full p-4 sm:p-6 lg:p-8">
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
