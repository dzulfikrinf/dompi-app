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

    if (input.tambah_saldo !== undefined) {
      const delta = Math.round(Number(input.tambah_saldo))
      updates.saldo_awal = Number(currentWallet.saldo_awal || 0) + delta
    } else if (input.saldo_awal !== undefined) {
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

export type TransferWalletInput = {
  fromWalletName: string
  toWalletName: string
  nominal: number
  biayaAdmin?: number
  catatan?: string
  tanggal?: string
}

export type TransferWalletResult = {
  fromWallet: string
  toWallet: string
  nominal: number
  biayaAdmin: number
  transferredAt: string
}

/**
 * Pindah saldo / Transfer antar dompet (membuat sepasang transaksi Pengeluaran & Pemasukan)
 */
export async function transferWalletBalance(
  input: TransferWalletInput,
  options?: ServiceOptions
): Promise<ServiceResult<TransferWalletResult>> {
  try {
    const { client, userId } = await resolveClientAndUser(options)
    if (!userId) {
      return { success: false, error: 'User tidak terotentikasi.' }
    }

    const nominal = Math.round(Number(input.nominal))
    if (isNaN(nominal) || nominal <= 0) {
      return { success: false, error: 'Nominal transfer harus berupa angka lebih dari 0.' }
    }

    const cleanFrom = input.fromWalletName?.trim()
    const cleanTo = input.toWalletName?.trim()

    if (!cleanFrom || !cleanTo) {
      return { success: false, error: 'Dompet asal dan tujuan transfer wajib diisi.' }
    }

    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      return { success: false, error: 'Dompet asal dan tujuan tidak boleh sama.' }
    }

    // Ambil semua dompet user
    const { data: wallets, error: wErr } = await client
      .from('wallets')
      .select('*')
      .eq('user_id', userId)

    if (wErr || !wallets || wallets.length === 0) {
      return { success: false, error: 'Gagal memuat data dompet untuk transfer.' }
    }

    const fromTarget = wallets.find(
      (w) => w.nama.toLowerCase() === cleanFrom.toLowerCase()
    )
    if (!fromTarget) {
      const avail = wallets.map((w) => w.nama).join(', ')
      return {
        success: false,
        error: `Dompet asal "${cleanFrom}" tidak ditemukan. Pilihan yang ada: ${avail}`,
      }
    }

    const toTarget = wallets.find(
      (w) => w.nama.toLowerCase() === cleanTo.toLowerCase()
    )
    if (!toTarget) {
      const avail = wallets.map((w) => w.nama).join(', ')
      return {
        success: false,
        error: `Dompet tujuan "${cleanTo}" tidak ditemukan. Pilihan yang ada: ${avail}`,
      }
    }

    const tanggal = input.tanggal || new Date().toISOString().split('T')[0]
    const note = input.catatan ? ` (${input.catatan.trim()})` : ''
    const fee = Math.max(0, Math.round(Number(input.biayaAdmin || 0)))

    const rowsToInsert = [
      // 1. Pengeluaran dari dompet asal
      {
        user_id: userId,
        tanggal,
        kategori: 'Transfer Keluar',
        nominal,
        tipe: 'Pengeluaran',
        dompet: fromTarget.nama,
        deskripsi: `Transfer ke ${toTarget.nama}${note}`,
        deleted_at: null,
      },
      // 2. Pemasukan ke dompet tujuan
      {
        user_id: userId,
        tanggal,
        kategori: 'Transfer Masuk',
        nominal,
        tipe: 'Pemasukan',
        dompet: toTarget.nama,
        deskripsi: `Transfer dari ${fromTarget.nama}${note}`,
        deleted_at: null,
      },
    ]

    // 3. Biaya admin jika ada
    if (fee > 0) {
      rowsToInsert.push({
        user_id: userId,
        tanggal,
        kategori: 'Biaya Admin',
        nominal: fee,
        tipe: 'Pengeluaran',
        dompet: fromTarget.nama,
        deskripsi: `Biaya transfer dari ${fromTarget.nama} ke ${toTarget.nama}`,
        deleted_at: null,
      })
    }

    const { error: insertErr } = await client
      .from('transactions')
      .insert(rowsToInsert)

    if (insertErr) {
      console.error('Error inserting transfer transactions:', insertErr)
      return { success: false, error: 'Gagal mencatat transfer antar dompet.' }
    }

    return {
      success: true,
      data: {
        fromWallet: fromTarget.nama,
        toWallet: toTarget.nama,
        nominal,
        biayaAdmin: fee,
        transferredAt: tanggal,
      },
    }
  } catch (err) {
    console.error('Unhandled error in transferWalletBalance:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat memproses transfer.' }
  }
}

