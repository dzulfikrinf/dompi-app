import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AppLayout from '@/components/layout/app-layout'
import FeatureStatusCard from '@/components/common/feature-status-card'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AnggaranPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AppLayout currentPath="/anggaran" userEmail={user.email}>
      <FeatureStatusCard
        title="Alokasi Anggaran Bulanan"
        icon="pie"
        description="Perencanaan budget dan batas maksimal pengeluaran per kategori belanja."
        plannedFeatures={[
          'Pengaturan pagu anggaran per kategori (misal: Makanan Rp 3.000.000, Transport Rp 1.000.000).',
          'Notifikasi peringatan otomatis saat pengeluaran mendekati 80% dari batas anggaran.',
          'Penyesuaian batas anggaran dinamis setiap awal bulan.',
        ]}
        currentAlternative="Saat ini pagu anggaran bulanan global disetel sebesar Rp 10.500.000 dan dipantau langsung pada kartu Sisa Anggaran di halaman Beranda."
      />
    </AppLayout>
  )
}
