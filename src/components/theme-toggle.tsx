'use client'

import React, { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 ${className}`} />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer active:scale-95 focus:outline-none ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 stroke-[1.8]" />
      ) : (
        <Moon className="w-4 h-4 stroke-[1.8]" />
      )}
    </button>
  )
}
