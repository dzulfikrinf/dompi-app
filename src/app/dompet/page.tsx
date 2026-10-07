import { requireAuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import DompetClient from './dompet-client'
import { WalletRecord } from '@/lib/services/wallet-service'

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
      .eq('user_id', user.id)
      .order('id', { ascending: true }),
    supabase
      .from('transactions')
      .select('tipe, dompet, nominal, deleted_at')
      .eq('user_id', user.id)
      .is('deleted_at', null),
  ])

  const wallets: WalletRecord[] = (walletsData || []).map((w) => ({
    id: Number(w.id),
    user_id: w.user_id,
    nama: w.nama,
    tipe: w.tipe,
    saldo_awal: Number(w.saldo_awal || 0),
  }))

  return (
    <DompetClient
      initialWallets={wallets}
      transactions={transactions || []}
      userEmail={user.email}
    />
  )
}
