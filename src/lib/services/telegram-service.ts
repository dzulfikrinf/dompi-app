import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Cache in-memory untuk update_id guna mencegah eksekusi duplikat saat Telegram melakukan retry
const processedUpdateIds = new Map<number, number>()
const DEDUPLICATION_TTL_MS = 5 * 60 * 1000 // 5 menit

let cachedOwnerUserId: string | null = null

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
 * 2. Validasi apakah chat_id pengirim cocok dengan pemilik (TELEGRAM_CHAT_ID)
 */
export function validateTelegramChatId(chatId: string | number | undefined | null): boolean {
  const expectedChatId = process.env.TELEGRAM_CHAT_ID

  if (!expectedChatId || chatId === undefined || chatId === null) {
    return false
  }

  return String(chatId).trim() === String(expectedChatId).trim()
}

/**
 * 3. Deteksi request duplikat jika Telegram mengirim retry untuk update_id yang sama
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
 * 4. Kirim pesan balasan ke Telegram menggunakan Bot API
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
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('Telegram API response error status:', res.status, errBody)
      return false
    }

    return true
  } catch (err) {
    console.error(
      'Network error when sending Telegram message:',
      err instanceof Error ? err.message : 'Unknown error'
    )
    return false
  }
}

/**
 * 5. Membuat Supabase client di server untuk operasi Telegram
 * Menggunakan SUPABASE_SERVICE_ROLE_KEY di server untuk mengakses data pemilik
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
 * 6. Mengambil user_id pemilik aplikasi secara aman di server
 */
export async function resolveOwnerUserId(supabase: SupabaseClient): Promise<string | null> {
  if (cachedOwnerUserId) {
    return cachedOwnerUserId
  }

  // 1. Coba dari auth.admin.listUsers jika service_role key aktif
  try {
    const { data: usersData, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 5,
    })

    if (!error && usersData?.users && usersData.users.length > 0) {
      const owner =
        usersData.users.find((u) => u.email === 'dzulfikrinfalah@gmail.com') ||
        usersData.users[0]

      if (owner?.id) {
        cachedOwnerUserId = owner.id
        return cachedOwnerUserId
      }
    }
  } catch {
    // Admin listUsers tidak tersedia (misal jika hanya anon key)
  }

  // 2. Fallback: Cari user_id dari data transaksi milik pemilik yang sudah ada
  try {
    const { data: sampleTrx } = await supabase
      .from('transactions')
      .select('user_id')
      .not('user_id', 'is', null)
      .limit(1)
      .maybeSingle()

    if (sampleTrx?.user_id) {
      cachedOwnerUserId = sampleTrx.user_id
      return cachedOwnerUserId
    }
  } catch {
    //
  }

  return null
}
