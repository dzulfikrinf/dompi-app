'use client'

import React, { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-xl border-2 border-[#121212] dark:border-zinc-700 ${className}`} />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 border-[#121212] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-brutal-sm btn-brutal transition cursor-pointer ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 stroke-[2.5]" />
      ) : (
        <Moon className="w-4 h-4 stroke-[2.5]" />
      )}
    </button>
  )
}
