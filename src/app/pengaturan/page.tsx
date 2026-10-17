import { requireAuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getUserTelegramConnection } from '@/lib/services/telegram-service'
import PengaturanClient from './pengaturan-client'

export const dynamic = 'force-dynamic'

export default async function PengaturanPage() {
  const user = await requireAuthUser()
  const supabase = await createClient()

  const telegramInfo = await getUserTelegramConnection(user.id, supabase)

  return (
    <PengaturanClient
      userEmail={user.email}
      userId={user.id}
      initialTelegramInfo={telegramInfo}
    />
  )
}
