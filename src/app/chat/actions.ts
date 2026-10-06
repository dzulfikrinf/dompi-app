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

    // 3. Ambil daftar dompet milik user
    const { data: walletsData } = await supabase
      .from('wallets')
      .select('nama')
      .eq('user_id', user.id)

    const walletNames = walletsData && walletsData.length > 0
      ? walletsData.map((w) => w.nama)
      : ['BCA', 'GoPay', 'Tunai', 'OVO']

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
