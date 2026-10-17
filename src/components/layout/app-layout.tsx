'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/dashboard/sidebar'
import MobileNav from '@/components/dashboard/mobile-nav'
import { LogoutModal } from '@/components/ui/logout-modal'

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
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  return (
    <div className="flex h-screen bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-zinc-900 relative">
      {/* 1. Desktop Collapsible Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        currentPath={currentPath}
        userEmail={userEmail}
        onLogout={() => setShowLogoutModal(true)}
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
