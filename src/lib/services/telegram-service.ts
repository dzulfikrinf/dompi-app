import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import { randomBytes } from 'crypto'

// Cache in-memory untuk update_id guna mencegah eksekusi duplikat saat Telegram melakukan retry
const processedUpdateIds = new Map<number, number>()
const DEDUPLICATION_TTL_MS = 5 * 60 * 1000 // 5 menit

export type TelegramConnectionInfo = {
  isConnected: boolean
  telegramChatId?: string | null
  telegramUsername?: string | null
  telegramFirstName?: string | null
  linkedAt?: string | null
  pairingToken?: string | null
  pairingTokenExpiresAt?: string | null
}

/**
 * 1. Validasi secret token webhook dari header X-Telegram-Bot-Api-Secret-Token
 */
export function validateTelegramWebhookSecret(req: Request): boolean {
  const secretHeader = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET

  if (!expectedSecret || !secretHeader) {
    return false
  }

  return secretHeader === expectedSecret
}

/**
 * 2. Deteksi request duplikat jika Telegram mengirim retry untuk update_id yang sama
 */
export function isDuplicateUpdate(updateId?: number): boolean {
  if (typeof updateId !== 'number') return false

  const now = Date.now()

  // Bersihkan entri yang sudah kadaluarsa lebih dari 5 menit
  for (const [id, timestamp] of processedUpdateIds.entries()) {
    if (now - timestamp > DEDUPLICATION_TTL_MS) {
      processedUpdateIds.delete(id)
    }
  }

  if (processedUpdateIds.has(updateId)) {
    return true
  }

  processedUpdateIds.set(updateId, now)
  return false
}

/**
 * Format teks markdown menjadi HTML yang kompatibel dan aman untuk Telegram Bot API.
 * Mengubah **teks tebal** menjadi <b>teks tebal</b>, list * / - menjadi •,
 * dan membersihkan sisa simbol bintang yang tidak berpasangan.
 */
