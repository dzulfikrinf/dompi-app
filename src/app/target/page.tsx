import { requireAuthUser } from '@/lib/auth'
import AppLayout from '@/components/layout/app-layout'
import FeatureStatusCard from '@/components/common/feature-status-card'

export const dynamic = 'force-dynamic'

export default async function TargetPage() {
  const user = await requireAuthUser()

  return (
    <AppLayout currentPath="/target" userEmail={user.email}>
      <FeatureStatusCard
        title="Target Tabungan (Savings Goals)"
        icon="target"
        description="Pantau progres target tabungan jangka pendek dan jangka panjang secara terukur."
        plannedFeatures={[
          'Pembuatan target tabungan (contoh: Dana Darurat, Liburan, Beli Gadget Baru).',
          'Alokasi simpanan otomatis setiap ada pemasukan tercatat.',
          'Estimasi waktu pencapaian target berdasarkan rata-rata tabungan bulanan.',
        ]}
        currentAlternative="Anda dapat mencatat transaksi pemasukan tabungan (misalnya ke dompet Bibit Investasi) dan memantau total saldo akumulasi di Beranda."
      />
    </AppLayout>
  )
}
