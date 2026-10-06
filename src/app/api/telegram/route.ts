import { NextResponse } from 'next/server'
import {
  validateTelegramWebhookSecret,
  validateTelegramChatId,
  isDuplicateUpdate,
  sendTelegramMessage,
  createTelegramServerClient,
  resolveOwnerUserId,
} from '@/lib/services/telegram-service'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  undoDeleteTransaction,
} from '@/lib/services/transaction-service'
import { processNaturalLanguageChat, GeminiContext } from '@/lib/gemini'

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

    // 6. Ambil konteks transaksi aktif milik pemilik
    const activeResult = await getTransactions({
      client: serverClient,
      userId: ownerUserId,
      limit: 15,
    })
    const activeTransactions = activeResult.success && activeResult.data ? activeResult.data : []

    // Ambil transaksi terakhir yang dihapus (untuk konteks UNDO)
    const { data: latestDeleted } = await serverClient
      .from('transactions')
      .select('*')
      .eq('user_id', ownerUserId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // Ambil daftar dompet milik pemilik
    const { data: walletsData } = await serverClient
      .from('wallets')
      .select('nama')
      .eq('user_id', ownerUserId)

    const walletNames = walletsData && walletsData.length > 0
      ? walletsData.map((w) => w.nama)
      : ['BCA', 'GoPay', 'Tunai', 'OVO']

    // Hitung ringkasan bulan ini milik pemilik
    const now = new Date()
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const thisMonthTransactions = activeTransactions.filter((t) =>
      t.tanggal.startsWith(currentMonthPrefix)
    )
    const totalPengeluaran = thisMonthTransactions
      .filter((t) => t.tipe === 'Pengeluaran')
      .reduce((sum, t) => sum + Number(t.nominal), 0)
    const totalPemasukan = thisMonthTransactions
      .filter((t) => t.tipe === 'Pemasukan')
      .reduce((sum, t) => sum + Number(t.nominal), 0)

    const context: GeminiContext = {
      activeTransactions: activeTransactions.map((t) => ({
        id: t.id,
        tanggal: t.tanggal,
        kategori: t.kategori,
        nominal: t.nominal,
        tipe: t.tipe,
        dompet: t.dompet,
        deskripsi: t.deskripsi,
      })),
      latestDeletedTransaction: latestDeleted
        ? {
            id: latestDeleted.id,
            tanggal: latestDeleted.tanggal,
            kategori: latestDeleted.kategori,
            nominal: latestDeleted.nominal,
            tipe: latestDeleted.tipe,
            dompet: latestDeleted.dompet,
            deskripsi: latestDeleted.deskripsi,
            deleted_at: latestDeleted.deleted_at,
          }
        : null,
      wallets: walletNames,
      summary: {
        bulanIni: currentMonthPrefix,
        totalPengeluaran,
        totalPemasukan,
        jumlahTransaksi: thisMonthTransactions.length,
      },
    }

    // 7. Proses pesan menggunakan Gemini NLU
    const geminiRes = await processNaturalLanguageChat(text, context)
    if (!geminiRes.success || !geminiRes.data) {
      await sendTelegramMessage(
        chatId,
        'Maaf, Dompi sedang mengalami kendala memproses pesan tersebut. Coba kirim kembali ya!'
      )
      return NextResponse.json({ ok: true })
    }

    const { action, transaction_id, data: trxData, reply, clarification_question } = geminiRes.data
    let botReply = reply

    // 8. Eksekusi database menggunakan reusable transaction service
    switch (action) {
      case 'TAMBAH': {
        if (!trxData) {
          botReply = 'Data transaksi belum lengkap untuk dicatat.'
          break
        }
        const createRes = await createTransaction(trxData, {
          client: serverClient,
          userId: ownerUserId,
        })
        if (!createRes.success || !createRes.data) {
          botReply = 'Gagal menyimpan transaksi ke database. Silakan coba lagi.'
        } else {
          botReply =
            reply ||
            `Sudah dicatat:\n${createRes.data.tipe} Rp${Number(createRes.data.nominal).toLocaleString('id-ID')} untuk ${createRes.data.deskripsi} dari ${createRes.data.dompet}.`
        }
        break
      }

      case 'UBAH': {
        if (!transaction_id || !trxData) {
          botReply = 'Target transaksi atau data perubahan tidak jelas.'
          break
        }
        const updateRes = await updateTransaction(transaction_id, trxData, {
          client: serverClient,
          userId: ownerUserId,
        })
        if (!updateRes.success || !updateRes.data) {
          botReply = 'Gagal memperbarui transaksi. Transaksi mungkin tidak ditemukan.'
        } else {
          botReply =
            reply ||
            `Transaksi "${updateRes.data.deskripsi}" berhasil diubah menjadi Rp${Number(updateRes.data.nominal).toLocaleString('id-ID')}.`
        }
        break
      }

      case 'HAPUS': {
        if (!transaction_id) {
          botReply = 'Target transaksi yang ingin dihapus tidak ditemukan.'
          break
        }
        const deleteRes = await deleteTransaction(transaction_id, {
          client: serverClient,
          userId: ownerUserId,
        })
        if (!deleteRes.success || !deleteRes.data) {
          botReply = 'Gagal menghapus transaksi. Transaksi tidak ditemukan atau sudah terhapus.'
        } else {
          botReply =
            reply ||
            `Transaksi ${deleteRes.data.deskripsi} Rp${Number(deleteRes.data.nominal).toLocaleString('id-ID')} sudah dihapus. Ketik 'batalkan penghapusan terakhir' jika ingin mengembalikannya.`
        }
        break
      }

      case 'UNDO': {
        const undoRes = await undoDeleteTransaction(transaction_id || undefined, {
          client: serverClient,
          userId: ownerUserId,
        })
        if (!undoRes.success || !undoRes.data) {
          botReply = 'Tidak ada riwayat transaksi yang dapat dipulihkan.'
        } else {
          botReply = `Transaksi "${undoRes.data.deskripsi}" Rp${Number(undoRes.data.nominal).toLocaleString('id-ID')} sudah dikembalikan.`
        }
        break
      }

      case 'KLARIFIKASI': {
        botReply = clarification_question || reply
        break
      }

      case 'RINGKASAN':
      case 'NGOBROL':
      default: {
        botReply = reply
        break
      }
    }

    // 9. Kirim balasan ke Telegram
    await sendTelegramMessage(chatId, botReply)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Unhandled error in telegram webhook:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ ok: true, error: 'Internal server error handled' }, { status: 200 })
  }
}