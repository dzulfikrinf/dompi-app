'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Zap,
  ArrowRight,
  Check,
  Send,
  MessageSquare,
  Bot,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const FAQS = [
  {
    q: 'Apakah Dompi meminta username atau password m-Banking saya?',
    a: 'Sama sekali TIDAK. Dompi tidak pernah meminta password atau akses login bank apa pun. Anda hanya perlu mencatat secara santai lewat chat atau halaman aplikasi.',
  },
  {
    q: 'Bagaimana cara menghubungkan Dompi ke Telegram?',
    a: 'Sangat mudah! Setelah masuk ke akun Dompi, buka menu Pengaturan, klik "Hubungkan ke Telegram", lalu tekan tombol START di Telegram. Akun Anda langsung terhubung secara otomatis.',
  },
  {
    q: 'Apakah data keuangan saya aman dan terpisah dari pengguna lain?',
    a: 'Sangat aman. Setiap akun memiliki ruang data privat masing-masing yang terlindungi sistem keamanan berlapis. Tidak ada pengguna lain yang bisa melihat atau mengakses catatan keuangan Anda.',
  },
  {
    q: 'Bagaimana jika cara mengetik saya santai atau pakai singkatan sehari-hari?',
    a: 'Bisa banget! Dompi mengerti bahasa santai sehari-hari, singkatan angka (seperti 25rb, 50k, 1.5jt), nama dompet yang Anda sebut (Cash, BCA, GoPay), sampai keterangan waktu (kemarin, tadi sore, barusan).',
  },
]

