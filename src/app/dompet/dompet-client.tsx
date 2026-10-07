'use client'

import React, { useState, useMemo } from 'react'
import AppLayout from '@/components/layout/app-layout'
import {
  Wallet,
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Smartphone,
  TrendingUp,
  Banknote,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
} from 'lucide-react'
import {
  WalletRecord,
  WALLET_TYPES,
  calculateWalletBalances,
} from '@/lib/types/wallet'
import {
  createWalletAction,
  updateWalletAction,
  deleteWalletAction,
} from './actions'

type TransactionMini = {
  tipe: 'Pengeluaran' | 'Pemasukan' | string
  dompet?: string
  nominal: number
  deleted_at?: string | null
}

type DompetClientProps = {
  initialWallets: WalletRecord[]
  transactions: TransactionMini[]
  userEmail?: string
}

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka)
}

function getWalletIcon(tipe: string) {
  const lower = tipe.toLowerCase()
  if (lower.includes('bank') || lower.includes('rekening')) {
    return <Building2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
  }
  if (lower.includes('digital') || lower.includes('e-wallet') || lower.includes('gopay') || lower.includes('ovo')) {
    return <Smartphone className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
  }
  if (lower.includes('investasi') || lower.includes('reksa') || lower.includes('saham')) {
    return <TrendingUp className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
  }
  if (lower.includes('fisik') || lower.includes('tunai') || lower.includes('cash')) {
    return <Banknote className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
  }
  if (lower.includes('kredit')) {
    return <CreditCard className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
  }
  return <Wallet className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
}

