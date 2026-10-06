import { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'

export type TransactionRecord = {
  id: number
  created_at?: string
  tanggal: string
  kategori: string
  nominal: number
  tipe: 'Pengeluaran' | 'Pemasukan'
  dompet: string
  deskripsi: string
  user_id: string
  deleted_at?: string | null
}

export type TransactionInput = {
  tanggal: string
  kategori: string
  nominal: number
  tipe: 'Pengeluaran' | 'Pemasukan'
  dompet: string
  deskripsi: string
}

export type ServiceResult<T = unknown> = {
  success: boolean
  error?: string
  data?: T
}

export type ServiceOptions = {
  client?: SupabaseClient
  userId?: string
  limit?: number
  includeDeleted?: boolean
}

export function validateTransactionInput(input: TransactionInput): string | null {
  if (!input.tanggal || !/^\d{4}-\d{2}-\d{2}$/.test(input.tanggal)) {
    return 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD.'
  }

  const dateObj = new Date(input.tanggal)
  if (isNaN(dateObj.getTime())) {
    return 'Tanggal yang dimasukkan tidak valid.'
  }

  if (typeof input.nominal !== 'number' || isNaN(input.nominal) || input.nominal <= 0) {
    return 'Nominal harus berupa angka bulat positif lebih dari 0.'
  }

  if (input.tipe !== 'Pemasukan' && input.tipe !== 'Pengeluaran') {
    return 'Tipe transaksi hanya boleh "Pemasukan" atau "Pengeluaran".'
  }

  if (!input.kategori || input.kategori.trim().length === 0) {
    return 'Kategori wajib diisi.'
  }

  if (!input.dompet || input.dompet.trim().length === 0) {
    return 'Dompet / rekening wajib dipilih.'
  }

  if (!input.deskripsi || input.deskripsi.trim().length === 0) {
    return 'Deskripsi transaksi wajib diisi.'
  }

  return null
}

/**
 * Mendapatkan Supabase client dan user terverifikasi untuk operasi server
 */
async function resolveClientAndUser(options?: ServiceOptions) {
  const supabase = options?.client || (await createServerSupabaseClient())

  // Jika dipanggil dari server internal tepercaya (misal Telegram webhook) dengan userId yang sudah divalidasi
  if (options?.userId && options?.client) {
    return { supabase, user: { id: options.userId } }
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { supabase, user: null }
  }

  return { supabase, user }
}

/**
 * 1. Ambil daftar transaksi milik user yang aktif (deleted_at IS NULL secara default)
 */
export async function getTransactions(
  options?: ServiceOptions
): Promise<ServiceResult<TransactionRecord[]>> {
  try {
    const { supabase, user } = await resolveClientAndUser(options)
    if (!user) {
      return { success: false, error: 'Sesi Anda tidak valid. Silakan login kembali.' }
    }

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('tanggal', { ascending: false })
      .order('id', { ascending: false })

    if (!options?.includeDeleted) {
      query = query.is('deleted_at', null)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error in getTransactions service:', error)
      return { success: false, error: 'Gagal mengambil riwayat transaksi.' }
    }

    return { success: true, data: data as TransactionRecord[] }
  } catch (err) {
    console.error('Unexpected error in getTransactions:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat mengambil transaksi.' }
  }
}

/**
 * 2. Tambah transaksi baru untuk user yang sedang login
 */
export async function createTransaction(
  input: TransactionInput,
  options?: ServiceOptions
): Promise<ServiceResult<TransactionRecord>> {
  try {
    const { supabase, user } = await resolveClientAndUser(options)
    if (!user) {
      return { success: false, error: 'Sesi Anda tidak valid. Silakan login kembali.' }
    }

    const validationError = validateTransactionInput(input)
    if (validationError) {
      return { success: false, error: validationError }
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        tanggal: input.tanggal,
        kategori: input.kategori.trim(),
        nominal: Math.round(input.nominal),
        tipe: input.tipe,
        dompet: input.dompet.trim(),
        deskripsi: input.deskripsi.trim(),
        user_id: user.id,
        deleted_at: null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error in createTransaction service:', error)
      return { success: false, error: 'Gagal menyimpan transaksi ke database.' }
    }

    return { success: true, data: data as TransactionRecord }
  } catch (err) {
    console.error('Unexpected error in createTransaction:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat membuat transaksi.' }
  }
}

/**
 * 3. Ubah transaksi yang sudah ada berdasarkan ID dan user_id
 */
export async function updateTransaction(
  id: number,
  input: TransactionInput,
  options?: ServiceOptions
): Promise<ServiceResult<TransactionRecord>> {
  try {
    if (!id || typeof id !== 'number' || id <= 0) {
      return { success: false, error: 'ID transaksi tidak valid.' }
    }

    const { supabase, user } = await resolveClientAndUser(options)
    if (!user) {
      return { success: false, error: 'Sesi Anda tidak valid. Silakan login kembali.' }
    }

    const validationError = validateTransactionInput(input)
    if (validationError) {
      return { success: false, error: validationError }
    }

    const { data, error } = await supabase
      .from('transactions')
      .update({
        tanggal: input.tanggal,
        kategori: input.kategori.trim(),
        nominal: Math.round(input.nominal),
        tipe: input.tipe,
        dompet: input.dompet.trim(),
        deskripsi: input.deskripsi.trim(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) {
      console.error('Error in updateTransaction service:', error)
      return { success: false, error: 'Gagal memperbarui transaksi. Transaksi mungkin tidak ditemukan.' }
    }

    return { success: true, data: data as TransactionRecord }
  } catch (err) {
    console.error('Unexpected error in updateTransaction:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat memperbarui transaksi.' }
  }
}

/**
 * 4. Hapus transaksi dengan soft-delete (mengisi deleted_at)
 */
export async function deleteTransaction(
  id: number,
  options?: ServiceOptions
): Promise<ServiceResult<TransactionRecord>> {
  try {
    if (!id || typeof id !== 'number' || id <= 0) {
      return { success: false, error: 'ID transaksi tidak valid.' }
    }

    const { supabase, user } = await resolveClientAndUser(options)
    if (!user) {
      return { success: false, error: 'Sesi Anda tidak valid. Silakan login kembali.' }
    }

    const { data, error } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error || !data) {
      console.error('Error in deleteTransaction service:', error)
      return { success: false, error: 'Gagal menghapus transaksi. Transaksi tidak ditemukan atau sudah terhapus.' }
    }

    return { success: true, data: data as TransactionRecord }
  } catch (err) {
    console.error('Unexpected error in deleteTransaction:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat menghapus transaksi.' }
  }
}

/**
 * 5. Pulihkan transaksi yang di-soft-delete (undo delete)
 */
export async function undoDeleteTransaction(
  id?: number,
  options?: ServiceOptions
): Promise<ServiceResult<TransactionRecord>> {
  try {
    const { supabase, user } = await resolveClientAndUser(options)
    if (!user) {
      return { success: false, error: 'Sesi Anda tidak valid. Silakan login kembali.' }
    }

    let targetId = id

    // Jika id tidak disertakan, cari transaksi terakhir milik user yang dihapus
    if (!targetId) {
      const { data: latestDeleted, error: findError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (findError || !latestDeleted) {
        return { success: false, error: 'Tidak ada riwayat penghapusan transaksi yang dapat dipulihkan.' }
      }

      targetId = latestDeleted.id
    }

    const { data, error } = await supabase
      .from('transactions')
      .update({ deleted_at: null })
      .eq('id', targetId)
      .eq('user_id', user.id)
      .not('deleted_at', 'is', null)
      .select()
      .single()

    if (error || !data) {
      console.error('Error in undoDeleteTransaction service:', error)
      return { success: false, error: 'Gagal memulihkan transaksi yang terhapus.' }
    }

    return { success: true, data: data as TransactionRecord }
  } catch (err) {
    console.error('Unexpected error in undoDeleteTransaction:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat memulihkan transaksi.' }
  }
}
