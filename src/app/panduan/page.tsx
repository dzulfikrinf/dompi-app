import { requireAuthUser } from '@/lib/auth'
import PanduanClient from './panduan-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Panduan & Cheat Sheet • Dompi',
  description: 'Contoh perintah dan tips penggunaan asisten keuangan Dompi',
}

export default async function PanduanPage() {
  const user = await requireAuthUser()

  return <PanduanClient userEmail={user.email} />
}
