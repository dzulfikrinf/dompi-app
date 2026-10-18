"use client"

import React, { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Search,
  Plus,
  ArrowLeft,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingDown,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
  TransactionInput,
} from "./actions"

export type Transaction = {
  id: number
  tanggal: string
  kategori: string
  nominal: number
  tipe: "Pengeluaran" | "Pemasukan"
  dompet?: string
  deskripsi: string
  user_id?: string
}

export type WalletItem = {
  id: number
  nama: string
  tipe: string
}

const CATEGORY_SUGGESTIONS = [
  "Makanan & Minuman",
  "Transportasi",
  "Belanja & Kebutuhan",
  "Tagihan & Langganan",
  "Kesehatan",
  "Hiburan",
  "Pendidikan",
  "Gaji",
  "Freelance",
  "Investasi",
  "Lain-lain",
]

export default function TransaksiClient({
  initialTransactions,
  wallets,
  userEmail,
}: {
  initialTransactions: Transaction[]
  wallets: WalletItem[]
  userEmail?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("")
  const [filterTipe, setFilterTipe] = useState<"SEMUA" | "Pemasukan" | "Pengeluaran">("SEMUA")
  const [filterKategori, setFilterKategori] = useState<string>("SEMUA")
  const [filterDompet, setFilterDompet] = useState<string>("SEMUA")
  const [filterStartDate, setFilterStartDate] = useState<string>("")
  const [filterEndDate, setFilterEndDate] = useState<string>("")

  // Modals & Active state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null)

  // Form input state
  const [formTipe, setFormTipe] = useState<"Pengeluaran" | "Pemasukan">("Pengeluaran")
  const [formTanggal, setFormTanggal] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [formKategori, setFormKategori] = useState<string>("Makanan & Minuman")
  const [formDompet, setFormDompet] = useState<string>(
    wallets.length > 0 ? wallets[0].nama : "Tunai"
  )
  const [formNominal, setFormNominal] = useState<string>("")
  const [formDeskripsi, setFormDeskripsi] = useState<string>("")

  // Form & action statuses
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Auto clear feedback after 4 seconds
  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message })
    setTimeout(() => {
      setFeedback(null)
    }, 4000)
  }

  // Categories list derived from predefined suggestions and active data
  const availableCategories = useMemo(() => {
    const set = new Set<string>(CATEGORY_SUGGESTIONS)
    transactions.forEach((t) => {
      if (t.kategori) set.add(t.kategori)
    })
    return Array.from(set)
  }, [transactions])

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchDeskripsi = t.deskripsi.toLowerCase().includes(q)
        const matchKategori = t.kategori.toLowerCase().includes(q)
        const matchDompet = (t.dompet || "").toLowerCase().includes(q)
        if (!matchDeskripsi && !matchKategori && !matchDompet) return false
      }

      // Tipe filter
      if (filterTipe !== "SEMUA" && t.tipe !== filterTipe) return false

      // Kategori filter
      if (filterKategori !== "SEMUA" && t.kategori !== filterKategori) return false

      // Dompet filter
      if (
        filterDompet !== "SEMUA" &&
        (t.dompet || "Tunai").toLowerCase() !== filterDompet.toLowerCase()
      )
        return false

      // Date range filter
      if (filterStartDate && t.tanggal < filterStartDate) return false
      if (filterEndDate && t.tanggal > filterEndDate) return false

      return true
    })
  }, [
    transactions,
    searchQuery,
    filterTipe,
    filterKategori,
    filterDompet,
    filterStartDate,
    filterEndDate,
  ])

  // Format IDR currency
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka)
  }

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingTransaction(null)
    setFormTipe("Pengeluaran")
    setFormTanggal(new Date().toISOString().split("T")[0])
    setFormKategori("Makanan & Minuman")
    setFormDompet(wallets.length > 0 ? wallets[0].nama : "Tunai")
    setFormNominal("")
    setFormDeskripsi("")
    setFormError(null)
    setIsFormModalOpen(true)
  }

  // Open modal if action=create query parameter exists
  useEffect(() => {
    if (searchParams && searchParams.get("action") === "create") {
      const timer = setTimeout(() => {
        setIsFormModalOpen(true)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFormModalOpen) setIsFormModalOpen(false)
        if (deletingTransaction) setDeletingTransaction(null)
      }
    }
    if (isFormModalOpen || deletingTransaction) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFormModalOpen, deletingTransaction])

  // Open modal for Edit
  const handleOpenEditModal = (t: Transaction) => {
    setEditingTransaction(t)
    setFormTipe(t.tipe)
    setFormTanggal(t.tanggal)
    setFormKategori(t.kategori)
    setFormDompet(t.dompet || "Tunai")
    setFormNominal(t.nominal.toString())
    setFormDeskripsi(t.deskripsi)
    setFormError(null)
    setIsFormModalOpen(true)
  }

  // Submit Handler (Create or Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const parsedNominal = Number(formNominal)
    if (!formNominal || isNaN(parsedNominal) || parsedNominal <= 0) {
      setFormError("Nominal harus berupa angka bulat positif lebih dari 0.")
      return
    }

    if (!formDeskripsi.trim()) {
      setFormError("Deskripsi transaksi wajib diisi.")
      return
    }

    const payload: TransactionInput = {
      tanggal: formTanggal,
      kategori: formKategori.trim(),
      nominal: Math.round(parsedNominal),
      tipe: formTipe,
      dompet: formDompet.trim(),
      deskripsi: formDeskripsi.trim(),
    }

    setIsSubmitting(true)

    if (editingTransaction) {
      // Update
      const res = await updateTransactionAction(editingTransaction.id, payload)
      setIsSubmitting(false)

      if (res.success && res.data) {
        const updated = res.data as Transaction
        setTransactions((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        )
        setIsFormModalOpen(false)
        showFeedback("success", "Transaksi berhasil diperbarui!")
        router.refresh()
      } else {
        setFormError(res.error || "Gagal memperbarui transaksi.")
      }
    } else {
      // Create
      const res = await createTransactionAction(payload)
      setIsSubmitting(false)

      if (res.success && res.data) {
        const created = res.data as Transaction
        setTransactions((prev) => [created, ...prev])
        setIsFormModalOpen(false)
        showFeedback("success", "Transaksi baru berhasil ditambahkan!")
        router.refresh()
      } else {
        setFormError(res.error || "Gagal menambahkan transaksi.")
      }
    }
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return

    setIsSubmitting(true)
    const res = await deleteTransactionAction(deletingTransaction.id)
    setIsSubmitting(false)

    if (res.success) {
      setTransactions((prev) => prev.filter((t) => t.id !== deletingTransaction.id))
      setDeletingTransaction(null)
      showFeedback("success", "Transaksi berhasil dihapus!")
      router.refresh()
    } else {
      showFeedback("error", res.error || "Gagal menghapus transaksi.")
      setDeletingTransaction(null)
    }
  }

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery("")
    setFilterTipe("SEMUA")
    setFilterKategori("SEMUA")
    setFilterDompet("SEMUA")
    setFilterStartDate("")
    setFilterEndDate("")
  }

  const hasActiveFilter =
    searchQuery !== "" ||
    filterTipe !== "SEMUA" ||
    filterKategori !== "SEMUA" ||
    filterDompet !== "SEMUA" ||
    filterStartDate !== "" ||
    filterEndDate !== ""

  // Totals for filtered list
  const totalFilteredPemasukan = filteredTransactions
    .filter((t) => t.tipe === "Pemasukan")
    .reduce((acc, curr) => acc + Number(curr.nominal), 0)

  const totalFilteredPengeluaran = filteredTransactions
    .filter((t) => t.tipe === "Pengeluaran")
    .reduce((acc, curr) => acc + Number(curr.nominal), 0)

  return (
    <div className="min-h-screen bg-[#FBF9F4] dark:bg-[#0F1011] text-[#121212] dark:text-[#FBF9F4] flex flex-col font-sans selection:bg-[#FFE600] selection:text-[#121212]">
      {/* Top Navbar */}
      <header className="h-16 sm:h-20 border-b-2 border-[#121212] dark:border-zinc-800 bg-[#FBF9F4]/90 dark:bg-[#0F1011]/90 backdrop-blur-md px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/beranda"
            className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-[#121212] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-brutal-sm btn-brutal transition flex-shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-[#FFE600] border-2 border-[#121212] items-center justify-center p-1.5 shadow-brutal-sm flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Logo Dompi"
                width={32}
                height={32}
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-black font-display tracking-tight leading-none text-zinc-950 dark:text-zinc-50 truncate">
                Riwayat Transaksi
              </h1>
              <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[200px] font-medium">
                {userEmail || "Masjul"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <ThemeToggle />
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center h-9 sm:h-10 px-2.5 sm:px-4 rounded-xl bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] font-display font-extrabold border-2 border-[#121212] shadow-brutal btn-brutal transition cursor-pointer text-xs sm:text-sm"
            title="Tambah Transaksi Baru"
            aria-label="Tambah Transaksi Baru"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline ml-1.5">Tambah Transaksi</span>
            <span className="sm:hidden ml-1">Tambah</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between border-2 border-[#121212] shadow-brutal transition-all animate-slide-down ${
              feedback.type === "success"
                ? "bg-[#00FF66] text-[#121212]"
                : "bg-rose-100 text-rose-950"
            }`}
          >
            <div className="flex items-center gap-3 text-xs sm:text-sm font-display font-bold">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 stroke-[2.5]" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 stroke-[2.5]" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 rounded-lg hover:bg-black/10 transition cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Toolbar: Search & Filter Controls */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-brutal">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Search Input */}
            <div className="md:col-span-5 flex items-center gap-2.5 bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#FFE600] shadow-brutal-sm transition">
              <Search className="w-4 h-4 text-zinc-500 flex-shrink-0 stroke-[2.5]" />
              <input
                type="text"
                placeholder="Cari deskripsi, kategori, atau dompet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs sm:text-sm w-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Filter Tipe */}
            <div className="md:col-span-3 flex bg-zinc-100 dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl p-1 shadow-brutal-sm">
              <button
                type="button"
                onClick={() => setFilterTipe("SEMUA")}
                className={`flex-1 py-1.5 text-xs font-display font-extrabold rounded-lg transition cursor-pointer ${
                  filterTipe === "SEMUA"
                    ? "bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterTipe("Pengeluaran")}
                className={`flex-1 py-1.5 text-xs font-display font-extrabold rounded-lg transition cursor-pointer ${
                  filterTipe === "Pengeluaran"
                    ? "bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                Keluar
              </button>
              <button
                type="button"
                onClick={() => setFilterTipe("Pemasukan")}
                className={`flex-1 py-1.5 text-xs font-display font-extrabold rounded-lg transition cursor-pointer ${
                  filterTipe === "Pemasukan"
                    ? "bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-2xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                Masuk
              </button>
            </div>

            {/* Filter Kategori */}
            <div className="md:col-span-2">
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="w-full bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-display font-bold shadow-brutal-sm"
              >
                <option value="SEMUA">Semua Kategori</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Dompet */}
            <div className="md:col-span-2">
              <select
                value={filterDompet}
                onChange={(e) => setFilterDompet(e.target.value)}
                className="w-full bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-display font-bold shadow-brutal-sm"
              >
                <option value="SEMUA">Semua Dompet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.nama}>
                    {w.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Date Filters & Summary Numbers */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-1 text-xs text-zinc-700 dark:text-zinc-300 shadow-brutal-sm font-medium">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-500 font-display font-bold">Dari:</span>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="bg-transparent text-zinc-900 dark:text-zinc-100 outline-none text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-1 text-xs text-zinc-700 dark:text-zinc-300 shadow-brutal-sm font-medium">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-500 font-display font-bold">Sampai:</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="bg-transparent text-zinc-900 dark:text-zinc-100 outline-none text-xs font-mono"
                />
              </div>

              {hasActiveFilter && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 text-xs font-display font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 px-3 py-1.5 rounded-xl border-2 border-[#121212] bg-white dark:bg-zinc-800 shadow-brutal-sm btn-brutal transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            {/* Quick summary numbers badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-display font-extrabold">
              <span className="px-2.5 py-1 rounded-lg bg-[#FFE600] text-[#121212] border border-[#121212] shadow-2xs">
                {filteredTransactions.length} Transaksi
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#00FF66]/30 text-emerald-950 dark:text-emerald-300 border border-[#121212] shadow-2xs font-mono">
                +{formatRupiah(totalFilteredPemasukan)}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#FFD1DC] text-[#FF4365] border border-[#121212] shadow-2xs font-mono">
                -{formatRupiah(totalFilteredPengeluaran)}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Table / List */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl overflow-hidden shadow-brutal">
          {filteredTransactions.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center px-4">
              <div className="w-14 h-14 bg-[#FFE600] border-2 border-[#121212] rounded-2xl flex items-center justify-center mx-auto mb-3 text-[#121212] shadow-brutal-sm">
                <Filter className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black font-display text-zinc-950 dark:text-zinc-50 mb-1">
                Tidak Ada Transaksi Ditemukan
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto mb-5 font-medium">
                {hasActiveFilter
                  ? "Coba sesuaikan kata kunci pencarian atau ubah filter untuk menemukan transaksi."
                  : "Belum ada transaksi yang tercatat di akun Anda. Mulai catat transaksi pertama sekarang."}
              </p>
              {hasActiveFilter ? (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-white dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs font-display font-bold shadow-brutal-sm btn-brutal transition cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              ) : (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-5 py-2.5 bg-[#FFE600] text-[#121212] border-2 border-[#121212] rounded-xl text-xs font-display font-extrabold shadow-brutal btn-brutal transition cursor-pointer"
                >
                  Tambah Transaksi Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y-2 divide-[#121212]/15 dark:divide-zinc-800">
              {filteredTransactions.map((trx) => (
                <div
                  key={trx.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FFE600]/10 transition group"
                >
                  {/* Left: Icon, Description, Category & Wallet badges */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-[#121212] shadow-brutal-sm ${
                        trx.tipe === "Pemasukan"
                          ? "bg-[#00FF66] text-[#121212]"
                          : "bg-[#FFD1DC] text-[#FF4365]"
                      }`}
                    >
                      {trx.tipe === "Pemasukan" ? (
                        <TrendingUp className="w-5 h-5 stroke-[3]" />
                      ) : (
                        <TrendingDown className="w-5 h-5 stroke-[3]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate">
                          {trx.deskripsi}
                        </p>
                        <span className="text-[10px] font-display font-bold bg-[#FFE600] text-[#121212] border border-[#121212] px-2 py-0.2 rounded-full">
                          {trx.dompet || "Tunai"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
                        <span className="font-mono">{trx.tanggal}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                          {trx.kategori}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Nominal & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-left sm:text-right">
                      <p
                        className={`text-sm sm:text-base font-black font-display tabular-nums ${
                          trx.tipe === "Pemasukan"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-[#FF4365]"
                        }`}
                      >
                        {trx.tipe === "Pemasukan" ? "+" : "-"}
                        {formatRupiah(Number(trx.nominal))}
                      </p>
                      <p className="text-[10px] font-display font-bold uppercase tracking-wider text-zinc-500">
                        {trx.tipe}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenEditModal(trx)}
                        title="Edit Transaksi"
                        className="p-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 bg-white dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 rounded-xl shadow-brutal-sm btn-brutal transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={() => setDeletingTransaction(trx)}
                        title="Hapus Transaksi"
                        className="p-2 text-rose-600 hover:text-rose-900 bg-rose-50 dark:bg-rose-950/60 border-2 border-[#121212] dark:border-rose-900 rounded-xl shadow-brutal-sm btn-brutal transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: Form Tambah / Edit */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-6 sm:p-7 shadow-brutal-xl relative text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between mb-5 border-b-2 border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base sm:text-lg font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi Baru"}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-200 p-1.5 rounded-xl border border-transparent hover:border-[#121212] transition cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-950 dark:text-rose-200 text-xs font-bold font-display flex items-center gap-2 shadow-brutal-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Tipe Transaksi */}
              <div>
                <label className="block text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Tipe Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border-2 border-[#121212] dark:border-zinc-700 shadow-brutal-sm">
                  <button
                    type="button"
                    onClick={() => setFormTipe("Pengeluaran")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-display font-black transition cursor-pointer ${
                      formTipe === "Pengeluaran"
                        ? "bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-2xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 stroke-[3]" />
                    <span>Pengeluaran</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTipe("Pemasukan")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-display font-black transition cursor-pointer ${
                      formTipe === "Pemasukan"
                        ? "bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-2xs"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 stroke-[3]" />
                    <span>Pemasukan</span>
                  </button>
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label
                  htmlFor="nominal"
                  className="block text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Nominal (Rp)
                </label>
                <div className="bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-[#FFE600] shadow-brutal-sm transition">
                  <input
                    id="nominal"
                    type="number"
                    required
                    min={1}
                    step={1}
                    placeholder="Contoh: 35000"
                    value={formNominal}
                    onChange={(e) => setFormNominal(e.target.value)}
                    className="bg-transparent border-none outline-none text-base font-display font-black tabular-nums text-zinc-950 dark:text-zinc-50 w-full placeholder-zinc-400"
                  />
                </div>
                {formNominal && Number(formNominal) > 0 && (
                  <p className="text-[11px] font-display font-bold text-zinc-600 dark:text-zinc-400 mt-1 tabular-nums">
                    {formatRupiah(Number(formNominal))}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label
                  htmlFor="deskripsi"
                  className="block text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Deskripsi
                </label>
                <input
                  id="deskripsi"
                  type="text"
                  required
                  placeholder="Contoh: Makan siang nasi padang"
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none font-medium shadow-brutal-sm transition"
                />
              </div>

              {/* Tanggal & Dompet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="tanggal"
                    className="block text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Tanggal
                  </label>
                  <input
                    id="tanggal"
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-mono font-bold shadow-brutal-sm transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dompet"
                    className="block text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Dompet / Rekening
                  </label>
                  <select
                    id="dompet"
                    value={formDompet}
                    onChange={(e) => setFormDompet(e.target.value)}
                    className="w-full bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-display font-bold shadow-brutal-sm transition"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.nama}>
                        {w.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label
                  htmlFor="kategori"
                  className="block text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1"
                >
                  Kategori
                </label>
                <select
                  id="kategori"
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-full bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none font-display font-bold shadow-brutal-sm transition"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t-2 border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-display font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 bg-white dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 shadow-brutal-sm btn-brutal transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] font-display font-black border-2 border-[#121212] shadow-brutal btn-brutal px-5 py-2.5 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>
                      {editingTransaction ? "Simpan Perubahan" : "Simpan Transaksi"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus */}
      {deletingTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl p-6 shadow-brutal-xl relative text-zinc-900 dark:text-zinc-100">
            <h3 className="text-lg font-black font-display mb-1 text-zinc-950 dark:text-zinc-50">
              Hapus Transaksi?
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 font-medium">
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat
              dibatalkan.
            </p>

            <div className="bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 rounded-xl p-3.5 mb-4 text-xs space-y-1 shadow-brutal-sm font-mono">
              <p className="font-bold text-zinc-950 dark:text-zinc-50">{deletingTransaction.deskripsi}</p>
              <p className="text-zinc-500 text-[11px] font-sans">
                {deletingTransaction.tanggal} • {deletingTransaction.kategori} (
                {deletingTransaction.dompet || "Tunai"})
              </p>
              <p className="font-display font-black text-sm text-[#FF4365] pt-1">
                {deletingTransaction.tipe === "Pemasukan" ? "+" : "-"}
                {formatRupiah(Number(deletingTransaction.nominal))}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t-2 border-zinc-100 dark:border-zinc-800 pt-3">
              <button
                type="button"
                onClick={() => setDeletingTransaction(null)}
                className="px-4 py-2 rounded-xl text-xs font-display font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 shadow-brutal-sm btn-brutal transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 bg-[#FF4365] hover:bg-[#ff2b52] text-white font-display font-black border-2 border-[#121212] shadow-brutal btn-brutal px-4 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Transaksi</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
