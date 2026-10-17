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
    return <Building2 className="w-5 h-5 text-zinc-900 dark:text-zinc-100 stroke-[2.5]" />
  }
  if (lower.includes('digital') || lower.includes('e-wallet') || lower.includes('gopay') || lower.includes('ovo')) {
    return <Smartphone className="w-5 h-5 text-zinc-900 dark:text-zinc-100 stroke-[2.5]" />
  }
  if (lower.includes('investasi') || lower.includes('reksa') || lower.includes('saham')) {
    return <TrendingUp className="w-5 h-5 text-zinc-900 dark:text-zinc-100 stroke-[2.5]" />
  }
  if (lower.includes('fisik') || lower.includes('tunai') || lower.includes('cash')) {
    return <Banknote className="w-5 h-5 text-zinc-900 dark:text-zinc-100 stroke-[2.5]" />
  }
  if (lower.includes('kredit')) {
    return <CreditCard className="w-5 h-5 text-zinc-900 dark:text-zinc-100 stroke-[2.5]" />
  }
  return <Wallet className="w-5 h-5 text-zinc-900 dark:text-zinc-100 stroke-[2.5]" />
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
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-fade-in-up">
        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-center justify-between border-2 border-[#121212] shadow-brutal transition-all animate-slide-down ${
              feedback.type === 'success'
                ? 'bg-[#00FF66] text-[#121212]'
                : 'bg-rose-100 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 stroke-[2.5]" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 stroke-[2.5]" />
              )}
              <p className="text-xs sm:text-sm font-display font-bold">{feedback.message}</p>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 rounded-lg hover:bg-black/10 transition cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#121212] dark:border-zinc-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
              Manajemen Dompet & Rekening
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">
              Atur seluruh rekening bank, e-wallet, dan pos tabungan Anda beserta saldo awal dan mutasinya.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-1.5 bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] font-display font-extrabold border-2 border-[#121212] shadow-brutal btn-brutal py-2.5 px-4 rounded-xl transition cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Dompet Baru</span>
          </button>
        </div>

        {/* Ringkasan Akumulasi Saldo Seluruh Dompet (4 KPI Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 shadow-brutal">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
              <span className="font-display font-bold uppercase tracking-wider text-[11px] text-zinc-600 dark:text-zinc-400">Total Saldo Terkini</span>
              <PiggyBank className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.5]" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-display tabular-nums text-zinc-950 dark:text-zinc-50 truncate">
              {formatRupiah(totalSaldoTerkini)}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Saldo awal + seluruh mutasi aktif
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 shadow-brutal">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
              <span className="font-display font-bold uppercase tracking-wider text-[11px] text-zinc-600 dark:text-zinc-400">Total Saldo Awal</span>
              <Wallet className="w-5 h-5 text-zinc-700 dark:text-zinc-300 stroke-[2.5]" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-display tabular-nums text-zinc-950 dark:text-zinc-50 truncate">
              {formatRupiah(totalSaldoAwal)}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Akumulasi modal pembukuan awal
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 shadow-brutal">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
              <span className="font-display font-bold uppercase tracking-wider text-[11px] text-emerald-700 dark:text-emerald-400">Total Pemasukan</span>
              <ArrowDownRight className="w-5 h-5 text-emerald-600 stroke-[3]" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-display tabular-nums text-emerald-600 dark:text-emerald-400 truncate">
              {formatRupiah(totalPemasukan)}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Total dana masuk ke seluruh dompet
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 shadow-brutal">
            <div className="flex items-center justify-between text-zinc-500 text-xs mb-2">
              <span className="font-display font-bold uppercase tracking-wider text-[11px] text-rose-700 dark:text-rose-400">Total Pengeluaran</span>
              <ArrowUpRight className="w-5 h-5 text-rose-600 stroke-[3]" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-display tabular-nums text-[#FF4365] truncate">
              {formatRupiah(totalPengeluaran)}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
              Total dana keluar dari dompet
            </p>
          </div>
        </div>

        {/* Daftar Kartu Dompet */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold font-display text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <span>Daftar Dompet & Akun</span>
              <span className="text-[10px] font-black font-display bg-[#FFE600] text-[#121212] border border-[#121212] px-2 py-0.5 rounded-full shadow-2xs">
                {walletsWithBalance.length} Dompet
              </span>
            </h2>
          </div>

          {walletsWithBalance.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-10 text-center space-y-4 shadow-brutal">
              <div className="w-14 h-14 rounded-2xl bg-[#FFE600] border-2 border-[#121212] text-[#121212] flex items-center justify-center mx-auto shadow-brutal-sm">
                <Wallet className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black font-display text-zinc-950 dark:text-zinc-50">Belum Ada Dompet Tercatat</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto font-medium">
                  Tambahkan dompet pertama Anda seperti BCA, Mandiri, GoPay, atau Tunai untuk mulai mengelola saldo secara rapi.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 bg-[#FFE600] text-[#121212] font-display font-extrabold border-2 border-[#121212] shadow-brutal btn-brutal py-2 px-4 rounded-xl transition text-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Dompet Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {walletsWithBalance.map((wallet) => (
                <div
                  key={wallet.id}
                  className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-5 transition flex flex-col justify-between group shadow-brutal hover:translate-x-0.5"
                >
                  <div>
                    {/* Header Card: Icon, Tipe, & Menu Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#FFE600] border-2 border-[#121212] flex items-center justify-center shadow-brutal-sm flex-shrink-0">
                          {getWalletIcon(wallet.tipe)}
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold font-display text-zinc-950 dark:text-zinc-50 leading-tight">
                            {wallet.nama}
                          </h3>
                          <span className="inline-block text-[10px] font-display font-bold text-[#121212] bg-[#00F0FF] border border-[#121212] px-2 py-0.2 rounded-full mt-1">
                            {wallet.tipe}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (Edit & Delete) */}
                      <div className="flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenEditModal(wallet)}
                          title="Edit Dompet"
                          className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 shadow-brutal-sm btn-brutal transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => setDeletingWallet(wallet)}
                          title="Hapus Dompet"
                          className="p-1.5 rounded-lg text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-2 border-[#121212] dark:border-rose-900 shadow-brutal-sm btn-brutal transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Saldo Terkini */}
                    <div className="space-y-0.5 mb-4">
                      <span className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-500">Saldo Terkini</span>
                      <p className="text-xl sm:text-2xl font-black font-display tabular-nums text-zinc-950 dark:text-zinc-50 tracking-tight">
                        {formatRupiah(wallet.saldo_terkini ?? wallet.saldo_awal)}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Saldo Awal & Mutasi */}
                  <div className="pt-3 border-t-2 border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-zinc-500 text-[11px]">
                      <span className="font-sans font-medium">Saldo Awal:</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-bold tabular-nums">{formatRupiah(wallet.saldo_awal)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] tabular-nums font-bold">
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <ArrowDownRight className="w-3 h-3 stroke-[3]" />
                        +{formatRupiah(wallet.total_masuk || 0)}
                      </span>
                      <span className="text-[#FF4365] flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3 stroke-[3]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl w-full max-w-md overflow-hidden shadow-brutal-xl text-zinc-900 dark:text-zinc-100">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-[#121212] flex items-center justify-center text-[#121212] shadow-brutal-sm">
                  <Wallet className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-base font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
                  {editingWallet ? 'Edit Dompet' : 'Tambah Dompet Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-950 dark:text-rose-200 text-xs font-bold font-display flex items-center gap-2 shadow-brutal-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nama Dompet */}
              <div className="space-y-1">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Nama Dompet / Rekening
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA Payroll, GoPay, Tunai Dompet"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-medium focus:outline-none shadow-brutal-sm transition"
                />
              </div>

              {/* Tipe Dompet */}
              <div className="space-y-1">
                <label className="text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Tipe Dompet
                </label>
                <select
                  value={formTipe}
                  onChange={(e) => setFormTipe(e.target.value)}
                  className="w-full bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 font-display font-bold shadow-brutal-sm transition cursor-pointer"
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
                <label className="text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Saldo Awal (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-display font-black">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="1"
                    placeholder="0"
                    value={formSaldoAwal}
                    onChange={(e) => setFormSaldoAwal(e.target.value)}
                    className="w-full bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-display font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none shadow-brutal-sm transition tabular-nums"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Saldo pembukuan awal sebelum ada catatan transaksi mutasi baru.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-display font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 bg-white dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 shadow-brutal-sm btn-brutal transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-display font-black bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] border-2 border-[#121212] shadow-brutal btn-brutal transition disabled:opacity-50 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-brutal-xl p-6 text-center space-y-4 text-zinc-900 dark:text-zinc-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-brutal-sm">
              <Trash2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-black font-display text-zinc-950 dark:text-zinc-50">Hapus Dompet Ini?</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                Apakah Anda yakin ingin menghapus dompet{' '}
                <strong className="text-zinc-950 dark:text-zinc-50 font-bold">&ldquo;{deletingWallet.nama}&rdquo;</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-3 border-t-2 border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setDeletingWallet(null)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-display font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border-2 border-[#121212] dark:border-zinc-700 shadow-brutal-sm btn-brutal transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-display font-black bg-[#FF4365] hover:bg-[#ff2b52] text-white border-2 border-[#121212] shadow-brutal btn-brutal transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