export type AdjustWalletInput = {
  walletNameOrId: string | number
  nominalTarget: number
  catatan?: string
  tanggal?: string
}

export type AdjustWalletResult = {
  walletNama: string
  saldoLama: number
  saldoBaru: number
  selisih: number
  tipePenyesuaian: 'Pemasukan' | 'Pengeluaran' | 'Sesuai'
}

/**
 * Rekonsiliasi / Penyesuaian saldo riil dompet
 */
export async function adjustWalletBalance(
  input: AdjustWalletInput,
  options?: ServiceOptions
): Promise<ServiceResult<AdjustWalletResult>> {
  try {
    const { client, userId } = await resolveClientAndUser(options)
    if (!userId) {
      return { success: false, error: 'User tidak terotentikasi.' }
    }

    const targetNominal = Math.round(Number(input.nominalTarget))
    if (isNaN(targetNominal) || targetNominal < 0) {
      return { success: false, error: 'Target saldo baru harus berupa angka positif atau nol.' }
    }

    // Ambil data dompet user
    const { data: wallets, error: wErr } = await client
      .from('wallets')
      .select('*')
      .eq('user_id', userId)

    if (wErr || !wallets || wallets.length === 0) {
      return { success: false, error: 'Data dompet tidak ditemukan.' }
    }

    let targetWallet = null
    if (typeof input.walletNameOrId === 'number') {
      targetWallet = wallets.find((w) => Number(w.id) === input.walletNameOrId)
    } else {
      const q = String(input.walletNameOrId).trim().toLowerCase()
      targetWallet = wallets.find((w) => w.nama.toLowerCase() === q)
    }

    if (!targetWallet) {
      const avail = wallets.map((w) => w.nama).join(', ')
      return {
        success: false,
        error: `Dompet "${input.walletNameOrId}" tidak ditemukan. Dompet yang tersedia: ${avail}`,
      }
    }

    // Ambil semua transaksi aktif untuk dompet ini untuk menghitung saldo saat ini
    const { data: trxs, error: tErr } = await client
      .from('transactions')
      .select('nominal, tipe, deleted_at, dompet')
      .eq('user_id', userId)
      .eq('dompet', targetWallet.nama)
      .is('deleted_at', null)

    if (tErr) {
      return { success: false, error: 'Gagal menghitung saldo dompet saat ini.' }
    }

    let currentBalance = Number(targetWallet.saldo_awal || 0)
    for (const t of trxs || []) {
      if (t.tipe === 'Pemasukan') currentBalance += Number(t.nominal || 0)
      if (t.tipe === 'Pengeluaran') currentBalance -= Number(t.nominal || 0)
    }

    const selisih = targetNominal - currentBalance

    if (selisih === 0) {
      return {
        success: true,
        data: {
          walletNama: targetWallet.nama,
          saldoLama: currentBalance,
          saldoBaru: targetNominal,
          selisih: 0,
          tipePenyesuaian: 'Sesuai',
        },
      }
    }

    const tanggal = input.tanggal || new Date().toISOString().split('T')[0]
    const tipe = selisih > 0 ? 'Pemasukan' : 'Pengeluaran'
    const absNominal = Math.abs(selisih)
    const deskripsi =
      input.catatan?.trim() ||
      `Penyesuaian saldo riil dompet ${targetWallet.nama} (${selisih > 0 ? '+' : '-'}${absNominal.toLocaleString('id-ID')})`

    const { error: insertErr } = await client.from('transactions').insert({
      user_id: userId,
      tanggal,
      kategori: 'Penyesuaian Saldo',
      nominal: absNominal,
      tipe,
      dompet: targetWallet.nama,
      deskripsi,
      deleted_at: null,
    })

    if (insertErr) {
      console.error('Error inserting adjust transaction:', insertErr)
      return { success: false, error: 'Gagal menyimpan transaksi penyesuaian saldo.' }
    }

    return {
      success: true,
      data: {
        walletNama: targetWallet.nama,
        saldoLama: currentBalance,
        saldoBaru: targetNominal,
        selisih,
        tipePenyesuaian: tipe,
      },
    }
  } catch (err) {
    console.error('Unhandled error in adjustWalletBalance:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat menyesuaikan saldo.' }
  }
}

