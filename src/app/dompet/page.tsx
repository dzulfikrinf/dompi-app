import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DompetClient from './dompet-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DompetPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Ambil daftar dompet milik user
  const { data: walletsData } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)

  const wallets = walletsData || [
    { id: 1, nama: 'BCA Payroll', tipe: 'Rekening Utama', saldo_awal: 16420000 },
    { id: 2, nama: 'GoPay & OVO', tipe: 'Dompet Digital', saldo_awal: 1830000 },
    { id: 3, nama: 'Bibit Investasi', tipe: 'Reksa Dana', saldo_awal: 6000000 },
    { id: 4, nama: 'Tunai', tipe: 'Uang Fisik', saldo_awal: 600000 },
  ]

  // Ambil transaksi aktif untuk kalkulasi saldo terkini
  const { data: transactions } = await supabase
    .from('transactions')
    .select('tipe, dompet, nominal')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  return (
    <DompetClient
      wallets={wallets}
      transactions={transactions || []}
      userEmail={user.email}
    />
  )
}
