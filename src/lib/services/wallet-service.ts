import { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import {
  WalletRecord,
  WalletInput,
  validateWalletInput,
  WALLET_TYPES,
  calculateWalletBalances,
} from '@/lib/types/wallet'

export type { WalletRecord, WalletInput }
export { WALLET_TYPES, validateWalletInput, calculateWalletBalances }

export type ServiceResult<T = unknown> = {
  success: boolean
  error?: string
  data?: T
}

export type ServiceOptions = {
  client?: SupabaseClient
  userId?: string
}

async function resolveClientAndUser(options?: ServiceOptions) {
  const client = options?.client ?? (await createServerSupabaseClient())
  let userId = options?.userId

  if (!userId) {
    const {
      data: { user },
    } = await client.auth.getUser()
    userId = user?.id
  }

  return { client, userId }
}

/**
 * Mengambil seluruh dompet milik user
 */
export async function getWallets(
  options?: ServiceOptions
): Promise<ServiceResult<WalletRecord[]>> {
  try {
    const { client, userId } = await resolveClientAndUser(options)

    if (!userId) {
      return { success: false, error: 'User tidak terotentikasi.' }
    }

    const { data, error } = await client
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching wallets:', error)
      return { success: false, error: 'Gagal mengambil data dompet.' }
    }

    const formatted: WalletRecord[] = (data || []).map((w) => ({
      id: Number(w.id),
      user_id: w.user_id,
      nama: w.nama,
      tipe: w.tipe,
      saldo_awal: Number(w.saldo_awal || 0),
    }))

    return { success: true, data: formatted }
  } catch (err) {
    console.error('Unhandled error in getWallets:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat memuat dompet.' }
  }
}

/**
 * Menambahkan dompet baru
 */
export async function createWallet(
  input: WalletInput,
  options?: ServiceOptions
): Promise<ServiceResult<WalletRecord>> {
  try {
    const validationError = validateWalletInput(input)
    if (validationError) {
      return { success: false, error: validationError }
    }

    const { client, userId } = await resolveClientAndUser(options)

    if (!userId) {
      return { success: false, error: 'User tidak terotentikasi.' }
    }

    const cleanName = input.nama.trim()
    const cleanTipe = input.tipe.trim()
    const cleanSaldoAwal = Math.round(Number(input.saldo_awal || 0))

    // Cek duplikasi nama dompet untuk user ini
    const { data: existing } = await client
      .from('wallets')
      .select('id, nama')
      .eq('user_id', userId)
      .ilike('nama', cleanName)
      .maybeSingle()

    if (existing) {
      return {
        success: false,
        error: `Dompet dengan nama "${existing.nama}" sudah ada. Silakan gunakan nama lain.`,
      }
    }

    const { data, error } = await client
      .from('wallets')
      .insert({
        user_id: userId,
        nama: cleanName,
        tipe: cleanTipe,
        saldo_awal: cleanSaldoAwal,
      })
      .select('*')
      .single()

    if (error || !data) {
      console.error('Error creating wallet:', error)
      return { success: false, error: 'Gagal menyimpan dompet ke database.' }
    }

    return {
      success: true,
      data: {
        id: Number(data.id),
        user_id: data.user_id,
        nama: data.nama,
        tipe: data.tipe,
        saldo_awal: Number(data.saldo_awal),
      },
    }
  } catch (err) {
    console.error('Unhandled error in createWallet:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat membuat dompet.' }
  }
}

/**
 * Memperbarui data dompet
 */
export async function updateWallet(
  walletId: number,
  input: Partial<WalletInput>,
  options?: ServiceOptions
): Promise<ServiceResult<WalletRecord>> {
  try {
    const validationError = validateWalletInput(input, true)
    if (validationError) {
      return { success: false, error: validationError }
    }

    const { client, userId } = await resolveClientAndUser(options)

    if (!userId) {
      return { success: false, error: 'User tidak terotentikasi.' }
    }

    // Ambil data dompet lama
    const { data: currentWallet, error: fetchErr } = await client
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchErr || !currentWallet) {
      return { success: false, error: 'Dompet tidak ditemukan.' }
    }

    const updates: Record<string, unknown> = {}

    if (input.nama !== undefined) {
      const cleanName = input.nama.trim()
      // Cek apakah nama baru bentrok dengan dompet lain milik user
      if (cleanName.toLowerCase() !== currentWallet.nama.toLowerCase()) {
        const { data: duplicate } = await client
          .from('wallets')
          .select('id')
          .eq('user_id', userId)
          .ilike('nama', cleanName)
          .neq('id', walletId)
          .maybeSingle()

        if (duplicate) {
          return {
            success: false,
            error: `Dompet dengan nama "${cleanName}" sudah digunakan.`,
          }
        }
      }
      updates.nama = cleanName
    }

    if (input.tipe !== undefined) {
      updates.tipe = input.tipe.trim()
    }

    if (input.saldo_awal !== undefined) {
      updates.saldo_awal = Math.round(Number(input.saldo_awal))
    }

    if (Object.keys(updates).length === 0) {
      return {
        success: true,
        data: {
          id: Number(currentWallet.id),
          user_id: currentWallet.user_id,
          nama: currentWallet.nama,
          tipe: currentWallet.tipe,
          saldo_awal: Number(currentWallet.saldo_awal),
        },
      }
    }

    const { data: updated, error: updateErr } = await client
      .from('wallets')
      .update(updates)
      .eq('id', walletId)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (updateErr || !updated) {
      console.error('Error updating wallet:', updateErr)
      return { success: false, error: 'Gagal memperbarui data dompet.' }
    }

    // Jika nama dompet diubah, sinkronkan transaksi lama yang memakai nama lama
    if (updates.nama && updates.nama !== currentWallet.nama) {
      await client
        .from('transactions')
        .update({ dompet: updates.nama })
        .eq('user_id', userId)
        .eq('dompet', currentWallet.nama)
    }

    return {
      success: true,
      data: {
        id: Number(updated.id),
        user_id: updated.user_id,
        nama: updated.nama,
        tipe: updated.tipe,
        saldo_awal: Number(updated.saldo_awal),
      },
    }
  } catch (err) {
    console.error('Unhandled error in updateWallet:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat mengubah dompet.' }
  }
}

/**
 * Menghapus dompet
 */
export async function deleteWallet(
  walletId: number,
  options?: ServiceOptions
): Promise<ServiceResult<{ id: number; nama: string }>> {
  try {
    const { client, userId } = await resolveClientAndUser(options)

    if (!userId) {
      return { success: false, error: 'User tidak terotentikasi.' }
    }

    // Ambil dompet sebelum dihapus
    const { data: wallet, error: fetchErr } = await client
      .from('wallets')
      .select('*')
      .eq('id', walletId)
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchErr || !wallet) {
      return { success: false, error: 'Dompet tidak ditemukan.' }
    }

    const { error: deleteErr } = await client
      .from('wallets')
      .delete()
      .eq('id', walletId)
      .eq('user_id', userId)

    if (deleteErr) {
      console.error('Error deleting wallet:', deleteErr)
      return { success: false, error: 'Gagal menghapus dompet dari database.' }
    }

    return {
      success: true,
      data: {
        id: Number(wallet.id),
        nama: wallet.nama,
      },
    }
  } catch (err) {
    console.error('Unhandled error in deleteWallet:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat menghapus dompet.' }
  }
}