export default function LandingPage({ userEmail }: { userEmail?: string } = {}) {
  const router = useRouter()
  const [testInput, setTestInput] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = testInput.trim() || 'Makan siang bakso 35rb Cash'
    router.push(`/chat?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] dark:bg-[#0F1011] text-[#121212] dark:text-[#FBF9F4] font-sans selection:bg-[#FFE600] selection:text-[#121212]">
      {/* 1. Header & Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FBF9F4]/90 dark:bg-[#0F1011]/90 backdrop-blur-md border-b-2 border-[#121212] dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#FFE600] border-2 border-[#121212] flex items-center justify-center p-1.5 shadow-brutal-sm">
              <Image
                src="/logo.png"
                alt="Logo Dompi"
                width={28}
                height={28}
                className="w-6 h-6 object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                Dompi.
              </span>
              <span className="hidden sm:inline-block text-[10px] font-display font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFE600] text-[#121212] border-2 border-[#121212]">
                ASISTEN KEUANGAN
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2">
            <a
              href="#fitur"
              className="px-3.5 py-1.5 rounded-full text-xs font-display font-bold text-zinc-800 dark:text-zinc-200 hover:bg-[#FFE600] hover:text-[#121212] border border-transparent hover:border-[#121212] transition"
            >
              Fitur Utama
            </a>
            <a
              href="#cara-kerja"
              className="px-3.5 py-1.5 rounded-full text-xs font-display font-bold text-zinc-800 dark:text-zinc-200 hover:bg-[#FFE600] hover:text-[#121212] border border-transparent hover:border-[#121212] transition"
            >
              Cara Kerja
            </a>
            <Link
              href="/panduan"
              className="px-3.5 py-1.5 rounded-full text-xs font-display font-bold text-zinc-800 dark:text-zinc-200 hover:bg-[#FFE600] hover:text-[#121212] border border-transparent hover:border-[#121212] transition"
            >
              Panduan Catat
            </Link>
            <a
              href="#faq"
              className="px-3.5 py-1.5 rounded-full text-xs font-display font-bold text-zinc-800 dark:text-zinc-200 hover:bg-[#FFE600] hover:text-[#121212] border border-transparent hover:border-[#121212] transition"
            >
              Tanya Jawab
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />
            {userEmail ? (
              <Link
                href="/beranda"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3 sm:h-10 sm:px-4 rounded-xl bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] font-display font-black text-xs sm:text-sm border-2 border-[#121212] shadow-brutal-sm sm:shadow-brutal btn-brutal transition cursor-pointer whitespace-nowrap"
              >
                <span>Buka Beranda</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-block px-3.5 py-2 text-xs font-display font-bold text-zinc-900 dark:text-zinc-100 hover:underline whitespace-nowrap"
                >
                  Masuk
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 sm:h-10 sm:px-4 rounded-xl bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] font-display font-bold text-xs sm:text-sm border-2 border-[#121212] shadow-brutal-sm sm:shadow-brutal btn-brutal transition cursor-pointer whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Mulai Sekarang</span>
                  <span className="sm:hidden">Masuk</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="space-y-20 sm:space-y-28 py-10 sm:py-16">
        {/* 2. Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE600] text-[#121212] border-2 border-[#121212] text-xs font-display font-extrabold shadow-brutal-sm">
                <Zap className="w-3.5 h-3.5 fill-[#121212]" />
                <span>CATAT UANG TANPA RIBET</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-[#121212] dark:text-zinc-50 leading-[1.08]">
                Catat Duit,{' '}
                <span className="inline-block bg-[#00F0FF] text-[#121212] px-2.5 py-0.5 border-2 border-[#121212] rounded-xl shadow-brutal-sm rotate-[-1deg]">
                  Tanpa Drama.
                </span>{' '}
                Kelola Dompet Jadi Lebih Santai.
              </h1>

              <p className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 max-w-xl font-medium leading-relaxed">
                Gak perlu lagi buka tabel rumit atau isi formulir panjang. Cukup ketik seperti nge-chat teman di Web atau Telegram, catatan pemasukan dan pengeluaranmu langsung tersimpan rapi seketika.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={userEmail ? '/beranda' : '/login'}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] font-display font-extrabold text-sm sm:text-base border-2 border-[#121212] shadow-brutal btn-brutal transition cursor-pointer"
                >
                  <span>{userEmail ? 'Buka Beranda' : 'Mulai Sekarang'}</span>
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-display font-bold text-sm sm:text-base border-2 border-[#121212] dark:border-zinc-700 shadow-brutal btn-brutal transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                  <span>Coba Obrolan Langsung</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 text-xs font-display font-bold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FF66]/30 text-emerald-950 dark:text-emerald-300 border border-[#121212] dark:border-emerald-700 shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Gampang Digunakan</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF]/30 text-cyan-950 dark:text-cyan-300 border border-[#121212] dark:border-cyan-700 shadow-2xs">
                  <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Bisa di Web & Telegram</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD1DC] text-rose-950 border border-[#121212] shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Data Privat & Aman</span>
                </span>
              </div>
            </div>

            {/* Right Column: Interactive Mockup Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl shadow-brutal-lg overflow-hidden">
                {/* Window Topbar */}
                <div className="h-10 px-4 bg-[#FBF9F4] dark:bg-zinc-950 border-b-2 border-[#121212] dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#FF4365] border border-[#121212]" />
                    <span className="w-3 h-3 rounded-full bg-[#FFE600] border border-[#121212]" />
                    <span className="w-3 h-3 rounded-full bg-[#00FF66] border border-[#121212]" />
                  </div>
                  <span className="text-[10px] font-display font-bold tracking-widest uppercase text-zinc-600 dark:text-zinc-400">
                    ● SIMULASI CHAT DOMPI
                  </span>
                </div>

                {/* Chat Simulation Area */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* User Bubble */}
                  <div className="flex justify-end">
                    <div className="bg-[#FFE600] border-2 border-[#121212] rounded-2xl rounded-tr-xs p-3.5 max-w-xs shadow-brutal-sm space-y-1">
                      <span className="text-[9px] font-display font-bold uppercase tracking-wider text-[#121212]/70 block">
                        KAMU (CONTOH VIA TELEGRAM)
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-[#121212] leading-snug">
                        Makan siang bakso 35rb Cash dan beli bensin 30rb Rekening
                      </p>
                      <span className="text-[9px] text-[#121212]/60 font-mono text-right block pt-0.5">
                        12:42 WIB
                      </span>
                    </div>
                  </div>

                  {/* Dompi Bot Bubble */}
                  <div className="flex justify-start">
                    <div className="bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl rounded-tl-xs p-3.5 max-w-sm shadow-brutal-sm space-y-2.5">
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-[#FFE600] border border-[#121212] flex items-center justify-center text-[10px] font-bold text-[#121212]">
                            <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                          <span className="text-[11px] font-display font-bold text-zinc-900 dark:text-zinc-100">
                            Dompi
                          </span>
                        </div>
                        <span className="text-[9px] font-display font-bold px-1.5 py-0.5 rounded bg-[#00FF66] text-[#121212] border border-[#121212]">
                          SUDAH TERCATAT
                        </span>
                      </div>

                      <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                        Siap! 2 pengeluaran ini sudah langsung tercatat rapi:
                      </p>

                      {/* Receipt items inside chat */}
                      <div className="space-y-1.5 font-mono text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl">
                        <div className="flex justify-between items-center text-[#FF4365] font-bold">
                          <span>1. Makan siang</span>
                          <span>- Rp 35.000 [Cash]</span>
                        </div>
                        <div className="flex justify-between items-center text-[#FF4365] font-bold">
                          <span>2. Bensin</span>
                          <span>- Rp 30.000 [Rekening]</span>
                        </div>
                      </div>

                      <div className="text-[10px] font-display font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Saldo di dompet Cash dan Rekening otomatis terpotong.</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Test Input Field */}
                  <div className="pt-2">
                    <form onSubmit={handleTestSubmit} className="space-y-2">
                      <label className="text-[10px] font-display font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 block">
                        COBA KETIK CATATANMU SENDIRI:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          placeholder="Beli kopi 20rb Cash..."
                          className="flex-1 bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FFE600] shadow-brutal-sm"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#FFE600] text-[#121212] font-display font-bold text-xs rounded-xl border-2 border-[#121212] shadow-brutal-sm btn-brutal transition cursor-pointer flex items-center gap-1"
                        >
                          <span>Kirim</span>
                          <Send className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Stats / Keunggulan Sederhana */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 shadow-brutal">
              <span className="text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00FF66] text-[#121212] border border-[#121212]">
                HITUNGAN AKURAT
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-zinc-950 dark:text-zinc-50 mt-3">
                100% Pas
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Semua uang masuk dan keluar langsung dihitung rapi tanpa ada yang terlewat.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 shadow-brutal">
              <span className="text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFE600] text-[#121212] border border-[#121212]">
                PRIVASI TERJAGA
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-zinc-950 dark:text-zinc-50 mt-3">
                Ruang Privat
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Hanya kamu yang bisa melihat dan mengelola catatan keuanganmu.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 shadow-brutal">
              <span className="text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00F0FF] text-[#121212] border border-[#121212]">
                RESPON CEPAT
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold font-display text-zinc-950 dark:text-zinc-50 mt-3">
                Hitungan Detik
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Kirim chat belanjaan, saldo di dompet langsung otomatis ter-update.
              </p>
            </div>
          </div>
        </section>

        {/* 4. 4-Card Feature Grid: "Kenapa Dompi Praktis" */}
        <section id="fitur" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-3">
            <span className="inline-block text-xs font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#00FF66] text-[#121212] border-2 border-[#121212] shadow-brutal-sm">
              FITUR UTAMA
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-zinc-950 dark:text-zinc-50">
              Kenapa Dompi Lebih Gampang Dipakai Sehari-hari?
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Dirancang praktis buat kamu yang sering jajan, ngopi, bayar QRIS, sampai bayar tagihan bulanan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-[#FFE600]/25 dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 shadow-brutal flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="space-y-3">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  01 • KETIK SANTAI
                </span>
                <h3 className="text-xl font-extrabold font-display text-zinc-950 dark:text-zinc-50">
                  Tinggal Ketik Saja
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  Catat pengeluaran secepat kirim chat. Gak perlu klik tombol atau dropdown berkali-kali cuma buat nyatet segelas es teh lima ribu.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#121212]/20 dark:border-zinc-800">
                <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-[#FFE600] text-[#121212] border border-[#121212]">
                  BISA CATAT BANYAK SEKALIGUS
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#00F0FF]/25 dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 shadow-brutal flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="space-y-3">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  02 • KONTROL KEUANGAN
                </span>
                <h3 className="text-xl font-extrabold font-display text-zinc-950 dark:text-zinc-50">
                  Tahu Pos Paling Boros
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  Dompi langsung kasih tahu pos pengeluaran mana yang paling banyak menyedot uangmu, supaya kamu tahu pos mana yang perlu mulai direm.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#121212]/20 dark:border-zinc-800">
                <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-[#00F0FF] text-[#121212] border border-[#121212]">
                  PANTAU POS BELANJA UTAMA
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 shadow-brutal flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="space-y-3">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  03 • SATU TEMPAT
                </span>
                <h3 className="text-xl font-extrabold font-display text-zinc-950 dark:text-zinc-50">
                  Semua Dompet & Tabungan
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  Pantau uang tunai (Cash), tabungan bank, sampai dompet digital (GoPay, OVO, ShopeePay) dalam satu layar yang gampang dipahami.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#121212]/20 dark:border-zinc-800">
                <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-zinc-200 text-[#121212] border border-[#121212]">
                  PINDAH SALDO & TARIK TUNAI
                </span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-[#FFD1DC]/40 dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 shadow-brutal flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div className="space-y-3">
                <span className="text-[10px] font-display font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">
                  04 • TAMPILAN JELAS
                </span>
                <h3 className="text-xl font-extrabold font-display text-zinc-950 dark:text-zinc-50">
                  Laporan Gampang Dibaca
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  Grafik dan ringkasan keuangan yang simpel dan jelas. Dalam sekejap kamu langsung tahu apakah bulan ini lagi hemat atau lagi banyak keluar.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-[#121212]/20 dark:border-zinc-800">
                <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-[#FF4365] text-white border border-[#121212]">
                  PANTAU ARUS KAS BULANAN
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Cara Kerja (3 Langkah Cepat) */}
        <section id="cara-kerja" className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="space-y-3 text-center max-w-2xl mx-auto">
            <span className="inline-block text-xs font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm">
              LANGKAH CEPAT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-zinc-950 dark:text-zinc-50">
              Mulai Pakai Dompi Dalam 60 Detik
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 shadow-brutal space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFE600] border-2 border-[#121212] text-[#121212] font-display font-black text-lg flex items-center justify-center shadow-brutal-sm">
                1
              </div>
              <h3 className="text-lg font-extrabold font-display text-zinc-950 dark:text-zinc-50">
                Daftar Akun Gratis
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Daftar pakai email dalam hitungan detik. Dompi langsung menyiapkan dompet awal: <strong>Cash</strong> dan <strong>Rekening</strong>.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 shadow-brutal space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#00F0FF] border-2 border-[#121212] text-[#121212] font-display font-black text-lg flex items-center justify-center shadow-brutal-sm">
                2
              </div>
              <h3 className="text-lg font-extrabold font-display text-zinc-950 dark:text-zinc-50">
                Sambungkan ke Telegram
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Buka menu Pengaturan, klik &ldquo;Hubungkan ke Telegram&rdquo; dan tekan tombol START di bot <strong>@dompi25_bot</strong>.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 shadow-brutal space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#00FF66] border-2 border-[#121212] text-[#121212] font-display font-black text-lg flex items-center justify-center shadow-brutal-sm">
                3
              </div>
              <h3 className="text-lg font-extrabold font-display text-zinc-950 dark:text-zinc-50">
                Mulai Catat Sambil Chat
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Tiap habis jajan, transfer uang, atau terima gaji, tinggal kirim pesan santai. Dompi urus pencatatannya sampai beres.
              </p>
            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-block text-xs font-display font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm">
              TANYA JAWAB
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-zinc-950 dark:text-zinc-50">
              Pertanyaan yang Sering Ditanyakan
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl shadow-brutal-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-display font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 stroke-[2.5] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* 7. Final CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-[#FFE600] border-2 border-[#121212] rounded-3xl p-8 sm:p-12 shadow-brutal-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <span className="inline-block text-xs font-display font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white text-[#121212] border-2 border-[#121212] shadow-brutal-sm">
                MULAI DALAM 60 DETIK
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-[#121212] leading-tight">
                Siap Kelola Uang dengan Lebih Tenang?
              </h2>
              <p className="text-xs sm:text-base text-[#121212]/90 font-medium">
                Atur keuangan harian dan bulanan tanpa ribet bikin rumus Excel atau kumpulin tumpukan nota belanja.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 w-full sm:w-auto flex-shrink-0">
              <Link
                href={userEmail ? '/beranda' : '/login'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#121212] text-white hover:bg-zinc-800 text-sm sm:text-base font-display font-extrabold shadow-brutal btn-brutal transition cursor-pointer"
              >
                <span>{userEmail ? 'Buka Beranda Sekarang →' : 'Mulai Pakai Dompi Sekarang →'}</span>
              </Link>
              <span className="text-[11px] font-display font-bold text-[#121212]/80">
                100% Gratis Digunakan • Aman & Privat
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="border-t-2 border-[#121212] dark:border-zinc-800 bg-white dark:bg-zinc-950 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-[#121212] flex items-center justify-center p-1 shadow-brutal-sm">
                <Image
                  src="/logo.png"
                  alt="Logo Dompi"
                  width={24}
                  height={24}
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="text-lg font-black font-display text-zinc-950 dark:text-zinc-50">
                Dompi.
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pencatat keuangan praktis dan santai untuk siapa saja di Indonesia.
            </p>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>© 2026 Dompi Indonesia. Dibuat dengan rapi untuk masyarakat Indonesia.</span>
            <span className="inline-flex items-center gap-1 font-display font-bold">
              <span>Made in Indonesia</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
