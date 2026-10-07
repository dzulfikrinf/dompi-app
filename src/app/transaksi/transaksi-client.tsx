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
  Wallet,
  Coffee,
  Briefcase,
  ShoppingBag,
  Droplet,
  Play,
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

  // Category Icon helper
  const getIconForCategory = (kategori: string) => {
    const k = kategori.toLowerCase()
    if (k.includes("makan") || k.includes("kopi") || k.includes("minum"))
      return <Coffee className="w-4 h-4" />
    if (k.includes("gaji") || k.includes("freelance") || k.includes("kerja"))
      return <Briefcase className="w-4 h-4" />
    if (
      k.includes("belanja") ||
      k.includes("supermarket") ||
      k.includes("pasar") ||
      k.includes("sayur")
    )
      return <ShoppingBag className="w-4 h-4" />
    if (k.includes("bensin") || k.includes("transport") || k.includes("ojek"))
      return <Droplet className="w-4 h-4" />
    if (k.includes("tagihan") || k.includes("langganan") || k.includes("listrik"))
      return <Play className="w-4 h-4" />
    return <Wallet className="w-4 h-4" />
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
    <div className="min-h-screen bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-zinc-900">
      {/* Top Navbar */}
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex-shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Logo Dompi"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold tracking-tight leading-none text-zinc-900 dark:text-zinc-100 truncate">
                Riwayat Transaksi
              </h1>
              <p className="hidden sm:block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[200px]">{userEmail || "Masjul"}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <ThemeToggle />
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium transition cursor-pointer text-xs"
            title="Tambah Transaksi Baru"
            aria-label="Tambah Transaksi Baru"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5">Tambah Transaksi</span>
            <span className="sm:hidden ml-1">Tambah</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between border shadow-lg transition-all animate-slide-down ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <div className="flex items-center gap-3 text-sm">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Toolbar: Search & Filter Controls */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition">
              <Search className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari deskripsi, kategori, atau dompet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs sm:text-sm w-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tipe */}
            <div className="md:col-span-3 flex bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setFilterTipe("SEMUA")}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                  filterTipe === "SEMUA"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterTipe("Pengeluaran")}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                  filterTipe === "Pengeluaran"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setFilterTipe("Pemasukan")}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition ${
                  filterTipe === "Pemasukan"
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                Pemasukan
              </button>
            </div>

            {/* Filter Kategori */}
            <div className="md:col-span-2">
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
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
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
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

          {/* Row 2: Date Filters & Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400">Dari:</span>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="bg-transparent text-zinc-900 dark:text-zinc-100 outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-300">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400">Sampai:</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="bg-transparent text-zinc-900 dark:text-zinc-100 outline-none text-xs"
                />
              </div>

              {hasActiveFilter && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            {/* Quick summary numbers */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-zinc-500">
                Ditemukan:{" "}
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {filteredTransactions.length}
                </span>{" "}
                transaksi
              </span>
              <span className="font-medium tabular-nums text-zinc-900 dark:text-zinc-100">
                +{formatRupiah(totalFilteredPemasukan)}
              </span>
              <span className="font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                -{formatRupiah(totalFilteredPengeluaran)}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Table / List */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          {filteredTransactions.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center px-4">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <Filter className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                Tidak ada transaksi ditemukan
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mb-5">
                {hasActiveFilter
                  ? "Coba sesuaikan kata kunci pencarian atau ubah filter untuk menemukan transaksi."
                  : "Belum ada transaksi yang tercatat di akun Anda. Mulai catat transaksi pertama sekarang."}
              </p>
              {hasActiveFilter ? (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              ) : (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-3.5 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Tambah Transaksi Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredTransactions.map((trx) => (
                <div
                  key={trx.id}
                  className="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-850/60 transition group"
                >
                  {/* Left: Icon, Description, Category & Wallet badges */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300">
                      {trx.tipe === "Pemasukan" ? (
                        <TrendingUp className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-zinc-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {trx.deskripsi}
                        </p>
                        <span className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
                          {trx.dompet || "Tunai"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500 text-[11px]">
                        <span>{trx.tanggal}</span>
                        <span>•</span>
                        <span>{trx.kategori}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Nominal & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-left sm:text-right">
                      <p className="text-sm sm:text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                        {trx.tipe === "Pemasukan" ? "+" : "-"}
                        {formatRupiah(Number(trx.nominal))}
                      </p>
                      <p className="text-[10px] text-zinc-400 capitalize">
                        {trx.tipe}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenEditModal(trx)}
                        title="Edit Transaksi"
                        className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingTransaction(trx)}
                        title="Hapus Transaksi"
                        className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xl relative text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold tracking-tight">
                {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi Baru"}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              {/* Tipe Transaksi */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Tipe Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setFormTipe("Pengeluaran")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                      formTipe === "Pengeluaran"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Pengeluaran</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTipe("Pemasukan")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                      formTipe === "Pemasukan"
                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Pemasukan</span>
                  </button>
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label
                  htmlFor="nominal"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1"
                >
                  Nominal (Rp)
                </label>
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition">
                  <input
                    id="nominal"
                    type="number"
                    required
                    min={1}
                    step={1}
                    placeholder="Contoh: 35000"
                    value={formNominal}
                    onChange={(e) => setFormNominal(e.target.value)}
                    className="bg-transparent border-none outline-none text-base font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 w-full placeholder-zinc-400"
                  />
                </div>
                {formNominal && Number(formNominal) > 0 && (
                  <p className="text-[11px] text-zinc-500 mt-1 tabular-nums">
                    {formatRupiah(Number(formNominal))}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label
                  htmlFor="deskripsi"
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1"
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
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition"
                />
              </div>

              {/* Tanggal & Dompet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="tanggal"
                    className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1"
                  >
                    Tanggal
                  </label>
                  <input
                    id="tanggal"
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dompet"
                    className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1"
                  >
                    Dompet / Rekening
                  </label>
                  <select
                    id="dompet"
                    value={formDompet}
                    onChange={(e) => setFormDompet(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition"
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
                  className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1"
                >
                  Kategori
                </label>
                <select
                  id="kategori"
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-900 font-medium px-4 py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-xl relative text-zinc-900 dark:text-zinc-100">
            <h3 className="text-base font-semibold mb-1">Hapus Transaksi?</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat
              dibatalkan.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 mb-4 text-xs space-y-1">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{deletingTransaction.deskripsi}</p>
              <p className="text-zinc-500 text-[11px]">
                {deletingTransaction.tanggal} • {deletingTransaction.kategori} (
                {deletingTransaction.dompet || "Tunai"})
              </p>
              <p className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 pt-1">
                {deletingTransaction.tipe === "Pemasukan" ? "+" : "-"}
                {formatRupiah(Number(deletingTransaction.nominal))}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
              <button
                type="button"
                onClick={() => setDeletingTransaction(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-900 font-medium px-3.5 py-1.5 rounded-lg text-xs transition cursor-pointer"
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
