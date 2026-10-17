import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FBF9F4] dark:bg-[#0F1011] text-[#121212] dark:text-[#FBF9F4] font-sans">
      {/* Top Navigation Progress Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#FFE600] border-b border-[#121212] z-50 animate-pulse" />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-2">
            <div className="h-8 w-48 sm:w-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl border border-[#121212]/20 animate-pulse" />
            <div className="h-4 w-32 sm:w-44 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl border border-[#121212]/20 animate-pulse" />
        </div>

        {/* 4 Summary Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 space-y-3 shadow-brutal animate-pulse"
            >
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-8 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Chart / Main Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 space-y-4 shadow-brutal animate-pulse">
            <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-60 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />
          </div>

          {/* Side Card Skeleton */}
          <div className="h-80 bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 space-y-4 shadow-brutal animate-pulse">
            <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl shadow-brutal animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
