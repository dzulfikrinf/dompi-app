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

  const sizeClass = className.includes('w-') ? '' : 'w-9 h-9 sm:w-10 sm:h-10'

  if (!mounted) {
    return (
      <div className={`rounded-xl border-2 border-[#121212] dark:border-zinc-700 ${sizeClass} ${className}`} />
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
      title={isDark ? 'Mode Terang' : 'Mode Gelap'}
      className={`inline-flex items-center justify-center rounded-xl border-2 border-[#121212] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-brutal-sm btn-brutal transition cursor-pointer ${sizeClass} ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 stroke-[2.5]" />
      ) : (
        <Moon className="w-4 h-4 stroke-[2.5]" />
      )}
    </button>
  )
}
