import { requireAuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import DompetClient from './dompet-client'
import { getWallets, WalletRecord } from '@/lib/services/wallet-service'

export const dynamic = 'force-dynamic'

export default async function DompetPage() {
  const user = await requireAuthUser()
  const supabase = await createClient()

  // Ambil daftar dompet dan transaksi secara paralel
  const [
    walletsResult,
    { data: transactions },
  ] = await Promise.all([
    getWallets({ client: supabase, userId: user.id }),
    supabase
      .from('transactions')
      .select('tipe, dompet, nominal, deleted_at')
      .eq('user_id', user.id)
      .is('deleted_at', null),
  ])

  const wallets: WalletRecord[] = walletsResult.success && walletsResult.data ? walletsResult.data : []

  return (
    <DompetClient
      initialWallets={wallets}
      transactions={transactions || []}
      userEmail={user.email}
    />
  )
}