export default function DompetClient({
  initialWallets,
  transactions,
  userEmail,
}: DompetClientProps) {
  const [wallets, setWallets] = useState<WalletRecord[]>(initialWallets)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWallet, setEditingWallet] = useState<WalletRecord | null>(null)
  const [deletingWallet, setDeletingWallet] = useState<WalletRecord | null>(null)

  // Form State
  const [formNama, setFormNama] = useState('')
  const [formTipe, setFormTipe] = useState<string>(WALLET_TYPES[0])
  const [formSaldoAwal, setFormSaldoAwal] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Feedback Toast
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => {
      setFeedback(null)
    }, 4000)
  }

  // Hitung saldo awal dan saldo terkini setiap dompet
  const {
    walletsWithBalance,
    totalSaldoAwal,
    totalSaldoTerkini,
    totalPemasukan,
    totalPengeluaran,
  } = useMemo(() => {
    return calculateWalletBalances(wallets, transactions)
  }, [wallets, transactions])

  // Buka Modal Tambah
  const handleOpenCreateModal = () => {
    setEditingWallet(null)
    setFormNama('')
    setFormTipe(WALLET_TYPES[0])
    setFormSaldoAwal('0')
    setFormError(null)
    setIsModalOpen(true)
  }

  // Buka Modal Edit
  const handleOpenEditModal = (wallet: WalletRecord) => {
    setEditingWallet(wallet)
    setFormNama(wallet.nama)
    setFormTipe(wallet.tipe)
    setFormSaldoAwal(String(wallet.saldo_awal))
    setFormError(null)
    setIsModalOpen(true)
  }

  // Simpan Form (Create / Update)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const cleanNama = formNama.trim()
    if (!cleanNama) {
      setFormError('Nama dompet wajib diisi.')
      return
    }

    const cleanSaldo = Number(formSaldoAwal.replace(/[^0-9.-]+/g, ''))
    if (isNaN(cleanSaldo)) {
      setFormError('Saldo awal harus berupa angka valid.')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingWallet) {
        // Update
        const res = await updateWalletAction(editingWallet.id, {
          nama: cleanNama,
          tipe: formTipe,
          saldo_awal: cleanSaldo,
        })

        if (!res.success || !res.data) {
          setFormError(res.error || 'Gagal memperbarui dompet.')
          setIsSubmitting(false)
          return
        }

        const updated = res.data
        setWallets((prev) =>
          prev.map((w) => (w.id === updated.id ? updated : w))
        )
        showFeedback('success', `Dompet "${updated.nama}" berhasil diperbarui!`)
      } else {
        // Create
        const res = await createWalletAction({
          nama: cleanNama,
          tipe: formTipe,
          saldo_awal: cleanSaldo,
        })

        if (!res.success || !res.data) {
          setFormError(res.error || 'Gagal membuat dompet baru.')
          setIsSubmitting(false)
          return
        }

        const created = res.data
        setWallets((prev) => [...prev, created])
        showFeedback('success', `Dompet "${created.nama}" berhasil ditambahkan!`)
      }

      setIsModalOpen(false)
    } catch (err) {
      console.error(err)
      setFormError('Terjadi kesalahan jaringan saat menyimpan dompet.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Hapus Dompet
  const handleConfirmDelete = async () => {
    if (!deletingWallet) return

    setIsSubmitting(true)
    try {
      const res = await deleteWalletAction(deletingWallet.id)
      if (!res.success) {
        showFeedback('error', res.error || 'Gagal menghapus dompet.')
      } else {
        setWallets((prev) => prev.filter((w) => w.id !== deletingWallet.id))
        showFeedback('success', `Dompet "${deletingWallet.nama}" telah dihapus.`)
      }
    } catch (err) {
      console.error(err)
      showFeedback('error', 'Terjadi kesalahan sistem saat menghapus dompet.')
    } finally {
      setIsSubmitting(false)
      setDeletingWallet(null)
    }
  }

  return (
    <AppLayout currentPath="/dompet" userEmail={userEmail}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in-up">
        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between border shadow-lg transition-all animate-slide-down ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{feedback.message}</p>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Manajemen Dompet & Rekening
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Atur seluruh rekening bank, e-wallet, dan pos tabungan Anda beserta saldo awal dan mutasinya.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium py-2 px-3.5 rounded-lg transition active:scale-95 cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dompet Baru</span>
          </button>
        </div>

        {/* Ringkasan Akumulasi Saldo Seluruh Dompet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-1.5">
              <span>Total Saldo Terkini</span>
              <PiggyBank className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-lg sm:text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 truncate">
              {formatRupiah(totalSaldoTerkini)}
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Saldo awal + seluruh mutasi aktif
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-1.5">
              <span>Total Saldo Awal</span>
              <Wallet className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-lg sm:text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 truncate">
              {formatRupiah(totalSaldoAwal)}
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Akumulasi modal pembukuan awal
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-1.5">
              <span>Total Pemasukan Masuk</span>
              <ArrowDownRight className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-lg sm:text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 truncate">
              {formatRupiah(totalPemasukan)}
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Total dana masuk ke dompet
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-1.5">
              <span>Total Pengeluaran Keluar</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="text-lg sm:text-xl font-semibold tabular-nums text-zinc-500 dark:text-zinc-400 truncate">
              {formatRupiah(totalPengeluaran)}
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Total dana keluar dari dompet
            </p>
          </div>
        </div>

        {/* Daftar Kartu Dompet */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Daftar Dompet & Akun</span>
              <span className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded">
                {walletsWithBalance.length} Dompet
              </span>
            </h2>
          </div>

          {walletsWithBalance.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Belum Ada Dompet Tercatat</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                  Tambahkan dompet pertama Anda seperti BCA, Mandiri, GoPay, atau Tunai untuk mulai mengelola saldo secara rapi.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium py-1.5 px-3.5 rounded-lg transition text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Dompet Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {walletsWithBalance.map((wallet) => (
                <div
                  key={wallet.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 transition flex flex-col justify-between group shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  <div>
                    {/* Header Card: Icon, Tipe, & Menu Actions */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                          {getWalletIcon(wallet.tipe)}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                            {wallet.nama}
                          </h3>
                          <span className="inline-block text-[10px] font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.5 rounded mt-0.5">
                            {wallet.tipe}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (Edit & Delete) */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenEditModal(wallet)}
                          title="Edit Dompet"
                          className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingWallet(wallet)}
                          title="Hapus Dompet"
                          className="p-1 rounded-md text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Saldo Terkini */}
                    <div className="space-y-0.5 mb-3">
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Saldo Terkini</span>
                      <p className="text-lg font-semibold tabular-nums text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {formatRupiah(wallet.saldo_terkini ?? wallet.saldo_awal)}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Saldo Awal & Mutasi */}
                  <div className="pt-2.5 border-t border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-500 text-[11px]">
                      <span>Saldo Awal:</span>
                      <span className="text-zinc-800 dark:text-zinc-200 font-medium tabular-nums">{formatRupiah(wallet.saldo_awal)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] tabular-nums">
                      <span className="text-zinc-900 dark:text-zinc-100 flex items-center gap-0.5 font-medium">
                        <ArrowDownRight className="w-3 h-3 text-zinc-400" />
                        +{formatRupiah(wallet.total_masuk || 0)}
                      </span>
                      <span className="text-zinc-500 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                        -{formatRupiah(wallet.total_keluar || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          MODAL TAMBAH / EDIT DOMPET
          ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-xl text-zinc-900 dark:text-zinc-100">
            {/* Header Modal */}
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">
                  {editingWallet ? 'Edit Dompet' : 'Tambah Dompet Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-3.5">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nama Dompet */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Nama Dompet / Rekening
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA Payroll, GoPay, Tunai Dompet"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition"
                />
              </div>

              {/* Tipe Dompet */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Tipe Dompet
                </label>
                <select
                  value={formTipe}
                  onChange={(e) => setFormTipe(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition cursor-pointer"
                >
                  {WALLET_TYPES.map((tipe) => (
                    <option key={tipe} value={tipe} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                      {tipe}
                    </option>
                  ))}
                </select>
              </div>

              {/* Saldo Awal */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Saldo Awal (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-medium">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="1"
                    placeholder="0"
                    value={formSaldoAwal}
                    onChange={(e) => setFormSaldoAwal(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition tabular-nums"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Saldo pembukuan awal sebelum ada catatan transaksi mutasi baru.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingWallet ? 'Simpan Perubahan' : 'Buat Dompet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL KONFIRMASI HAPUS DOMPET
          ======================================================== */}
      {deletingWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-sm overflow-hidden shadow-xl p-5 text-center space-y-3.5 text-zinc-900 dark:text-zinc-100">
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Hapus Dompet Ini?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Apakah Anda yakin ingin menghapus dompet{' '}
                <strong className="text-zinc-900 dark:text-zinc-100 font-medium">"{deletingWallet.nama}"</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setDeletingWallet(null)}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus Dompet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