export function formatTextForTelegram(text: string): string {
  if (!text) return ''

  // 1. Normalisasi baris baru dan trim
  let result = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()

  // 2. Escape karakter khusus HTML (&, <, >) terlebih dahulu
  result = result
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 3. Blok kode (```...```) -> <pre>...</pre>
  result = result.replace(/```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g, '<pre>$1</pre>')

  // 4. Inline code (`...`) -> <code>...</code>
  result = result.replace(/`([^`\n]+)`/g, '<code>$1</code>')

  // 5. Heading markdown (# Header, ## Header, ### Header) -> <b>Header</b>
  result = result.replace(/^(?:#{1,6})\s+(.+)$/gm, '<b>$1</b>')

  // 6. Bold + Italic (***teks*** atau ___teks___) -> <b><i>teks</i></b>
  result = result.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<b><i>$1</i></b>')
  result = result.replace(/___([\s\S]+?)___/g, '<b><i>$1</i></b>')

  // 7. Bold (**teks** atau __teks__) -> <b>teks</b>
  result = result.replace(/\*\*([\s\S]+?)\*\*/g, '<b>$1</b>')
  result = result.replace(/__([\s\S]+?)__/g, '<b>$1</b>')

  // 8. Bullet points di awal baris (* item, - item, + item) -> • item
  result = result.replace(/^[ \t]*[\*\-\+]\s+(.+)$/gm, '• $1')

  // 9. Italic (*teks* atau _teks_)
  result = result.replace(
    /(?<=^|[\s([{.,:;!?'"“‘\n])\*([^*\n\r]+?)\*(?=[\s)\]}.,:;!?'"”’\n]|$)/g,
    '<i>$1</i>'
  )
  result = result.replace(
    /(?<=^|[\s([{.,:;!?'"“‘\n])_([^_\n\r]+?)_(?=[\s)\]}.,:;!?'"”’\n]|$)/g,
    '<i>$1</i>'
  )

  // 10. Strikethrough (~~teks~~) -> <s>teks</s>
  result = result.replace(/~~(.+?)~~/g, '<s>$1</s>')

  // 11. Hapus sisa tanda bintang liar / yatim yang tidak tertutup rapi
  result = result.replace(/\*{1,}/g, '')

  // 12. Normalisasi spasi dan baris baru (maksimal 2 baris kosong berurutan)
  result = result.replace(/\n{3,}/g, '\n\n')

  return result.trim()
}

/**
 * Pembersih cadangan: menghapus semua format markdown menjadi teks polos bersih
 * tanpa ada tanda bintang atau simbol aneh jika Telegram menolak parsing HTML.
 */
export function stripMarkdownFormatting(text: string): string {
  if (!text) return ''
  return text
    .replace(/```(?:[a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .replace(/^(?:#{1,6})\s+(.+)$/gm, '$1')
    .replace(/\*\*([\s\S]+?)\*\*/g, '$1')
    .replace(/__([\s\S]+?)__/g, '$1')
    .replace(/^[ \t]*[\*\-\+]\s+(.+)$/gm, '• $1')
    .replace(/(?<=^|[\s([{.,:;!?'"“‘\n])\*([^*\n\r]+?)\*(?=[\s)\]}.,:;!?'"”’\n]|$)/g, '$1')
    .replace(/(?<=^|[\s([{.,:;!?'"“‘\n])_([^_\n\r]+?)_(?=[\s)\]}.,:;!?'"”’\n]|$)/g, '$1')
    .replace(/~~(.+?)~~/g, '$1')
    .replace(/\*{1,}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * 3. Kirim pesan balasan ke Telegram menggunakan Bot API
 * Pesan diformat secara otomatis dengan HTML parse_mode agar teks tebal,
 * bullet point, dan baris baru terbaca rapi tanpa karakter asterik (**).
 * Dilengkapi dengan fallback otomatis ke teks polos bersih jika parsing gagal.
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not configured.')
    return false
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`
  const formattedHtml = formatTextForTelegram(text)

  // 1. Percobaan pengiriman utama: menggunakan parse_mode HTML
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedHtml,
        parse_mode: 'HTML',
      }),
    })

    if (res.ok) {
      return true
    }

    const errBody = await res.text()
    console.warn('Telegram HTML parse rejected, attempting clean plain text fallback:', errBody)
  } catch (err) {
    console.warn(
      'Network error when sending HTML Telegram message, falling back:',
      err instanceof Error ? err.message : 'Unknown error'
    )
  }

  // 2. Fallback: kirim teks polos yang sudah dibersihkan dari simbol bintang
  try {
    const cleanPlain = stripMarkdownFormatting(text)
    const fallbackRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: cleanPlain,
      }),
    })

    if (!fallbackRes.ok) {
      const errBody = await fallbackRes.text()
      console.error('Telegram plain text fallback failed:', fallbackRes.status, errBody)
      return false
    }

    return true
  } catch (err) {
    console.error(
      'Network error on plain fallback Telegram message:',
      err instanceof Error ? err.message : 'Unknown error'
    )
    return false
  }
}

/**
 * 4. Mendapatkan username bot Telegram
 */
export function getTelegramBotUsername(): string {
  return process.env.TELEGRAM_BOT_USERNAME || 'dompi25_bot'
}

/**
 * 5. Membuat Supabase client di server untuk operasi Telegram (Service Role)
 */
export function createTelegramServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  return createClient(supabaseUrl, serviceRoleKey || anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * 6. Mengambil status koneksi Telegram milik user tertentu
 */
export async function getUserTelegramConnection(
  userId: string,
  client?: SupabaseClient
): Promise<TelegramConnectionInfo> {
  const supabase = client || (await createServerSupabaseClient())

  const { data, error } = await supabase
    .from('telegram_connections')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) {
    return { isConnected: false }
  }

  return {
    isConnected: !!data.telegram_chat_id,
    telegramChatId: data.telegram_chat_id,
    telegramUsername: data.telegram_username,
    telegramFirstName: data.telegram_first_name,
    linkedAt: data.linked_at,
    pairingToken: data.pairing_token,
    pairingTokenExpiresAt: data.pairing_token_expires_at,
  }
}

/**
 * 7. Membuat atau memperbarui token tautan (pairing token) untuk user di Web
 * Token berlaku selama 15 menit
 */
export async function createTelegramPairingToken(
  userId: string,
  client?: SupabaseClient
): Promise<{ success: boolean; token?: string; botUrl?: string; error?: string }> {
  try {
    const supabase = client || (await createServerSupabaseClient())
    const botUsername = getTelegramBotUsername()

    // Buat token acak 8 karakter hex
    const token = randomBytes(4).toString('hex').toLowerCase()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const { error } = await supabase.from('telegram_connections').upsert(
      {
        user_id: userId,
        pairing_token: token,
        pairing_token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      console.error('Error creating telegram pairing token:', error)
      return { success: false, error: 'Gagal membuat tautan penghubung Telegram.' }
    }

    const botUrl = `https://t.me/${botUsername}?start=${token}`
    return { success: true, token, botUrl }
  } catch (err) {
    console.error('Unexpected error in createTelegramPairingToken:', err)
    return { success: false, error: 'Terjadi kesalahan sistem saat membuat token.' }
  }
}

/**
 * 8. Memutuskan tautan akun Telegram
 */
export async function disconnectTelegramAccount(
  userId: string,
  client?: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = client || (await createServerSupabaseClient())

    const { error } = await supabase
      .from('telegram_connections')
      .update({
        telegram_chat_id: null,
        telegram_username: null,
        telegram_first_name: null,
        linked_at: null,
        pairing_token: null,
        pairing_token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error disconnecting telegram:', error)
      return { success: false, error: 'Gagal memutuskan tautan Telegram.' }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error in disconnectTelegramAccount:', err)
    return { success: false, error: 'Terjadi kesalahan sistem.' }
  }
}

/**
 * 9. Menghubungkan akun Telegram melalui token /start <token>
 */
export async function pairTelegramAccount(
  token: string,
  chatId: string | number,
  meta: { username?: string; firstName?: string },
  serverClient: SupabaseClient
): Promise<{ success: boolean; userId?: string; userEmail?: string; error?: string }> {
  try {
    const cleanToken = token.trim().toLowerCase()
    const nowIso = new Date().toISOString()

    // Cari koneksi dengan token yang valid dan belum expired
    const { data: record, error } = await serverClient
      .from('telegram_connections')
      .select('id, user_id, pairing_token_expires_at')
      .eq('pairing_token', cleanToken)
      .gt('pairing_token_expires_at', nowIso)
      .maybeSingle()

    if (error || !record) {
      return {
        success: false,
        error: 'Kode tautan tidak valid atau sudah kedaluwarsa. Silakan buat tautan baru di menu Pengaturan web Dompi.',
      }
    }

    // Lepaskan chat_id ini dari akun lain terlebih dahulu jika sebelumnya pernah terhubung
    await serverClient
      .from('telegram_connections')
      .update({
        telegram_chat_id: null,
        linked_at: null,
        updated_at: nowIso,
      })
      .eq('telegram_chat_id', String(chatId))

    // Hubungkan chat_id ke user_id yang memegang token ini
    const { error: updateErr } = await serverClient
      .from('telegram_connections')
      .update({
        telegram_chat_id: String(chatId),
        telegram_username: meta.username || null,
        telegram_first_name: meta.firstName || null,
        linked_at: new Date().toISOString(),
        pairing_token: null,
        pairing_token_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', record.id)

    if (updateErr) {
      console.error('Error updating telegram connection with paired chat_id:', updateErr)
      return { success: false, error: 'Gagal menghubungkan akun Telegram.' }
    }

    // Ambil info email user
    let userEmail: string | undefined
    try {
      const { data: userData } = await serverClient.auth.admin.getUserById(record.user_id)
      userEmail = userData?.user?.email
    } catch {
      //
    }

    return { success: true, userId: record.user_id, userEmail }
  } catch (err) {
    console.error('Unexpected error in pairTelegramAccount:', err)
    return { success: false, error: 'Terjadi kendala saat menghubungkan akun.' }
  }
}

/**
 * 10. Mengidentifikasi user_id berdasarkan telegram_chat_id
 */
export async function resolveUserByTelegramChatId(
  chatId: string | number,
  serverClient: SupabaseClient
): Promise<string | null> {
  try {
    const { data, error } = await serverClient
      .from('telegram_connections')
      .select('user_id')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return data.user_id
  } catch {
    return null
  }
}
