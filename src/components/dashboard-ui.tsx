"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { useTheme } from "next-themes";
import { Sun, Moon, Wallet, TrendingUp, TrendingDown, ArrowDownUp, Receipt, PieChart as PieChartIcon } from "lucide-react";

type Transaction = {
  id: number;
  tanggal: string;
  kategori: string;
  nominal: number;
  tipe: "Pengeluaran" | "Pemasukan";
  deskripsi: string;
};

export default function DashboardUI({ data }: { data: Transaction[] }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hitung ringkasan
  const totalPemasukan = data.filter((t) => t.tipe === "Pemasukan").reduce((acc, curr) => acc + Number(curr.nominal), 0);
  const totalPengeluaran = data.filter((t) => t.tipe === "Pengeluaran").reduce((acc, curr) => acc + Number(curr.nominal), 0);
  const saldo = totalPemasukan - totalPengeluaran;

  // Siapkan data untuk Donut Chart (hanya pengeluaran berdasarkan kategori)
  const expenseByCategory = data
    .filter((t) => t.tipe === "Pengeluaran")
    .reduce((acc, curr) => {
      acc[curr.kategori] = (acc[curr.kategori] || 0) + Number(curr.nominal);
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.keys(expenseByCategory).map((key) => ({
    name: key,
    value: expenseByCategory[key],
  })).sort((a, b) => b.value - a.value);

  const COLORS = ["#f43f5e", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#64748b"];

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  if (!mounted) return null; // Mencegah hydration mismatch untuk Next-Themes

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold tracking-tight">Dompet Masjul</h1>
        </div>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          aria-label="Toggle Dark Mode"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Wallet className="w-4 h-4" />
            <h2 className="text-sm font-medium uppercase tracking-wider">Total Saldo</h2>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{formatRupiah(saldo)}</p>
        </div>

        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <h2 className="text-sm font-medium uppercase tracking-wider">Pemasukan</h2>
          </div>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{formatRupiah(totalPemasukan)}</p>
        </div>

        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <TrendingDown className="w-4 h-4" />
            <h2 className="text-sm font-medium uppercase tracking-wider">Pengeluaran</h2>
          </div>
          <p className="text-3xl font-bold text-rose-700 dark:text-rose-300">{formatRupiah(totalPengeluaran)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Section */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-slate-400" />
            Porsi Pengeluaran
          </h3>
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 dark:text-slate-500">
              Belum ada data pengeluaran
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-400" />
            Riwayat Transaksi
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[300px]">
            {data.length > 0 ? (
              data.map((trx) => (
                <div key={trx.id} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <div className="flex items-center gap-3">
                    <div className={\`p-2 rounded-full \${trx.tipe === "Pemasukan" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"}\`}>
                      <ArrowDownUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{trx.deskripsi}</p>
                      <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{formatDate(trx.tanggal)}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">{trx.kategori}</span>
                      </div>
                    </div>
                  </div>
                  <div className={\`font-semibold \${trx.tipe === "Pemasukan" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}\`}>
                    {trx.tipe === "Pemasukan" ? "+" : "-"}{formatRupiah(trx.nominal)}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                Belum ada transaksi
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}