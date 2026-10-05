"use client";

import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { useTheme } from "next-themes";
import { 
  Search, Calendar, RefreshCw, Bell, Home, List, PieChart as PieChartIcon, 
  Wallet, Target, BarChart2, CheckSquare, MessageSquare, Settings, 
  Plus, CheckCircle2, TrendingDown, TrendingUp, Coffee, Briefcase, 
  ShoppingBag, Droplet, Play, Smile, Filter, ChevronDown, Zap, ArrowDownUp
} from "lucide-react";

type Transaction = {
  id: number;
  tanggal: string;
  kategori: string;
  nominal: number;
  tipe: "Pengeluaran" | "Pemasukan";
  deskripsi: string;
};

export default function DashboardUI({ data }: { data: Transaction[] }) {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme("dark"); // Force dark mode as per design
  }, [setTheme]);

  // Data Calculations
  const totalPemasukan = data.filter((t) => t.tipe === "Pemasukan").reduce((acc, curr) => acc + Number(curr.nominal), 0);
  const totalPengeluaran = data.filter((t) => t.tipe === "Pengeluaran").reduce((acc, curr) => acc + Number(curr.nominal), 0);
  const saldo = totalPemasukan - totalPengeluaran;
  
  const budgetBulanan = 10500000;
  const sisaAnggaran = budgetBulanan - totalPengeluaran;
  const persentaseAnggaran = Math.min(Math.round((totalPengeluaran / budgetBulanan) * 100), 100);

  // Line Chart Data
  const groupedByDate = data.reduce((acc, curr) => {
    const date = curr.tanggal;
    if (!acc[date]) acc[date] = { name: date.split("-").slice(1).reverse().join("/"), income: 0, expense: 0, rawDate: date };
    if (curr.tipe === "Pemasukan") acc[date].income += Number(curr.nominal);
    if (curr.tipe === "Pengeluaran") acc[date].expense += Number(curr.nominal);
    return acc;
  }, {} as Record<string, any>);
  
  const lineChartData = Object.values(groupedByDate).sort((a: any, b: any) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

  // Pie Chart Data
  const expenseByCategory = data
    .filter((t) => t.tipe === "Pengeluaran")
    .reduce((acc, curr) => {
      acc[curr.kategori] = (acc[curr.kategori] || 0) + Number(curr.nominal);
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(expenseByCategory).map((key) => ({
    name: key,
    value: expenseByCategory[key],
  })).sort((a, b) => b.value - a.value);

  const COLORS = ["#0ea5e9", "#8b5cf6", "#eab308", "#10b981", "#f43f5e", "#64748b"];

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  };
  const formatRupiahSingkat = (angka: number) => {
    if (angka >= 1000000) return "Rp " + (angka / 1000000).toFixed(1) + "M";
    if (angka >= 1000) return "Rp " + (angka / 1000).toFixed(0) + "K";
    return "Rp " + angka;
  };

  const getIconForCategory = (kategori: string) => {
    const k = kategori.toLowerCase();
    if (k.includes("makan") || k.includes("kopi")) return <Coffee className="w-4 h-4" />;
    if (k.includes("gaji") || k.includes("freelance")) return <Briefcase className="w-4 h-4" />;
    if (k.includes("belanja") || k.includes("supermarket") || k.includes("sayur")) return <ShoppingBag className="w-4 h-4" />;
    if (k.includes("bensin") || k.includes("transport")) return <Droplet className="w-4 h-4" />;
    if (k.includes("tagihan") || k.includes("langganan") || k.includes("listrik")) return <Play className="w-4 h-4" />;
    return <Wallet className="w-4 h-4" />;
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#0a0f1c] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 flex-shrink-0 bg-[#0f1525] border-r border-slate-800 flex-col justify-between hidden md:flex">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
                👝
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white tracking-tight">Dompi</h1>
                  <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase">Pro</span>
                </div>
                <p className="text-xs text-slate-400">Catat Duit, Tanpa Drama</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 mb-6">
              <Plus className="w-5 h-5" />
              <span>Catat Transaksi</span>
            </button>

            <nav className="space-y-1.5">
              <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#172033] text-cyan-400 rounded-xl font-medium border border-cyan-500/20">
                <Home className="w-5 h-5" /> Beranda
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition">
                <List className="w-5 h-5" /> Transaksi
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition">
                <PieChartIcon className="w-5 h-5" /> Anggaran
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition">
                <Wallet className="w-5 h-5" /> Dompet
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition">
                <Target className="w-5 h-5" /> Target Tabungan
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition">
                <BarChart2 className="w-5 h-5" /> Laporan
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition">
                <CheckSquare className="w-5 h-5" /> Tagihan Rutin
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition">
                <MessageSquare className="w-5 h-5" /> Chat Dompi
              </a>
              <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl font-medium transition">
                <Settings className="w-5 h-5" /> Pengaturan
              </a>
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span className="text-xs font-medium text-slate-300">Bot Terhubung</span>
            </div>
            <span className="text-xs font-bold text-emerald-500">WA / TG</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold border-2 border-[#0f1525]">
              R
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Masjul / Rian</p>
              <p className="text-xs text-slate-400 truncate">rian.pratama@email.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER & RIGHT CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 2. TOP NAVIGATION BAR */}
        <header className="h-20 flex-shrink-0 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-[#0a0f1c]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3 w-full max-w-md bg-[#131b2f] border border-slate-700/50 rounded-full px-4 py-2.5 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari transaksi, kategori, atau toko..." 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate-500"
            />
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[#131b2f] border border-slate-700/50 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Februari 2025
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              <RefreshCw className="w-3.5 h-3.5" />
              Tersinkron
            </div>
            <button className="relative p-2 rounded-full hover:bg-slate-800 transition">
              <Bell className="w-5 h-5 text-slate-300" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0a0f1c]"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border-2 border-slate-700 cursor-pointer"></div>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto flex flex-col xl:flex-row">
          
          {/* 3. MAIN CENTER COLUMN */}
          <main className="flex-1 p-4 lg:p-8 space-y-8 min-w-0">
            
            {/* Greeting */}
            <div>
              <div className="flex gap-2 mb-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Selasa, 18 Feb 2025
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300 font-medium cursor-pointer hover:bg-slate-700/60">
                  Bulan Ini (Februari) <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-2">Halo, Masjul! Dompi siap catat hari ini ✨</h2>
              <p className="text-slate-400 text-sm lg:text-base">Keuangan bulan Februari terpantau rapi, seimbang, dan sepenuhnya terkendali.</p>
            </div>

            {/* Status Banner */}
            <div className="bg-gradient-to-r from-[#101d3b] to-[#0a1429] rounded-2xl p-5 border border-blue-900/40 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-0.5">Kondisi Finansial Prima</h3>
                  <p className="text-sm text-slate-400">Rasio tabungan 42% di atas rata-rata target.</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400 font-medium tracking-widest mb-1">BATAS AMAN HARIAN</p>
                <p className="text-2xl font-bold text-emerald-400">Rp 145.000 <span className="text-sm font-medium text-emerald-400/60">/ hr</span></p>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-400">Total Saldo Aktif</h4>
                </div>
                <p className="text-2xl font-bold text-white mt-1">{formatRupiah(saldo)}</p>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">~+12.4%</span>
                  <span className="text-xs text-slate-500">vs bulan lalu</span>
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-400">Pemasukan Bulan Ini</h4>
                </div>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{formatRupiah(totalPemasukan)}</p>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <span className="text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">3 Sumber</span>
                  <span className="text-xs text-slate-500 truncate">Gaji, Freelance...</span>
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all"></div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-400">Pengeluaran Bulan Ini</h4>
                </div>
                <p className="text-2xl font-bold text-rose-400 mt-1">{formatRupiah(totalPengeluaran)}</p>
                <div className="flex items-center gap-2 mt-auto pt-2">
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">~-8%</span>
                  <span className="text-xs text-slate-500">{data.filter(t=>t.tipe==="Pengeluaran").length} transaksi</span>
                </div>
              </div>

              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <PieChartIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-medium text-slate-400">Sisa Kuota Anggaran</h4>
                </div>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{formatRupiah(sisaAnggaran)}</p>
                <div className="mt-auto pt-2">
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1.5">
                    <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: persentaseAnggaran + "%" }}></div>
                  </div>
                  <p className="text-[10px] text-slate-500">Sisa {100 - persentaseAnggaran}% dari Total Rp 10.5M</p>
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Arus Kas Bulanan</h3>
                  <p className="text-sm text-slate-400">Perbandingan laju pemasukan dan pengeluaran harian</p>
                </div>
                <div className="flex bg-[#1a2333] rounded-lg p-1">
                  <button className="px-4 py-1.5 text-xs font-medium text-slate-400 rounded-md hover:text-white">7 Hari</button>
                  <button className="px-4 py-1.5 text-xs font-bold text-white bg-slate-700 shadow rounded-md">30 Hari</button>
                  <button className="px-4 py-1.5 text-xs font-medium text-slate-400 rounded-md hover:text-white">12 Bulan</button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-sm text-slate-300">Pemasukan: <span className="font-bold text-white">{formatRupiahSingkat(totalPemasukan)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                  <span className="text-sm text-slate-300">Pengeluaran: <span className="font-bold text-white">{formatRupiahSingkat(totalPengeluaran)}</span></span>
                </div>
                {totalPengeluaran > 0 && (
                  <div className="md:ml-auto flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs px-3 py-1 rounded-full">
                    <Zap className="w-3.5 h-3.5" /> Puncak pengeluaran tgl 10: Bayar Listrik & Kos
                  </div>
                )}
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lineChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(val) => (val / 1000) + "k"}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f1525', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                      itemStyle={{ fontWeight: 600 }}
                      formatter={(value: any) => formatRupiah(Number(value))}
                    />
                    <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Transaksi Terkini</h3>
                  <p className="text-sm text-slate-400">Aktivitas keuangan paling baru</p>
                </div>
                <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition flex items-center gap-1">
                  Lihat Semua &rarr;
                </a>
              </div>
              <div className="bg-[#111827] border border-slate-800 rounded-3xl p-2">
                {data.length > 0 ? (
                  data.slice(0,5).map((trx) => (
                    <div key={trx.id} className="flex justify-between items-center p-4 hover:bg-slate-800/50 rounded-2xl transition group cursor-pointer border-b border-slate-800/50 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className={trx.tipe === 'Pemasukan' ? "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner bg-slate-800 text-slate-300 border border-slate-700"}>
                          {getIconForCategory(trx.kategori)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 group-hover:text-white transition">{trx.deskripsi}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            <span className="font-medium">{trx.kategori}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span>{trx.tanggal}</span>
                          </div>
                        </div>
                      </div>
                      <div className={trx.tipe === "Pemasukan" ? "font-bold text-right text-emerald-400" : "font-bold text-right text-rose-400"}>
                        {trx.tipe === "Pemasukan" ? "+" : "-"}{formatRupiah(trx.nominal)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">Belum ada transaksi bulan ini.</div>
                )}
              </div>
            </div>

          </main>

          {/* 4. RIGHT COLUMN */}
          <aside className="w-full xl:w-[380px] flex-shrink-0 bg-[#0c1222] border-l border-slate-800 p-4 lg:p-8 space-y-8">
            
            {/* Mood Card */}
            <div className="bg-gradient-to-b from-[#162137] to-[#111827] border border-slate-700/50 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <div className="flex justify-between items-start mb-5 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-300">Mood Dompi: Senang & Santai 🤩</span>
                </div>
                <span className="text-[10px] font-bold text-blue-300 bg-blue-900/30 px-2 py-1 rounded-md border border-blue-800/50">{persentaseAnggaran}% Terpakai</span>
              </div>
              <div className="flex gap-4 relative z-10 mb-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-black/50 rotate-3">
                  👝
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  "Aman banget, Masjul! Pengeluaranmu baru {persentaseAnggaran}% dari total anggaran bulan ini. Jajan kopi masih santai, tapi tetap waspada pas promo tanggal kembar ya!"
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 relative z-10">
                <button className="py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]">Tenang 🌿</button>
                <button className="py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 text-xs font-medium rounded-lg transition">Puas ☕</button>
                <button className="py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 text-xs font-medium rounded-lg transition">Waspada 👀</button>
                <button className="py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-400 text-xs font-medium rounded-lg transition">Boros 🥵</button>
              </div>
            </div>

            {/* Category Distribution */}
            <div>
              <div className="flex justify-between items-end mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Distribusi Kategori</h3>
                  <p className="text-xs text-slate-400">Rincian belanja bulan ini</p>
                </div>
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
                  <Filter className="w-4 h-4 text-slate-300" />
                </button>
              </div>
              
              <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
                {pieData.length > 0 ? (
                  <>
                    <div className="relative h-48 w-full flex items-center justify-center mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={5}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => formatRupiah(Number(value))}
                            contentStyle={{ backgroundColor: '#0f1525', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                            itemStyle={{ fontWeight: 600 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-slate-400 tracking-widest mb-0.5">TOTAL KELUAR</span>
                        <span className="text-xl font-black text-white">{formatRupiahSingkat(totalPengeluaran)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {pieData.slice(0,4).map((entry, index) => {
                        const pct = Math.round((entry.value / totalPengeluaran) * 100);
                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS[index] + "20" }}>
                                {getIconForCategory(entry.name)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-200">{entry.name}</p>
                                <p className="text-xs text-slate-500 font-medium">{pct}% dari total</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-white">{formatRupiahSingkat(entry.value)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Belum ada pengeluaran</div>
                )}
              </div>
            </div>

            {/* Connected Wallets */}
            <div>
              <div className="flex justify-between items-end mb-5">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Dompet Terhubung</h3>
                  <p className="text-xs text-slate-400">4 akun aktif tersinkronisasi</p>
                </div>
                <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-cyan-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center"><Wallet className="w-4 h-4" /></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1"></div>
                  </div>
                  <p className="text-sm font-bold text-white mb-0.5">BCA Utama</p>
                  <p className="text-[10px] text-slate-400 mb-2">Rekening Payroll</p>
                  <p className="text-sm font-bold text-emerald-400">Rp 16.42M</p>
                </div>
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center"><Wallet className="w-4 h-4" /></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1"></div>
                  </div>
                  <p className="text-sm font-bold text-white mb-0.5">GoPay & OVO</p>
                  <p className="text-[10px] text-slate-400 mb-2">E-Wallet Jajan</p>
                  <p className="text-sm font-bold text-cyan-400">Rp 1.83M</p>
                </div>
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition cursor-pointer opacity-70">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-700/50 text-slate-400 flex items-center justify-center"><Wallet className="w-4 h-4" /></div>
                    <div className="w-2 h-2 rounded-full bg-slate-600 mt-1"></div>
                  </div>
                  <p className="text-sm font-bold text-white mb-0.5">Tunai Dompet</p>
                  <p className="text-[10px] text-slate-400 mb-2">Uang Fisik</p>
                  <p className="text-sm font-bold text-white">Rp 600K</p>
                </div>
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 hover:border-slate-600 transition cursor-pointer">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1"></div>
                  </div>
                  <p className="text-sm font-bold text-white mb-0.5">Bibit Reksadana</p>
                  <p className="text-[10px] text-slate-400 mb-2">Dana Darurat</p>
                  <p className="text-sm font-bold text-purple-400">Rp 6.00M</p>
                </div>
              </div>
            </div>

            {/* Promo Box */}
            <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/20 border border-cyan-800/50 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-white">Catat Kilat via Chat</h4>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 border border-emerald-500/50 rounded-full px-2 py-0.5">Online 24/7</span>
              </div>
              <p className="text-xs text-slate-300 mb-4 relative z-10">Malas buka app? Cukup ketik format santai lewat WA atau Telegram:</p>
              
              <div className="bg-[#0a0f1c]/80 border border-slate-700 rounded-xl p-3 mb-4 relative z-10 flex items-center justify-between">
                <p className="text-sm font-medium text-white">"Makan soto 25rb gopay"</p>
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-[#0a0f1c]" />
                </div>
              </div>
              
              <p className="text-[10px] text-slate-400 mb-4 relative z-10">Dompi langsung pilah kategori & saldo secara otomatis!</p>
              <button className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition relative z-10">
                Buka Chat Dompi
              </button>
            </div>

          </aside>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-cyan-500 rounded-full flex items-center justify-center text-slate-900 shadow-[0_4px_20px_rgba(6,182,212,0.5)] z-50">
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
}