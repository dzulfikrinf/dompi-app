"use client";

import React, { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer 
} from "recharts";
import { useTheme } from "next-themes";
import { 
  Search, Calendar, Bell, Home, List, PieChart as PieChartIcon, 
  Wallet, Target, BarChart2, CheckSquare, MessageSquare, Settings, 
  Plus, CheckCircle2, TrendingDown, TrendingUp, Coffee, Briefcase, 
  ShoppingBag, Droplet, Play, ChevronDown, Send
} from "lucide-react";

type Transaction = {
  id: number;
  tanggal: string;
  kategori: string;
  nominal: number;
  tipe: "Pengeluaran" | "Pemasukan";
  deskripsi: string;
};

type Wallet = {
  id: number;
  nama: string;
  tipe: string;
  saldo_awal: number;
};

export default function DashboardUI({ data, budget, wallets }: { data: Transaction[], budget: number, wallets: Wallet[] }) {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme("dark");
  }, [setTheme]);

  const totalPemasukan = data.filter((t) => t.tipe === "Pemasukan").reduce((acc, curr) => acc + Number(curr.nominal), 0);
  const totalPengeluaran = data.filter((t) => t.tipe === "Pengeluaran").reduce((acc, curr) => acc + Number(curr.nominal), 0);
  const totalSaldoAwal = wallets.reduce((acc, curr) => acc + Number(curr.saldo_awal), 0);
  const saldo = totalSaldoAwal + totalPemasukan - totalPengeluaran;
  
  const budgetBulanan = budget;
  const sisaAnggaran = budgetBulanan - totalPengeluaran;
  const persentaseAnggaran = Math.min(Math.round((totalPengeluaran / budgetBulanan) * 100), 100);

  const groupedByDate = data.reduce((acc, curr) => {
    const date = curr.tanggal;
    if (!acc[date]) acc[date] = { name: date.split("-").slice(1).reverse().join(" Feb"), income: 0, expense: 0, rawDate: date };
    if (curr.tipe === "Pemasukan") acc[date].income += Number(curr.nominal);
    if (curr.tipe === "Pengeluaran") acc[date].expense += Number(curr.nominal);
    return acc;
  }, {} as Record<string, any>);
  
  const lineChartData = Object.values(groupedByDate).sort((a: any, b: any) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

  const expenseByCategory = data
    .filter((t) => t.tipe === "Pengeluaran")
    .reduce((acc, curr) => {
      acc[curr.kategori] = (acc[curr.kategori] || 0) + Number(curr.nominal);
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.keys(expenseByCategory).map((key) => ({
    name: key,
    value: expenseByCategory[key],
  })).sort((a, b) => b.value - a.value);

  const COLORS = ["bg-cyan-400", "bg-purple-500", "bg-yellow-400", "bg-emerald-500", "bg-rose-400", "bg-blue-400"];

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
    if (k.includes("makan") || k.includes("kopi")) return <Coffee className="w-5 h-5" />;
    if (k.includes("gaji") || k.includes("freelance")) return <Briefcase className="w-5 h-5" />;
    if (k.includes("belanja") || k.includes("supermarket") || k.includes("sayur")) return <ShoppingBag className="w-5 h-5" />;
    if (k.includes("bensin") || k.includes("transport")) return <Droplet className="w-5 h-5" />;
    if (k.includes("tagihan") || k.includes("langganan") || k.includes("listrik")) return <Play className="w-5 h-5" />;
    return <Wallet className="w-5 h-5" />;
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-[#050811] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-[280px] flex-shrink-0 bg-[#0a0f1c] border-r border-slate-800/60 flex-col justify-between hidden lg:flex">
        <div>
          <div className="h-20 flex items-center px-6 border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-xl font-bold text-black font-serif">
                d
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">dompi</h1>
                <span className="text-[10px] font-bold border border-cyan-500/50 bg-[#0a0f1c] text-cyan-400 px-2 py-0.5 rounded-full uppercase">Pro</span>
              </div>
            </div>
          </div>

          <div className="p-5">
            <button className="w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] mb-8">
              <Plus className="w-5 h-5" />
              <span>Catat Transaksi</span>
            </button>

            <nav className="space-y-1.5">
              <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#111c3a] text-cyan-400 rounded-xl font-medium">
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

        <div className="p-5">
          <div className="bg-[#0f172a] rounded-2xl p-4 flex items-center gap-3 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold border-2 border-[#0a0f1c]">
              M
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-white truncate">Masjul</p>
              <p className="text-xs text-slate-400">ID: 884-210</p>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] border border-[#0a0f1c]"></div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* TOP NAVIGATION BAR */}
        <header className="h-20 flex-shrink-0 border-b border-slate-800/60 flex items-center justify-between px-6 lg:px-10 bg-[#050811]/90 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-3 w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-full px-5 py-2.5 focus-within:border-cyan-500/50 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari transaksi, rekening, toko..." 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate-500"
            />
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-medium hover:text-white transition">
              <Calendar className="w-4 h-4 text-slate-400" />
              Februari 2025
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-slate-300">Tersinkronisasi</span>
            </div>
            <button className="relative hover:text-white transition">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE MAIN */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          
          {/* TOP SECTION: GREETING & ASSISTANT */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <p className="text-[11px] font-bold text-slate-500 tracking-widest mb-3 uppercase">
                Selasa, 18 Februari 2025 • <span className="text-cyan-400">Bulan Berjalan: Hari ke-18</span>
              </p>
              <h2 className="text-4xl font-extrabold text-white mb-3">Halo, Masjul</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                Arus kas bulanan stabil. Rasio tabungan Anda berada di 42%, melampaui batas aman harian Rp 145.000/hari.
              </p>
            </div>
            
            <div className="w-full lg:w-[340px] bg-[#0f172a] border border-slate-800 p-5 rounded-2xl flex gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-black/50 rotate-3">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white">Asisten Dompi</h4>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Optimal</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Pengeluaran baru 42% dari alokasi budget. Jajan kopi terkontrol rapi...</p>
              </div>
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
              <Wallet className="w-6 h-6 text-slate-500 mb-4" />
              <p className="text-slate-400 text-sm font-medium mb-1">Total Saldo Aktif</p>
              <p className="text-3xl font-bold text-white mb-2">{formatRupiah(saldo)}</p>
              <p className="text-xs text-slate-500"><span className="text-emerald-400 font-semibold">+12.4%</span> vs bulan lalu</p>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
              <TrendingDown className="w-6 h-6 text-emerald-500 mb-4" />
              <p className="text-slate-400 text-sm font-medium mb-1">Pemasukan Bulan Ini</p>
              <p className="text-3xl font-bold text-emerald-400 mb-2">{formatRupiah(totalPemasukan)}</p>
              <p className="text-xs text-slate-500"><span className="text-white font-semibold">3 Sumber</span> Gaji, Freelance...</p>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
              <TrendingUp className="w-6 h-6 text-rose-500 mb-4" />
              <p className="text-slate-400 text-sm font-medium mb-1">Pengeluaran Bulan Ini</p>
              <p className="text-3xl font-bold text-rose-400 mb-2">{formatRupiah(totalPengeluaran)}</p>
              <p className="text-xs text-slate-500"><span className="text-rose-400 font-semibold">-8.0%</span> {data.filter(t=>t.tipe==="Pengeluaran").length} transaksi</p>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>
              <PieChartIcon className="w-6 h-6 text-cyan-400 mb-4" />
              <p className="text-slate-400 text-sm font-medium mb-1">Sisa Kuota Anggaran</p>
              <p className="text-3xl font-bold text-white mb-3">{formatRupiah(sisaAnggaran)}</p>
              <div className="flex gap-1 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="bg-cyan-400 h-full" style={{ width: (100 - persentaseAnggaran) + "%" }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>Sisa {100 - persentaseAnggaran}%</span>
                <span>Total Rp 10.5M</span>
              </div>
            </div>
          </div>

          {/* MIDDLE CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Arus Kas Line Chart */}
            <div className="col-span-1 lg:col-span-8 bg-[#0f172a] border border-slate-800 rounded-3xl p-6 lg:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Arus Kas Bulanan</h3>
                  <p className="text-sm text-slate-400">Tren pemasukan dan pengeluaran per hari</p>
                </div>
                <div className="flex bg-[#1e293b] p-1 rounded-lg">
                  <button className="px-4 py-1.5 text-xs font-medium text-slate-400 rounded-md hover:text-white">7 Hari</button>
                  <button className="px-4 py-1.5 text-xs font-bold text-white bg-[#0f172a] rounded-md shadow-sm border border-slate-700/50">30 Hari</button>
                  <button className="px-4 py-1.5 text-xs font-medium text-slate-400 rounded-md hover:text-white">12 Bulan</button>
                </div>
              </div>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-sm text-slate-400">Pemasukan: <span className="font-bold text-white">{formatRupiah(totalPemasukan)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                  <span className="text-sm text-slate-400">Pengeluaran: <span className="font-bold text-white">{formatRupiah(totalPengeluaran)}</span></span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lineChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }} 
                      dy={10}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f1525', borderColor: '#ef4444', borderRadius: '8px', color: '#f8fafc', padding: '12px' }}
                      itemStyle={{ display: 'none' }}
                      labelStyle={{ display: 'none' }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const expense = payload.find(p => p.dataKey === 'expense');
                          return (
                            <div className="bg-[#0a0f1c] border border-rose-500/50 p-3 rounded-xl shadow-lg">
                              <p className="text-sm text-white font-medium">{label} • Pengeluaran: <span className="text-rose-400 font-bold">{formatRupiah(expense?.value as number)}</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Kategori Belanja Progress Bars */}
            <div className="col-span-1 lg:col-span-4 bg-[#0f172a] border border-slate-800 rounded-3xl p-6 lg:p-8 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Kategori Belanja</h3>
                  <p className="text-sm text-slate-400">Distribusi beban pengeluaran</p>
                </div>
                <span className="text-sm font-bold text-white">{formatRupiahSingkat(totalPengeluaran)}</span>
              </div>

              <div className="flex-1 flex flex-col gap-5">
                {categoryData.slice(0, 4).map((cat, idx) => {
                  const pct = Math.round((cat.value / totalPengeluaran) * 100);
                  const barColor = COLORS[idx % COLORS.length];
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white font-medium">{cat.name}</span>
                        <span className="text-slate-400 font-bold">{formatRupiah(cat.value)} <span className="text-slate-500 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className={barColor + " h-2 rounded-full"} style={{ width: pct + "%" }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-5 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">Anggaran terserap wajar</span>
                <a href="#" className="text-xs font-bold text-cyan-400 hover:text-cyan-300">Kelola Alokasi &rarr;</a>
              </div>
            </div>

          </div>

          {/* BOTTOM LISTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
            
            {/* Transaksi Terkini */}
            <div className="col-span-1 lg:col-span-8 bg-[#0f172a] border border-slate-800 rounded-3xl p-6 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Transaksi Terkini</h3>
                  <p className="text-sm text-slate-400">Aktivitas keuangan paling baru</p>
                </div>
                <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">Semua Riwayat &rarr;</a>
              </div>

              <div className="space-y-4">
                {data.length > 0 ? (
                  data.slice(0, 5).map((trx) => (
                    <div key={trx.id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-slate-800/40 transition group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#1e293b] flex items-center justify-center text-slate-300 shadow-sm border border-slate-700/50">
                          {getIconForCategory(trx.kategori)}
                        </div>
                        <div>
                          <p className="font-bold text-white mb-0.5">{trx.deskripsi}</p>
                          <p className="text-xs text-slate-400">{trx.tanggal} • {trx.tipe === "Pemasukan" ? "Pemasukan" : "Pengeluaran"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={trx.tipe === "Pemasukan" ? "font-bold text-base mb-0.5 text-emerald-400" : "font-bold text-base mb-0.5 text-rose-400"}>
                          {trx.tipe === "Pemasukan" ? "+" : "-"}{formatRupiah(trx.nominal)}
                        </p>
                        <p className="text-xs text-slate-500 font-medium bg-slate-800/50 inline-block px-2 py-0.5 rounded-md">{trx.kategori}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-6">Belum ada transaksi</p>
                )}
              </div>
            </div>

            {/* Dompet & Rekening + Promo */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
              
              {/* Dompet & Rekening */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">Dompet & Rekening</h3>
                    <p className="text-xs text-slate-400">4 akun aktif tersinkron</p>
                  </div>
                  <button className="text-slate-400 hover:text-white p-1"><Plus className="w-5 h-5" /></button>
                </div>
                <div className="space-y-5">
                  {wallets.slice(0, 4).map((wallet, idx) => {
                    const iconColors = [
                      "bg-blue-500/20 text-blue-400",
                      "bg-cyan-500/20 text-cyan-400",
                      "bg-purple-500/20 text-purple-400",
                      "bg-slate-700/50 text-slate-400"
                    ];
                    const Icons = [Wallet, Wallet, TrendingUp, Wallet];
                    const CurIcon = Icons[idx % Icons.length];
                    
                    // Kalkulasi saldo dinamis dari transaksi
                    // Pemasukan ke dompet ini
                    const inWallet = data.filter(t => t.tipe === "Pemasukan" && (t as any).dompet?.toLowerCase() === wallet.nama.toLowerCase()).reduce((a, b) => a + Number(b.nominal), 0);
                    // Pengeluaran dari dompet ini
                    const outWallet = data.filter(t => t.tipe === "Pengeluaran" && (t as any).dompet?.toLowerCase() === wallet.nama.toLowerCase()).reduce((a, b) => a + Number(b.nominal), 0);
                    const saldoTerakhir = wallet.saldo_awal + inWallet - outWallet;

                    return (
                      <div key={wallet.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-white mb-0.5">{wallet.nama}</p>
                          <p className="text-xs text-slate-500">{wallet.tipe}</p>
                        </div>
                        <p className="font-bold text-white">{formatRupiah(saldoTerakhir)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Promo WA/TG */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex-1">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <h4 className="font-bold text-white">Catat Otomatis via WA / TG</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">Aktif</span>
                </div>
                
                <div className="bg-[#050811] border border-slate-800 rounded-xl p-3 flex items-center justify-between mt-6 mb-4">
                  <p className="text-sm font-mono text-cyan-400">"Makan siang 35rb bca"</p>
                  <button className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 transition">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bot langsung membaca teks dan memperbarui catatan tanpa buka aplikasi.
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
      
      {/* Mobile FAB */}
      <button className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-cyan-400 hover:bg-cyan-300 rounded-full flex items-center justify-center text-slate-950 shadow-[0_4px_20px_rgba(34,211,238,0.4)] z-50 transition-colors">
        <Plus className="w-6 h-6" />
      </button>

    </div>
  );
}