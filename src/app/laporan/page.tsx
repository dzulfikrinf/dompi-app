import { requireAuthUser } from '@/lib/auth'
import {
  getFinancialAnalysis,
  FinancialAnalysisResult,
} from '@/lib/services/analytics-service'
import LaporanClient from './laporan-client'

export const dynamic = 'force-dynamic'

const DEFAULT_EMPTY_ANALYSIS: FinancialAnalysisResult = {
  periodeLabel: 'Bulan Ini',
  totalPemasukan: 0,
  totalPengeluaran: 0,
  arusKasBersih: 0,
  rasioTabunganPersen: 0,
  rataRataPengeluaranHarian: 0,
  jumlahHariDalamPeriode: 30,
  totalTransaksi: 0,
  kategoriPengeluaran: [],
  kategoriPemasukan: [],
  posTerboros: [],
  transaksiTerbesar: [],
  ringkasanDompet: {
    totalSaldoTerkini: 0,
    rincian: [],
  },
  trenHarian: [],
  daftarTransaksi: [],
}

export default async function LaporanPage() {
  const user = await requireAuthUser()

  const analysisRes = await getFinancialAnalysis('this_month', {
    userId: user.id,
  })

  const initialAnalysis =
    analysisRes.success && analysisRes.data ? analysisRes.data : DEFAULT_EMPTY_ANALYSIS

  return (
    <LaporanClient
      initialAnalysis={initialAnalysis}
      userEmail={user.email}
    />
  )
}
