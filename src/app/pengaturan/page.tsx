import { requireAuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getUserTelegramConnection } from '@/lib/services/telegram-service'
import PengaturanClient from './pengaturan-client'

export const dynamic = 'force-dynamic'

export default async function PengaturanPage() {
  const user = await requireAuthUser()
  const supabase = await createClient()

  const [telegramInfo, { data: authData }] = await Promise.all([
    getUserTelegramConnection(user.id, supabase),
    supabase.auth.getUser(),
  ])

  return (
    <PengaturanClient
      userEmail={user.email}
      userCreatedAt={authData?.user?.created_at}
      initialTelegramInfo={telegramInfo}
    />
  )
}
