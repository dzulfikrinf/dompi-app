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
    return <Building2 className="w-5 h-5 text-cyan-400" />
  }
  if (lower.includes('digital') || lower.includes('e-wallet') || lower.includes('gopay') || lower.includes('ovo')) {
    return <Smartphone className="w-5 h-5 text-emerald-400" />
  }
  if (lower.includes('investasi') || lower.includes('reksa') || lower.includes('saham')) {
    return <TrendingUp className="w-5 h-5 text-purple-400" />
  }
  if (lower.includes('fisik') || lower.includes('tunai') || lower.includes('cash')) {
    return <Banknote className="w-5 h-5 text-amber-400" />
  }
  if (lower.includes('kredit')) {
    return <CreditCard className="w-5 h-5 text-rose-400" />
  }
  return <Wallet className="w-5 h-5 text-cyan-400" />
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Manajemen Dompet & Rekening
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Atur seluruh rekening bank, e-wallet, dan pos tabungan Anda beserta saldo awal dan mutasinya.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-3 px-5 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] active:scale-95 cursor-pointer text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Dompet Baru</span>
          </button>
        </div>

        {/* Ringkasan Akumulasi Saldo Seluruh Dompet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Saldo Terkini</span>
              <PiggyBank className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-cyan-400 truncate">
              {formatRupiah(totalSaldoTerkini)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Saldo awal + seluruh mutasi aktif
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Saldo Awal</span>
              <Wallet className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-white truncate">
              {formatRupiah(totalSaldoAwal)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Akumulasi modal pembukuan awal
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Pemasukan Masuk</span>
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 truncate">
              {formatRupiah(totalPemasukan)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Total dana masuk ke dompet
            </p>
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Pengeluaran Keluar</span>
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-rose-400 truncate">
              {formatRupiah(totalPengeluaran)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Total dana keluar dari dompet
            </p>
          </div>
        </div>

        {/* Daftar Kartu Dompet */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Daftar Dompet & Akun</span>
              <span className="text-xs font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                {walletsWithBalance.length} Dompet
              </span>
            </h2>
          </div>

          {walletsWithBalance.length === 0 ? (
            <div className="bg-[#0f172a] border border-slate-800 border-dashed rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Belum Ada Dompet Tercatat</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Tambahkan dompet pertama Anda seperti BCA, Mandiri, GoPay, atau Tunai untuk mulai mengelola saldo secara rapi.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold py-2.5 px-5 rounded-xl transition text-sm cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Dompet Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {walletsWithBalance.map((wallet) => (
                <div
                  key={wallet.id}
                  className="bg-[#0f172a] border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700/80 hover:-translate-y-1 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Card: Icon, Tipe, & Menu Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-105 transition-transform">
                          {getWalletIcon(wallet.tipe)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white leading-tight">
                            {wallet.nama}
                          </h3>
                          <span className="inline-block text-[10px] font-medium text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2 py-0.5 rounded-md mt-1">
                            {wallet.tipe}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons (Edit & Delete) */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenEditModal(wallet)}
                          title="Edit Dompet"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingWallet(wallet)}
                          title="Hapus Dompet"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Saldo Terkini */}
                    <div className="space-y-1 mb-4">
                      <span className="text-[11px] text-slate-400 font-medium">Saldo Terkini</span>
                      <p className="text-2xl font-extrabold text-cyan-400 tracking-tight">
                        {formatRupiah(wallet.saldo_terkini ?? wallet.saldo_awal)}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Saldo Awal & Mutasi */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Saldo Awal:</span>
                      <span className="text-white font-medium">{formatRupiah(wallet.saldo_awal)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3" />
                        +{formatRupiah(wallet.total_masuk || 0)}
                      </span>
                      <span className="text-rose-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            {/* Header Modal */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {editingWallet ? 'Edit Dompet' : 'Tambah Dompet Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Modal */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Nama Dompet */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Nama Dompet / Rekening
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA Payroll, GoPay, Tunai Dompet"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full bg-[#050811] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>

              {/* Tipe Dompet */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Tipe Dompet
                </label>
                <select
                  value={formTipe}
                  onChange={(e) => setFormTipe(e.target.value)}
                  className="w-full bg-[#050811] border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition cursor-pointer"
                >
                  {WALLET_TYPES.map((tipe) => (
                    <option key={tipe} value={tipe} className="bg-slate-900 text-white">
                      {tipe}
                    </option>
                  ))}
                </select>
              </div>

              {/* Saldo Awal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Saldo Awal (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">
                    Rp
                  </span>
                  <input
                    type="number"
                    step="1"
                    placeholder="0"
                    value={formSaldoAwal}
                    onChange={(e) => setFormSaldoAwal(e.target.value)}
                    className="w-full bg-[#050811] border border-slate-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Saldo pembukuan awal sebelum ada catatan transaksi mutasi baru.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Hapus Dompet Ini?</h3>
              <p className="text-xs text-slate-400">
                Apakah Anda yakin ingin menghapus dompet{' '}
                <strong className="text-white font-semibold">"{deletingWallet.nama}"</strong>?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingWallet(null)}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white transition shadow-[0_0_15px_rgba(244,63,94,0.3)] disabled:opacity-50 cursor-pointer"
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
