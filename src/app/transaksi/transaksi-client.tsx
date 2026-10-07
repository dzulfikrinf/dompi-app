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
    <div className="min-h-screen bg-[#050811] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-800/80 bg-[#0a0f1c]/90 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition p-2 rounded-xl hover:bg-slate-800/60"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Logo Dompi"
                width={40}
                height={40}
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                Riwayat Transaksi
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">{userEmail || "Masjul"}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-2.5 px-4 rounded-xl transition shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Transaksi</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-10 space-y-6">
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
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 flex items-center gap-3 bg-[#0a0f1c] border border-slate-800 rounded-xl px-4 py-2.5 focus-within:border-cyan-500/50 transition">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Cari deskripsi, kategori, atau dompet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tipe */}
            <div className="md:col-span-3 flex bg-[#0a0f1c] border border-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setFilterTipe("SEMUA")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  filterTipe === "SEMUA"
                    ? "bg-[#1e293b] text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setFilterTipe("Pengeluaran")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  filterTipe === "Pengeluaran"
                    ? "bg-rose-500/20 text-rose-400 shadow-sm"
                    : "text-slate-400 hover:text-rose-400"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setFilterTipe("Pemasukan")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                  filterTipe === "Pemasukan"
                    ? "bg-emerald-500/20 text-emerald-400 shadow-sm"
                    : "text-slate-400 hover:text-emerald-400"
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
                className="w-full bg-[#0a0f1c] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
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
                className="w-full bg-[#0a0f1c] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50"
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
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#0a0f1c] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500">Dari:</span>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="bg-transparent text-white outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-2 bg-[#0a0f1c] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500">Sampai:</span>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="bg-transparent text-white outline-none text-xs"
                />
              </div>

              {hasActiveFilter && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800/50 transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            {/* Quick summary numbers */}
            <div className="flex items-center gap-4 text-xs">
              <span className="text-slate-400">
                Ditemukan:{" "}
                <span className="font-bold text-white">
                  {filteredTransactions.length}
                </span>{" "}
                transaksi
              </span>
              <span className="text-emerald-400">
                +{formatRupiah(totalFilteredPemasukan)}
              </span>
              <span className="text-rose-400">
                -{formatRupiah(totalFilteredPengeluaran)}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Table / List */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {filteredTransactions.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center px-4 animate-fade-in">
              <div className="w-16 h-16 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                <Filter className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Tidak ada transaksi ditemukan
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                {hasActiveFilter
                  ? "Coba sesuaikan kata kunci pencarian atau ubah filter untuk menemukan transaksi."
                  : "Belum ada transaksi yang tercatat di akun Anda. Mulai catat transaksi pertama sekarang."}
              </p>
              {hasActiveFilter ? (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-xs font-semibold transition"
                >
                  Reset Semua Filter
                </button>
              ) : (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 rounded-xl text-xs font-bold transition shadow-md"
                >
                  Tambah Transaksi Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {filteredTransactions.map((trx) => (
                <div
                  key={trx.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#0a0f1c]/80 transition-all duration-150 group"
                >
                  {/* Left: Icon, Description, Category & Wallet badges */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                        trx.tipe === "Pemasukan"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-slate-800/80 border-slate-700/60 text-slate-300"
                      }`}
                    >
                      {getIconForCategory(trx.kategori)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white truncate">
                          {trx.deskripsi}
                        </p>
                        <span className="text-[10px] font-semibold bg-[#0a0f1c] border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                          {trx.dompet || "Tunai"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{trx.tanggal}</span>
                        <span>•</span>
                        <span className="text-slate-400 font-medium">
                          {trx.kategori}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Nominal & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right">
                      <p
                        className={`text-base font-extrabold tracking-tight ${
                          trx.tipe === "Pemasukan"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {trx.tipe === "Pemasukan" ? "+" : "-"}
                        {formatRupiah(Number(trx.nominal))}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium capitalize">
                        {trx.tipe}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenEditModal(trx)}
                        title="Edit Transaksi"
                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingTransaction(trx)}
                        title="Hapus Transaksi"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#0a0f1c] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingTransaction ? "Edit Transaksi" : "Tambah Transaksi Baru"}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Tipe Transaksi */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Tipe Transaksi
                </label>
                <div className="grid grid-cols-2 gap-3 bg-[#0f172a] p-1.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setFormTipe("Pengeluaran")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      formTipe === "Pengeluaran"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>Pengeluaran</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTipe("Pemasukan")}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      formTipe === "Pemasukan"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Pemasukan</span>
                  </button>
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label
                  htmlFor="nominal"
                  className="block text-xs font-semibold text-slate-400 mb-1"
                >
                  Nominal (Rp)
                </label>
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 focus-within:border-cyan-500/50 transition">
                  <input
                    id="nominal"
                    type="number"
                    required
                    min={1}
                    step={1}
                    placeholder="Contoh: 35000"
                    value={formNominal}
                    onChange={(e) => setFormNominal(e.target.value)}
                    className="bg-transparent border-none outline-none text-base font-bold text-white w-full placeholder-slate-600"
                  />
                </div>
                {formNominal && Number(formNominal) > 0 && (
                  <p className="text-[11px] text-cyan-400 mt-1">
                    {formatRupiah(Number(formNominal))}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label
                  htmlFor="deskripsi"
                  className="block text-xs font-semibold text-slate-400 mb-1"
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
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/50 transition"
                />
              </div>

              {/* Tanggal & Dompet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="tanggal"
                    className="block text-xs font-semibold text-slate-400 mb-1"
                  >
                    Tanggal
                  </label>
                  <input
                    id="tanggal"
                    type="date"
                    required
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dompet"
                    className="block text-xs font-semibold text-slate-400 mb-1"
                  >
                    Dompet / Rekening
                  </label>
                  <select
                    id="dompet"
                    value={formDompet}
                    onChange={(e) => setFormDompet(e.target.value)}
                    className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 transition"
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
                  className="block text-xs font-semibold text-slate-400 mb-1"
                >
                  Kategori
                </label>
                <select
                  id="kategori"
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 transition"
                >
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer"
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0a0f1c] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-scale-in">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Hapus Transaksi?</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat
              dibatalkan.
            </p>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 mb-6 text-xs space-y-1.5">
              <p className="font-bold text-white">{deletingTransaction.deskripsi}</p>
              <p className="text-slate-400">
                {deletingTransaction.tanggal} • {deletingTransaction.kategori} (
                {deletingTransaction.dompet || "Tunai"})
              </p>
              <p
                className={`font-extrabold ${
                  deletingTransaction.tipe === "Pemasukan"
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {deletingTransaction.tipe === "Pemasukan" ? "+" : "-"}
                {formatRupiah(Number(deletingTransaction.nominal))}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingTransaction(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-[0_0_15px_rgba(244,63,94,0.3)] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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
