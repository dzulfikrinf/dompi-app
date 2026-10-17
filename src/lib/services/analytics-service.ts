import { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import { getWallets, calculateWalletBalances } from '@/lib/services/wallet-service'

export type ServiceOptions = {
  client?: SupabaseClient
  userId?: string
}

export type AnalyticsPeriod = 'this_month' | 'last_month' | 'last_30_days' | 'last_7_days' | 'all'

export type CategoryStat = {
  kategori: string
  nominal: number
  persentase: number
  jumlahTransaksi: number
}

export type FinancialAnalysisResult = {
  periodeLabel: string
  totalPemasukan: number
  totalPengeluaran: number
  arusKasBersih: number // Surplus/Defisit
  rasioTabunganPersen: number // (Pemasukan - Pengeluaran) / Pemasukan * 100
  rataRataPengeluaranHarian: number
  jumlahHariDalamPeriode: number
  totalTransaksi: number
  kategoriPengeluaran: CategoryStat[]
  kategoriPemasukan: CategoryStat[]
  posTerboros: Array<{ kategori: string; nominal: number; persentase: number }>
  transaksiTerbesar: Array<{
    id: number
    tanggal: string
    kategori: string
    nominal: number
    deskripsi: string
    dompet: string
  }>
  perbandinganBulanSebelumnya?: {
    periodeSebelumnyaLabel: string
    pengeluaranSebelumnya: number
    pemasukanSebelumnya: number
    deltaPengeluaranNominal: number
    deltaPengeluaranPersen: number
    trenPengeluaran: 'naik' | 'turun' | 'stabil'
  }
  ringkasanDompet: {
    totalSaldoTerkini: number
    rincian: Array<{ nama: string; tipe: string; saldo: number; persentaseDariTotal: number }>
  }
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

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

/**
 * Menghasilkan analisis keuangan mendalam milik pengguna
 */
export async function getFinancialAnalysis(
  period: AnalyticsPeriod = 'this_month',
  options?: ServiceOptions
): Promise<{ success: boolean; data?: FinancialAnalysisResult; error?: string }> {
  try {
    const { client, userId } = await resolveClientAndUser(options)
    if (!userId) {
      return { success: false, error: 'User tidak terotentikasi.' }
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-indexed

    let startDateStr: string
    let endDateStr: string = formatDate(now)
    let periodeLabel: string
    let prevStartDateStr: string | null = null
    let prevEndDateStr: string | null = null
    let prevPeriodeLabel: string | null = null
    let daysCount = 30

    if (period === 'this_month') {
      const startOfMonth = new Date(currentYear, currentMonth, 1)
      startDateStr = formatDate(startOfMonth)
      periodeLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      daysCount = Math.max(1, now.getDate())

      // Periode bulan lalu untuk pembanding
      const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1)
      const endOfPrevMonth = new Date(currentYear, currentMonth, 0)
      prevStartDateStr = formatDate(startOfPrevMonth)
      prevEndDateStr = formatDate(endOfPrevMonth)
      prevPeriodeLabel = startOfPrevMonth.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
    } else if (period === 'last_month') {
      const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1)
      const endOfPrevMonth = new Date(currentYear, currentMonth, 0)
      startDateStr = formatDate(startOfPrevMonth)
      endDateStr = formatDate(endOfPrevMonth)
      periodeLabel = startOfPrevMonth.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
      })
      daysCount = endOfPrevMonth.getDate()
    } else if (period === 'last_7_days') {
      const past7 = new Date()
      past7.setDate(now.getDate() - 7)
      startDateStr = formatDate(past7)
      periodeLabel = '7 Hari Terakhir'
      daysCount = 7
    } else if (period === 'last_30_days') {
      const past30 = new Date()
      past30.setDate(now.getDate() - 30)
      startDateStr = formatDate(past30)
      periodeLabel = '30 Hari Terakhir'
      daysCount = 30
    } else {
      startDateStr = '2000-01-01'
      periodeLabel = 'Seluruh Waktu'
      daysCount = 365
    }

    // Ambil semua transaksi aktif user
    const { data: allTransactions, error: trxErr } = await client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('tanggal', { ascending: false })

    if (trxErr || !allTransactions) {
      console.error('Error fetching transactions for analytics:', trxErr)
      return { success: false, error: 'Gagal mengambil data transaksi untuk analisis.' }
    }

    // Ambil data dompet dan hitung saldo terkini
    const walletsRes = await getWallets(options)
    const rawWallets = walletsRes.success && walletsRes.data ? walletsRes.data : []
    const { walletsWithBalance, totalSaldoTerkini } = calculateWalletBalances(
      rawWallets,
      allTransactions
    )

    // Filter transaksi untuk periode terpilih
    // Catatan: kecualikan transfer internal agar tidak mendistorsi analisis konsumsi
    const periodTransactions = allTransactions.filter(
      (t) => t.tanggal >= startDateStr && t.tanggal <= endDateStr
    )

    const expenseTransactions = periodTransactions.filter(
      (t) => t.tipe === 'Pengeluaran' && t.kategori !== 'Transfer Keluar'
    )
    const incomeTransactions = periodTransactions.filter(
      (t) => t.tipe === 'Pemasukan' && t.kategori !== 'Transfer Masuk'
    )

    const totalPengeluaran = expenseTransactions.reduce((acc, t) => acc + Number(t.nominal || 0), 0)
    const totalPemasukan = incomeTransactions.reduce((acc, t) => acc + Number(t.nominal || 0), 0)
    const arusKasBersih = totalPemasukan - totalPengeluaran

    const rasioTabunganPersen =
      totalPemasukan > 0
        ? Math.round(((totalPemasukan - totalPengeluaran) / totalPemasukan) * 100)
        : totalPengeluaran > 0
          ? -100
          : 0

    const rataRataPengeluaranHarian = Math.round(totalPengeluaran / Math.max(1, daysCount))

    // Agregasi kategori pengeluaran
    const expenseCategoryMap: Record<string, { nominal: number; count: number }> = {}
    for (const t of expenseTransactions) {
      const kat = t.kategori || 'Lainnya'
      if (!expenseCategoryMap[kat]) {
        expenseCategoryMap[kat] = { nominal: 0, count: 0 }
      }
      expenseCategoryMap[kat].nominal += Number(t.nominal || 0)
      expenseCategoryMap[kat].count += 1
    }

    const kategoriPengeluaran: CategoryStat[] = Object.entries(expenseCategoryMap)
      .map(([kategori, val]) => ({
        kategori,
        nominal: val.nominal,
        persentase:
          totalPengeluaran > 0 ? Math.round((val.nominal / totalPengeluaran) * 100) : 0,
        jumlahTransaksi: val.count,
      }))
      .sort((a, b) => b.nominal - a.nominal)

    // Agregasi kategori pemasukan
    const incomeCategoryMap: Record<string, { nominal: number; count: number }> = {}
    for (const t of incomeTransactions) {
      const kat = t.kategori || 'Lainnya'
      if (!incomeCategoryMap[kat]) {
        incomeCategoryMap[kat] = { nominal: 0, count: 0 }
      }
      incomeCategoryMap[kat].nominal += Number(t.nominal || 0)
      incomeCategoryMap[kat].count += 1
    }

    const kategoriPemasukan: CategoryStat[] = Object.entries(incomeCategoryMap)
      .map(([kategori, val]) => ({
        kategori,
        nominal: val.nominal,
        persentase:
          totalPemasukan > 0 ? Math.round((val.nominal / totalPemasukan) * 100) : 0,
        jumlahTransaksi: val.count,
      }))
      .sort((a, b) => b.nominal - a.nominal)

    const posTerboros = kategoriPengeluaran.slice(0, 3).map((k) => ({
      kategori: k.kategori,
      nominal: k.nominal,
      persentase: k.persentase,
    }))

    const transaksiTerbesar = expenseTransactions
      .slice()
      .sort((a, b) => Number(b.nominal || 0) - Number(a.nominal || 0))
      .slice(0, 5)
      .map((t) => ({
        id: Number(t.id),
        tanggal: t.tanggal,
        kategori: t.kategori,
        nominal: Number(t.nominal),
        deskripsi: t.deskripsi,
        dompet: t.dompet,
      }))

    // Perbandingan dengan bulan sebelumnya jika periode adalah this_month
    let perbandinganBulanSebelumnya: FinancialAnalysisResult['perbandinganBulanSebelumnya'] = undefined
    if (prevStartDateStr && prevEndDateStr && prevPeriodeLabel) {
      const prevTransactions = allTransactions.filter(
        (t) =>
          t.tanggal >= prevStartDateStr! &&
          t.tanggal <= prevEndDateStr! &&
          t.tipe === 'Pengeluaran' &&
          t.kategori !== 'Transfer Keluar'
      )
      const prevIncome = allTransactions.filter(
        (t) =>
          t.tanggal >= prevStartDateStr! &&
          t.tanggal <= prevEndDateStr! &&
          t.tipe === 'Pemasukan' &&
          t.kategori !== 'Transfer Masuk'
      )

      const pengeluaranSebelumnya = prevTransactions.reduce(
        (acc, t) => acc + Number(t.nominal || 0),
        0
      )
      const pemasukanSebelumnya = prevIncome.reduce((acc, t) => acc + Number(t.nominal || 0), 0)

      const deltaPengeluaranNominal = totalPengeluaran - pengeluaranSebelumnya
      let deltaPengeluaranPersen = 0
      if (pengeluaranSebelumnya > 0) {
        deltaPengeluaranPersen = Math.round(
          ((totalPengeluaran - pengeluaranSebelumnya) / pengeluaranSebelumnya) * 100
        )
      }

      let trenPengeluaran: 'naik' | 'turun' | 'stabil' = 'stabil'
      if (deltaPengeluaranPersen > 3) trenPengeluaran = 'naik'
      else if (deltaPengeluaranPersen < -3) trenPengeluaran = 'turun'

      perbandinganBulanSebelumnya = {
        periodeSebelumnyaLabel: prevPeriodeLabel,
        pengeluaranSebelumnya,
        pemasukanSebelumnya,
        deltaPengeluaranNominal,
        deltaPengeluaranPersen,
        trenPengeluaran,
      }
    }

    // Distribusi saldo dompet
    const rincianDompet = walletsWithBalance.map((w) => {
      const saldo = w.saldo_terkini ?? w.saldo_awal
      return {
        nama: w.nama,
        tipe: w.tipe,
        saldo,
        persentaseDariTotal:
          totalSaldoTerkini > 0 ? Math.round((saldo / totalSaldoTerkini) * 100) : 0,
      }
    })

    return {
      success: true,
      data: {
        periodeLabel,
        totalPemasukan,
        totalPengeluaran,
        arusKasBersih,
        rasioTabunganPersen,
        rataRataPengeluaranHarian,
        jumlahHariDalamPeriode: daysCount,
        totalTransaksi: periodTransactions.length,
        kategoriPengeluaran,
        kategoriPemasukan,
        posTerboros,
        transaksiTerbesar,
        perbandinganBulanSebelumnya,
        ringkasanDompet: {
          totalSaldoTerkini,
          rincian: rincianDompet,
        },
      },
    }
  } catch (err) {
    console.error('Unexpected error in getFinancialAnalysis:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat menganalisis keuangan.' }
  }
}

