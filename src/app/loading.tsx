import React from 'react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050811] text-slate-200 font-sans">
      {/* Top Navigation Progress Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 z-50 animate-pulse" />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-2">
            <div className="h-8 w-48 sm:w-64 bg-[#0f172a] rounded-xl border border-slate-800/60 animate-shimmer" />
            <div className="h-4 w-32 sm:w-44 bg-[#0f172a] rounded-lg border border-slate-800/60 animate-shimmer" />
          </div>
          <div className="h-10 w-32 bg-[#0f172a] rounded-xl border border-slate-800/60 animate-shimmer" />
        </div>

        {/* 4 Summary Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-[#0f172a] border border-slate-800/80 rounded-2xl p-5 space-y-3 animate-shimmer"
            >
              <div className="h-4 w-24 bg-slate-800/60 rounded" />
              <div className="h-7 w-36 bg-slate-800/80 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Chart / Main Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 space-y-4 animate-shimmer">
            <div className="h-5 w-40 bg-slate-800/60 rounded" />
            <div className="h-60 w-full bg-slate-800/40 rounded-xl" />
          </div>

          {/* Side Card Skeleton */}
          <div className="h-80 bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 space-y-4 animate-shimmer">
            <div className="h-5 w-32 bg-slate-800/60 rounded" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-full bg-slate-800/40 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 w-full bg-[#0f172a] border border-slate-800/60 rounded-2xl animate-shimmer"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
