import { requireAuthUser } from '@/lib/auth'
import AppLayout from '@/components/layout/app-layout'
import FeatureStatusCard from '@/components/common/feature-status-card'

export const dynamic = 'force-dynamic'

export default async function TagihanPage() {
  const user = await requireAuthUser()

  return (
    <AppLayout currentPath="/tagihan" userEmail={user.email}>
      <FeatureStatusCard
        title="Tagihan Rutin & Langganan"
        icon="check"
        description="Kelola pengingat pembayaran tagihan bulanan berulang (listrik, wifi, sewa, asuransi)."
        plannedFeatures={[
          'Daftar pengingat tanggal jatuh tempo tagihan berkala.',
          'Pencatatan pengeluaran otomatis saat tanggal tagihan tiba.',
          'Notifikasi pengingat H-3 sebelum jatuh tempo pembayaran via Telegram Bot.',
        ]}
        currentAlternative="Anda dapat mencatat pembayaran tagihan secara langsung dengan kategori 'Tagihan & Langganan' di halaman Transaksi atau meminta Dompi mencatatnya melalui Chat."
      />
    </AppLayout>
  )
}
