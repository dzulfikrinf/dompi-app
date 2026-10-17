import { NextResponse } from 'next/server'
import {
  validateTelegramWebhookSecret,
  isDuplicateUpdate,
  sendTelegramMessage,
  createTelegramServerClient,
  pairTelegramAccount,
  resolveUserByTelegramChatId,
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
    const firstName = message.chat?.first_name || 'Teman'
    const username = message.chat?.username

    // 3. Deteksi duplikasi update_id (mencegah retry berulang dari Telegram)
    if (isDuplicateUpdate(update_id)) {
      return NextResponse.json({ ok: true, duplicate: true })
    }

    // Inisialisasi Supabase server client dengan hak service role
    const serverClient = createTelegramServerClient()

    // 4. Tangani perintah /start (Alur Tautan & Sambutan)
    if (text.startsWith('/start')) {
      const parts = text.split(/\s+/)
      const token = parts[1]?.trim()

      if (token) {
        // Proses penautan akun dengan token
        const pairRes = await pairTelegramAccount(
          token,
          chatId,
          { firstName, username },
          serverClient
        )

        if (pairRes.success) {
          const emailNotice = pairRes.userEmail ? ` (${pairRes.userEmail})` : ''
          const welcomeMessage = `Halo ${firstName}!

Akun Telegram kamu berhasil terhubung dengan akun Dompi${emailNotice}.

Mulai sekarang, kamu bisa mencatat pengeluaran atau pemasukan langsung dari sini! Coba ketik:
• Makan bakso 25rb Cash
• Beli bensin 50rb blu bca
• Pindah saldo 100rb dari blu bca ke Cash
• Analisis keuanganku bulan ini

Dompi siap membantumu mengelola keuangan dengan rapi.`

          await sendTelegramMessage(chatId, welcomeMessage)
          return NextResponse.json({ ok: true, paired: true })
        } else {
          await sendTelegramMessage(
            chatId,
            `${pairRes.error || 'Kode tautan tidak valid atau sudah kedaluwarsa. Silakan buat tautan baru di menu Pengaturan web Dompi.'}`
          )
          return NextResponse.json({ ok: true, pair_failed: true })
        }
      }

      // Pengguna mengetik /start tanpa token
      const existingUserId = await resolveUserByTelegramChatId(chatId, serverClient)
      if (existingUserId) {
        await sendTelegramMessage(
          chatId,
          `Halo ${firstName}!

Akun Telegram kamu sudah terhubung dengan Dompi. Silakan langsung ketik transaksi atau pertanyaanmu, misalnya:
• "Catat makan siang 30rb Cash"
• "Saldo rekeningku sisa berapa?"
• "Analisis pos boros bulan ini"`
        )
      } else {
        await sendTelegramMessage(
          chatId,
          `Halo ${firstName}! Selamat datang di Dompi.

Akun Telegram kamu belum terhubung dengan akun Dompi manapun.

Cara menghubungkan akun:
1. Buka aplikasi web Dompi
2. Buka menu Pengaturan
3. Klik tombol "Hubungkan ke Telegram"
4. Klik tautan yang muncul untuk mengaktifkan akunmu di sini.

Setelah terhubung, kamu bisa mencatat keuangan secepat mengetik chat.`
        )
      }
      return NextResponse.json({ ok: true })
    }

    // 5. Identifikasi pengguna pemilik chat_id
    const userId = await resolveUserByTelegramChatId(chatId, serverClient)

    if (!userId) {
      await sendTelegramMessage(
        chatId,
        `Halo ${firstName}! Akun Telegram kamu belum terhubung ke akun Dompi.

Silakan buka menu Pengaturan di aplikasi web Dompi, lalu klik "Hubungkan ke Telegram" agar bisa mencatat transaksi langsung dari sini.`
      )
      return NextResponse.json({ ok: true, unlinked: true })
    }

    // 6. Eksekusi pesan menggunakan Financial Agent AI untuk user_id tersebut
    const agentRes = await executeFinancialAgent(text, {
      client: serverClient,
      userId,
    })

    let botReply =
      agentRes.reply ||
      (agentRes.error
        ? `Kendala: ${agentRes.error}`
        : 'Maaf, Dompi belum dapat memproses pesan tersebut saat ini.')

    // Jika berhasil mencatat transaksi dan rincian transaksi belum dicantumkan di reply
    if (
      agentRes.actionType === 'RECORD_TRANSACTIONS' &&
      agentRes.affectedTransactions &&
      agentRes.affectedTransactions.length > 0
    ) {
      const alreadyHasDetails = agentRes.affectedTransactions.some((t) =>
        botReply.toLowerCase().includes(t.deskripsi.toLowerCase())
      )

      if (!alreadyHasDetails) {
        const details = agentRes.affectedTransactions
          .map((t) => {
            const prefix = t.tipe === 'Pengeluaran' ? '-' : '+'
            const dompet = t.dompet ? ` [${t.dompet}]` : ''
            return `• **${t.deskripsi}**: ${prefix}Rp${Number(t.nominal).toLocaleString('id-ID')}${dompet}`
          })
          .join('\n')

        botReply = `${botReply}\n\n**Rincian Catatan:**\n${details}`
      }
    }

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
