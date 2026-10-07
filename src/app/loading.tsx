import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Top Navigation Progress Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-100 z-50 animate-pulse" />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-2">
            <div className="h-8 w-48 sm:w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-4 w-32 sm:w-44 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="h-9 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>

        {/* 3 Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3 animate-pulse"
            >
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-7 w-36 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
            </div>
          ))}
        </div>

        {/* Chart / Main Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4 animate-pulse">
            <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-60 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-lg" />
          </div>

          {/* Side Card Skeleton */}
          <div className="h-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4 animate-pulse">
            <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
