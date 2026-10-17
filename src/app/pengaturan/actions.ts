'use server'

import { revalidatePath } from 'next/cache'
import { requireAuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import {
  getUserTelegramConnection,
  createTelegramPairingToken,
  disconnectTelegramAccount,
  TelegramConnectionInfo,
} from '@/lib/services/telegram-service'

export async function getTelegramStatusAction(): Promise<{
  success: boolean
  data?: TelegramConnectionInfo
  error?: string
}> {
  try {
    const user = await requireAuthUser()
    const supabase = await createClient()

    const info = await getUserTelegramConnection(user.id, supabase)
    return { success: true, data: info }
  } catch (err) {
    console.error('Error in getTelegramStatusAction:', err)
    return { success: false, error: 'Gagal memuat status koneksi Telegram.' }
  }
}

export async function generateTelegramPairingTokenAction(): Promise<{
  success: boolean
  token?: string
  botUrl?: string
  error?: string
}> {
  try {
    const user = await requireAuthUser()
    const supabase = await createClient()

    const res = await createTelegramPairingToken(user.id, supabase)
    revalidatePath('/pengaturan')
    return res
  } catch (err) {
    console.error('Error in generateTelegramPairingTokenAction:', err)
    return { success: false, error: 'Gagal membuat tautan penghubung Telegram.' }
  }
}

export async function disconnectTelegramAction(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const user = await requireAuthUser()
    const supabase = await createClient()

    const res = await disconnectTelegramAccount(user.id, supabase)
    revalidatePath('/pengaturan')
    return res
  } catch (err) {
    console.error('Error in disconnectTelegramAction:', err)
    return { success: false, error: 'Gagal memutuskan tautan Telegram.' }
  }
}
