import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PengaturanClient from './pengaturan-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PengaturanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <PengaturanClient
      userEmail={user.email}
      userId={user.id}
    />
  )
}
