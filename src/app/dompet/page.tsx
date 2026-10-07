import { requireAuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import DompetClient from './dompet-client'

export const dynamic = 'force-dynamic'

export default async function DompetPage() {
  const user = await requireAuthUser()
  const supabase = await createClient()

  // Ambil daftar dompet dan transaksi secara paralel
  const [
    { data: walletsData },
    { data: transactions },
  ] = await Promise.all([
    supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('transactions')
      .select('tipe, dompet, nominal')
      .eq('user_id', user.id)
      .is('deleted_at', null),
  ])

  const wallets = walletsData && walletsData.length > 0 ? walletsData : [
    { id: 1, nama: 'BCA Payroll', tipe: 'Rekening Utama', saldo_awal: 16420000 },
    { id: 2, nama: 'GoPay & OVO', tipe: 'Dompet Digital', saldo_awal: 1830000 },
    { id: 3, nama: 'Bibit Investasi', tipe: 'Reksa Dana', saldo_awal: 6000000 },
    { id: 4, nama: 'Tunai', tipe: 'Uang Fisik', saldo_awal: 600000 },
  ]

  return (
    <DompetClient
      wallets={wallets}
      transactions={transactions || []}
      userEmail={user.email}
    />
  )
}