/**
 * Format laporan analitik keuangan ke dalam bentuk teks terstruktur
 * (digunakan sebagai fallback yang andal jika layanan AI mengalami lonjakan trafik/limit kuota)
 */
export function formatFinancialAnalysisFallback(data: FinancialAnalysisResult): string {
  const isSurplus = data.arusKasBersih >= 0
  const statusSurplus = isSurplus
    ? `Surplus Rp${data.arusKasBersih.toLocaleString('id-ID')}`
    : `Defisit Rp${Math.abs(data.arusKasBersih).toLocaleString('id-ID')}`

  const topCats = (data.posTerboros || [])
    .map((k: { kategori: string; nominal: number; persentase: number }, i: number) => `${i + 1}. **${k.kategori}**: Rp${k.nominal.toLocaleString('id-ID')} (${k.persentase}%)`)
    .join('\n')

  let perbandinganText = ''
  if (data.perbandinganBulanSebelumnya) {
    const p = data.perbandinganBulanSebelumnya
    const tanda = p.deltaPengeluaranNominal >= 0 ? '+' : ''
    perbandinganText = `\n• **Dibandingkan ${p.periodeSebelumnyaLabel}**: Pengeluaran ${p.trenPengeluaran} ${tanda}${p.deltaPengeluaranPersen}% (Rp${p.deltaPengeluaranNominal.toLocaleString('id-ID')})`
  }

  const advice =
    data.rasioTabunganPersen >= 20
      ? 'Kondisi finansialmu sehat dengan rasio tabungan yang baik! Pertahankan konsistensi ini ya.'
      : data.arusKasBersih < 0
      ? 'Bulan ini pengeluaranmu melebihi pemasukan. Coba rem pos pengeluaran terbesar di atas agar saldo tetap aman.'
      : 'Arus kasmu positif, namun usahakan tekan pos pengeluaran terbesar agar bisa menabung minimal 20% dari pemasukan.'

  return `**Analisis Keuangan (${data.periodeLabel})**

• **Total Pemasukan**: Rp${data.totalPemasukan.toLocaleString('id-ID')}
• **Total Pengeluaran**: Rp${data.totalPengeluaran.toLocaleString('id-ID')}
• **Arus Kas Bersih**: ${statusSurplus}
• **Rasio Tabungan**: ${data.rasioTabunganPersen}%
• **Rata-rata Pengeluaran**: Rp${data.rataRataPengeluaranHarian.toLocaleString('id-ID')}/hari${perbandinganText}

**Pos Pengeluaran Terbesar:**
${topCats || '- Belum ada data pengeluaran'}

**Saran Dompi:**
${advice}`
}
