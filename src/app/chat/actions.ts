'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  undoDeleteTransaction,
  TransactionRecord,
} from '@/lib/services/transaction-service'
import {
  getWallets,
  createWallet,
  updateWallet,
  deleteWallet,
  calculateWalletBalances,
} from '@/lib/services/wallet-service'
import {
  processNaturalLanguageChat,
  GeminiResponse,
  GeminiContext,
} from '@/lib/gemini'

export type ChatActionResult = {
  success: boolean
  reply?: string
  error?: string
  geminiOutput?: GeminiResponse
  affectedTransaction?: TransactionRecord
}

export async function sendChatMessageAction(
  message: string
): Promise<ChatActionResult> {
  try {
    const trimmed = message?.trim()
    if (!trimmed) {
      return {
        success: false,
        error: 'Pesan tidak boleh kosong.',
      }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Sesi Anda telah kedaluwarsa. Silakan login kembali.',
      }
    }

    // 1. Ambil konteks transaksi aktif terbaru milik user
    const trxResult = await getTransactions({ limit: 15 })
    const activeTransactions = trxResult.success && trxResult.data ? trxResult.data : []

    // 2. Ambil transaksi terakhir yang dihapus (untuk konteks UNDO)
    const { data: latestDeleted } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // 3. Ambil daftar dompet detail milik user dan hitung saldonya
    const walletsResult = await getWallets()
    const rawWallets = walletsResult.success && walletsResult.data ? walletsResult.data : []
    const { walletsWithBalance, totalSaldoTerkini } = calculateWalletBalances(rawWallets, activeTransactions)
    const walletNames = rawWallets.map((w) => w.nama)

    // 4. Hitung ringkasan bulan ini milik user
    const now = new Date()
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const thisMonthTransactions = activeTransactions.filter((t) =>
      t.tanggal.startsWith(currentMonthPrefix)
    )
    const totalPengeluaran = thisMonthTransactions
      .filter((t) => t.tipe === 'Pengeluaran')
      .reduce((sum, t) => sum + Number(t.nominal), 0)
    const totalPemasukan = thisMonthTransactions
      .filter((t) => t.tipe === 'Pemasukan')
      .reduce((sum, t) => sum + Number(t.nominal), 0)

    const context: GeminiContext = {
      activeTransactions: activeTransactions.map((t) => ({
        id: t.id,
        tanggal: t.tanggal,
        kategori: t.kategori,
        nominal: t.nominal,
        tipe: t.tipe,
        dompet: t.dompet,
        deskripsi: t.deskripsi,
      })),
      latestDeletedTransaction: latestDeleted
        ? {
            id: latestDeleted.id,
            tanggal: latestDeleted.tanggal,
            kategori: latestDeleted.kategori,
            nominal: latestDeleted.nominal,
            tipe: latestDeleted.tipe,
            dompet: latestDeleted.dompet,
            deskripsi: latestDeleted.deskripsi,
            deleted_at: latestDeleted.deleted_at,
          }
        : null,
      wallets: walletNames,
      walletDetails: walletsWithBalance.map((w) => ({
        id: w.id,
        nama: w.nama,
        tipe: w.tipe,
        saldo_awal: w.saldo_awal,
        saldo_terkini: w.saldo_terkini,
      })),
      summary: {
        bulanIni: currentMonthPrefix,
        totalPengeluaran,
        totalPemasukan,
        jumlahTransaksi: thisMonthTransactions.length,
      },
    }

    // 5. Kirim ke Gemini untuk NLU
    const geminiRes = await processNaturalLanguageChat(trimmed, context)
    if (!geminiRes.success || !geminiRes.data) {
      return {
        success: false,
        error: geminiRes.error || 'Gagal memproses pesan dengan asisten.',
      }
    }

    const { action, transaction_id, data: trxData, reply, clarification_question } = geminiRes.data

    // 6. Eksekusi tindakan berdasarkan action terverifikasi
    switch (action) {
      case 'TAMBAH': {
        if (!trxData) {
          return {
            success: false,
            error: 'Data transaksi tidak lengkap dari asisten.',
          }
        }
        const createRes = await createTransaction(trxData)
        if (!createRes.success) {
          return {
            success: false,
            error: createRes.error || 'Gagal menyimpan transaksi ke database.',
          }
        }
        revalidatePath('/transaksi')
        revalidatePath('/')
        return {
          success: true,
          reply:
            reply ||
            `Sudah dicatat: ${createRes.data?.tipe} Rp${Number(createRes.data?.nominal).toLocaleString('id-ID')} untuk ${createRes.data?.deskripsi} dari ${createRes.data?.dompet}.`,
          geminiOutput: geminiRes.data,
          affectedTransaction: createRes.data,
        }
      }

      case 'UBAH': {
        if (!transaction_id || !trxData) {
          return {
            success: false,
            error: 'Target transaksi atau data perubahan tidak valid.',
          }
        }
        const updateRes = await updateTransaction(transaction_id, trxData)
        if (!updateRes.success) {
          return {
            success: false,
            error: updateRes.error || 'Gagal memperbarui transaksi.',
          }
        }
        revalidatePath('/transaksi')
        revalidatePath('/')
        return {
          success: true,
          reply:
            reply ||
            `Transaksi "${updateRes.data?.deskripsi}" berhasil diubah menjadi Rp${Number(updateRes.data?.nominal).toLocaleString('id-ID')}.`,
          geminiOutput: geminiRes.data,
          affectedTransaction: updateRes.data,
        }
      }

      case 'HAPUS': {
        if (!transaction_id) {
          return {
            success: false,
            error: 'Target transaksi yang ingin dihapus tidak ditemukan.',
          }
        }
        const deleteRes = await deleteTransaction(transaction_id)
        if (!deleteRes.success) {
          return {
            success: false,
            error: deleteRes.error || 'Gagal menghapus transaksi.',
          }
        }
        revalidatePath('/transaksi')
        revalidatePath('/')
        return {
          success: true,
          reply:
            reply ||
            `Transaksi ${deleteRes.data?.deskripsi || ''} Rp${Number(deleteRes.data?.nominal || 0).toLocaleString('id-ID')} sudah dihapus. Ketik 'batalkan penghapusan terakhir' jika ingin mengembalikannya.`,
          geminiOutput: geminiRes.data,
          affectedTransaction: deleteRes.data,
        }
      }

      case 'UNDO': {
        const undoRes = await undoDeleteTransaction(transaction_id || undefined)
        if (!undoRes.success) {
          return {
            success: false,
            error: undoRes.error || 'Tidak ada riwayat transaksi yang dapat dipulihkan.',
          }
        }
        revalidatePath('/transaksi')
        revalidatePath('/')
        return {
          success: true,
          reply:
            `Transaksi "${undoRes.data?.deskripsi}" sebesar Rp${Number(undoRes.data?.nominal).toLocaleString('id-ID')} berhasil dipulihkan.`,
          geminiOutput: geminiRes.data,
          affectedTransaction: undoRes.data,
        }
      }

      case 'TAMBAH_DOMPET': {
        const { data_dompet } = geminiRes.data
        if (!data_dompet || !data_dompet.nama) {
          return {
            success: false,
            error: 'Nama dompet harus disebutkan untuk membuat dompet baru.',
          }
        }
        const createRes = await createWallet({
          nama: data_dompet.nama,
          tipe: data_dompet.tipe || 'Rekening Bank',
          saldo_awal: data_dompet.saldo_awal ?? 0,
        })
        if (!createRes.success) {
          return {
            success: false,
            error: createRes.error || 'Gagal membuat dompet baru.',
          }
        }
        revalidatePath('/dompet')
        revalidatePath('/')
        revalidatePath('/transaksi')
        return {
          success: true,
          reply:
            reply ||
            `Dompet "${createRes.data?.nama}" (${createRes.data?.tipe}) berhasil dibuat dengan saldo awal Rp${Number(createRes.data?.saldo_awal || 0).toLocaleString('id-ID')}.`,
          geminiOutput: geminiRes.data,
        }
      }

      case 'UBAH_DOMPET': {
        const { wallet_id, data_dompet } = geminiRes.data
        if (!wallet_id || !data_dompet) {
          return {
            success: false,
            error: 'Target dompet atau data perubahan tidak jelas.',
          }
        }
        const updateRes = await updateWallet(wallet_id, data_dompet)
        if (!updateRes.success) {
          return {
            success: false,
            error: updateRes.error || 'Gagal mengubah dompet.',
          }
        }
        revalidatePath('/dompet')
        revalidatePath('/')
        revalidatePath('/transaksi')
        return {
          success: true,
          reply:
            reply ||
            `Dompet "${updateRes.data?.nama}" berhasil diperbarui! Saldo awal: Rp${Number(updateRes.data?.saldo_awal || 0).toLocaleString('id-ID')}.`,
          geminiOutput: geminiRes.data,
        }
      }

      case 'HAPUS_DOMPET': {
        const { wallet_id } = geminiRes.data
        if (!wallet_id) {
          return {
            success: false,
            error: 'Target dompet yang ingin dihapus tidak ditemukan.',
          }
        }
        const deleteRes = await deleteWallet(wallet_id)
        if (!deleteRes.success) {
          return {
            success: false,
            error: deleteRes.error || 'Gagal menghapus dompet.',
          }
        }
        revalidatePath('/dompet')
        revalidatePath('/')
        revalidatePath('/transaksi')
        return {
          success: true,
          reply: reply || `Dompet "${deleteRes.data?.nama}" berhasil dihapus.`,
          geminiOutput: geminiRes.data,
        }
      }

      case 'LIHAT_DOMPET': {
        let customReply = reply
        if (walletsWithBalance.length === 0) {
          customReply = 'Anda belum memiliki dompet yang tercatat.'
        } else {
          const list = walletsWithBalance
            .map(
              (w) =>
                `• ${w.nama} (${w.tipe}): Saldo Terkini Rp${Number(w.saldo_terkini ?? w.saldo_awal).toLocaleString('id-ID')} (Awal: Rp${Number(w.saldo_awal).toLocaleString('id-ID')})`
            )
            .join('\n')
          customReply = `Berikut daftar dompet & rekening Anda:\n\n${list}\n\nTotal Seluruh Saldo: Rp${Number(totalSaldoTerkini).toLocaleString('id-ID')}`
        }
        return {
          success: true,
          reply: customReply,
          geminiOutput: geminiRes.data,
        }
      }

      case 'RINGKASAN':
      case 'NGOBROL': {
        return {
          success: true,
          reply,
          geminiOutput: geminiRes.data,
        }
      }

      case 'KLARIFIKASI': {
        return {
          success: true,
          reply: clarification_question || reply,
          geminiOutput: geminiRes.data,
        }
      }

      default:
        return {
          success: false,
          error: 'Tindakan tidak dikenali.',
        }
    }
  } catch (err) {
    console.error('Unexpected error in sendChatMessageAction:', err)
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memproses chat.',
    }
  }
}
