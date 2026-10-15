import { NextResponse } from 'next/server'
import {
  validateTelegramWebhookSecret,
  validateTelegramChatId,
  isDuplicateUpdate,
  sendTelegramMessage,
  createTelegramServerClient,
  resolveOwnerUserId,
} from '@/lib/services/telegram-service'
import { executeFinancialAgent } from '@/lib/services/agent-chat-service'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}

type TelegramWebhookPayload = {
  update_id?: number
  message?: {
    message_id?: number
    chat?: {
      id?: number | string
      first_name?: string
      username?: string
    }
    text?: string
  }
}

export async function POST(req: Request) {
  try {
    // 1. Validasi secret token webhook dari header
    if (!validateTelegramWebhookSecret(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse payload JSON secara aman
    let body: TelegramWebhookPayload | null = null
    try {
      body = (await req.json()) as TelegramWebhookPayload
    } catch {
      return NextResponse.json({ ok: true, ignored: true })
    }

    // Tangani payload tanpa message (misal callback_query, channel_post, my_chat_member, dll)
    if (!body || !body.message || !body.message.text) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const { update_id, message } = body
    const rawChatId = message.chat?.id
    const text = message.text?.trim()

    if (rawChatId === undefined || rawChatId === null || !text) {
      return NextResponse.json({ ok: true, ignored: true })
    }

    const chatId = rawChatId

    // 3. Validasi TELEGRAM_CHAT_ID pemilik
    if (!validateTelegramChatId(chatId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 4. Deteksi duplikasi update_id (mencegah retry berulang dari Telegram)
    if (isDuplicateUpdate(update_id)) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    // 5. Inisialisasi client server dan identifikasi user_id pemilik
    const serverClient = createTelegramServerClient()
    const ownerUserId = await resolveOwnerUserId(serverClient)

    if (!ownerUserId) {
      console.error('Owner user_id could not be resolved in Telegram webhook')
      await sendTelegramMessage(
        chatId,
        'Terjadi kendala konfigurasi akun pemilik. Silakan periksa database Anda.'
      )
      return NextResponse.json({ ok: true })
    }

    // 6. Eksekusi pesan menggunakan Financial Agent AI
    const agentRes = await executeFinancialAgent(text, {
      client: serverClient,
      userId: ownerUserId,
    })

    const botReply =
      agentRes.reply ||
      (agentRes.error
        ? `Kendala: ${agentRes.error}`
        : 'Maaf, Dompi belum dapat memproses pesan tersebut saat ini.')

    // 7. Kirim balasan ke Telegram
    await sendTelegramMessage(chatId, botReply)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(
      'Unhandled error in telegram webhook:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return NextResponse.json(
      { ok: true, error: 'Internal server error handled' },
      { status: 200 }
    )
  }
}
