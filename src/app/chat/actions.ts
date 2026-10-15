'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { TransactionRecord } from '@/lib/services/transaction-service'
import { executeFinancialAgent } from '@/lib/services/agent-chat-service'
import { ChatHistoryItem } from '@/lib/gemini'

export type ChatActionResult = {
  success: boolean
  reply?: string
  error?: string
  actionType?: string
  affectedTransaction?: TransactionRecord
  affectedTransactions?: TransactionRecord[]
}

/**
 * Server action untuk mengirim pesan chat pengguna ke agent Dompi
 */
export async function sendChatMessageAction(
  message: string,
  history: ChatHistoryItem[] = []
): Promise<ChatActionResult> {
  try {
    const trimmed = message?.trim()
    if (!trimmed) {
      return {
        success: false,
        error: 'Pesan tidak boleh kosong.',
      }
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Sesi Anda telah kedaluwarsa. Silakan login kembali.',
      }
    }

    // Eksekusi percakapan melalui agent service
    const agentRes = await executeFinancialAgent(trimmed, {
      client: supabase,
      userId: user.id,
      history,
    })

    if (!agentRes.success) {
      return {
        success: false,
        error: agentRes.error || 'Gagal memproses pesan dengan asisten Dompi.',
      }
    }

    // Revalidasi cache halaman jika ada aksi perubahan data
    if (agentRes.actionType && agentRes.actionType !== 'CHAT') {
      revalidatePath('/transaksi')
      revalidatePath('/dompet')
      revalidatePath('/')
    }

    return {
      success: true,
      reply: agentRes.reply,
      actionType: agentRes.actionType,
      affectedTransactions: agentRes.affectedTransactions,
      affectedTransaction: agentRes.affectedTransactions?.[0],
    }
  } catch (err) {
    console.error('Unexpected error in sendChatMessageAction:', err)
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memproses pesan chat.',
    }
  }
}
