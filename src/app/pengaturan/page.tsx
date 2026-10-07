import { requireAuthUser } from '@/lib/auth'
import PengaturanClient from './pengaturan-client'

export const dynamic = 'force-dynamic'

export default async function PengaturanPage() {
  const user = await requireAuthUser()

  return (
    <PengaturanClient
      userEmail={user.email}
      userId={user.id}
    />
  )
}
