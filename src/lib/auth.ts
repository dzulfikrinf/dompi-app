import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthUser = {
  id: string
  email?: string
}

/**
 * Mendapatkan authenticated user secara efisien.
 * Mengutamakan header x-user-id dari proxy/middleware untuk menghindari
 * network round-trip ganda ke Supabase Auth API.
 * Menggunakan React cache() agar hanya dieksekusi maksimal 1 kali per request.
 */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const headersList = await headers()
    const userId = headersList.get('x-user-id')
    const userEmail = headersList.get('x-user-email')

    if (userId) {
      return { id: userId, email: userEmail || undefined }
    }
  } catch {
    // Fallback jika headers() tidak tersedia di context tertentu
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null
  return { id: user.id, email: user.email }
})

/**
 * Memastikan user sudah login. Jika belum, langsung redirect ke /login.
 */
export const requireAuthUser = async (): Promise<AuthUser> => {
  const user = await getAuthUser()
  if (!user) {
    redirect('/login')
  }
  return user
}
