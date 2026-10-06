import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppLayout from '@/components/layout/app-layout'
import FeatureStatusCard from '@/components/common/feature-status-card'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LaporanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AppLayout currentPath="/laporan" userEmail={user.email}>
      <FeatureStatusCard
        title="Laporan & Analitik Keuangan"
        icon="chart"
        description="Analisis mendalam tren keuangan, ekspor data CSV/PDF, dan perbandingan performa antar-bulan."
        plannedFeatures={[
          'Ekspor pembukuan keuangan ke format PDF dan CSV/Excel untuk pelaporan pajak atau arsip.',
          'Grafik komposisi pengeluaran per kategori secara visual dan persentase detail.',
          'Insight AI otomatis mengenai kebiasaan belanja dan rekomendasi penghematan bulanan.',
        ]}
        currentAlternative="Anda dapat memantau grafik arus kas harian di Beranda atau melakukan pencarian dan filter transaksi berdasarkan tanggal di menu Transaksi."
      />
    </AppLayout>
  )
}
