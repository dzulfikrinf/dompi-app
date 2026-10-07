export type WalletRecord = {
  id: number
  user_id: string
  nama: string
  tipe: string
  saldo_awal: number
  saldo_terkini?: number
  total_masuk?: number
  total_keluar?: number
}

export type WalletInput = {
  nama: string
  tipe: string
  saldo_awal?: number
  tambah_saldo?: number
}

export const WALLET_TYPES = [
  'Rekening Bank',
  'Dompet Digital',
  'Reksa Dana / Investasi',
  'Uang Fisik / Tunai',
  'Kartu Kredit',
  'Lainnya',
] as const

export function validateWalletInput(input: Partial<WalletInput>, isUpdate = false): string | null {
  if (!isUpdate || input.nama !== undefined) {
    if (!input.nama || input.nama.trim().length === 0) {
      return 'Nama dompet wajib diisi.'
    }
    if (input.nama.trim().length > 50) {
      return 'Nama dompet maksimal 50 karakter.'
    }
  }

  if (!isUpdate || input.tipe !== undefined) {
    if (!input.tipe || input.tipe.trim().length === 0) {
      return 'Tipe dompet wajib diisi.'
    }
  }

  if (input.saldo_awal !== undefined) {
    if (typeof input.saldo_awal !== 'number' || isNaN(input.saldo_awal)) {
      return 'Saldo awal harus berupa angka valid.'
    }
  }

  if (input.tambah_saldo !== undefined) {
    if (typeof input.tambah_saldo !== 'number' || isNaN(input.tambah_saldo)) {
      return 'Nominal penambahan saldo harus berupa angka valid.'
    }
  }

  return null
}

/**
 * Menghitung saldo terkini setiap dompet berdasarkan mutasi transaksi
 */
export function calculateWalletBalances(
  wallets: WalletRecord[],
  transactions: Array<{ nominal: number; tipe: string; dompet?: string; deleted_at?: string | null }>
): {
  walletsWithBalance: WalletRecord[]
  totalSaldoAwal: number
  totalSaldoTerkini: number
  totalPemasukan: number
  totalPengeluaran: number
} {
  const activeTrx = transactions.filter((t) => !t.deleted_at)

  let totalSaldoAwal = 0
  let totalSaldoTerkini = 0
  let totalPemasukan = 0
  let totalPengeluaran = 0

  const walletsWithBalance = wallets.map((wallet) => {
    const wName = wallet.nama.toLowerCase()

    const masuk = activeTrx
      .filter((t) => t.tipe === 'Pemasukan' && t.dompet?.toLowerCase() === wName)
      .reduce((acc, t) => acc + Number(t.nominal || 0), 0)

    const keluar = activeTrx
      .filter((t) => t.tipe === 'Pengeluaran' && t.dompet?.toLowerCase() === wName)
      .reduce((acc, t) => acc + Number(t.nominal || 0), 0)

    const saldoTerkini = wallet.saldo_awal + masuk - keluar

    totalSaldoAwal += wallet.saldo_awal
    totalSaldoTerkini += saldoTerkini
    totalPemasukan += masuk
    totalPengeluaran += keluar

    return {
      ...wallet,
      saldo_terkini: saldoTerkini,
      total_masuk: masuk,
      total_keluar: keluar,
    }
  })

  return {
    walletsWithBalance,
    totalSaldoAwal,
    totalSaldoTerkini,
    totalPemasukan,
    totalPengeluaran,
  }
}
