import { GoogleGenerativeAI } from '@google/generative-ai';



export type GeminiAction =
  | 'TAMBAH'
  | 'UBAH'
  | 'HAPUS'
  | 'UNDO'
  | 'RINGKASAN'
  | 'NGOBROL'
  | 'KLARIFIKASI';

export type GeminiTransactionData = {
  tanggal: string;
  kategori: string;
  nominal: number;
  tipe: 'Pengeluaran' | 'Pemasukan';
  dompet: string;
  deskripsi: string;
};

export type GeminiResponse = {
  action: GeminiAction;
  transaction_id: number | null;
  data: GeminiTransactionData | null;
  reply: string;
  clarification_question: string | null;
};

export type GeminiContext = {
  activeTransactions: Array<{
    id: number;
    tanggal: string;
    kategori: string;
    nominal: number;
    tipe: 'Pengeluaran' | 'Pemasukan';
    dompet?: string;
    deskripsi: string;
  }>;
  latestDeletedTransaction?: {
    id: number;
    tanggal: string;
    kategori: string;
    nominal: number;
    tipe: 'Pengeluaran' | 'Pemasukan';
    dompet?: string;
    deskripsi: string;
    deleted_at?: string | null;
  } | null;
  wallets?: string[];
  summary?: {
    bulanIni: string;
    totalPengeluaran: number;
    totalPemasukan: number;
    jumlahTransaksi: number;
  };
};

/**
 * Validasi ketat terhadap output JSON dari Gemini sesuai spesifikasi
 */
export function validateGeminiOutput(raw: unknown): { valid: boolean; error?: string; output?: GeminiResponse } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Output Gemini bukan objek JSON yang valid.' };
  }

  const obj = raw as Record<string, unknown>;

  const validActions: GeminiAction[] = [
    'TAMBAH',
    'UBAH',
    'HAPUS',
    'UNDO',
    'RINGKASAN',
    'NGOBROL',
    'KLARIFIKASI',
  ];

  if (typeof obj.action !== 'string' || !validActions.includes(obj.action as GeminiAction)) {
    return { valid: false, error: `Action '${obj.action}' tidak valid.` };
  }

  const action = obj.action as GeminiAction;
  const transactionId =
    typeof obj.transaction_id === 'number' && !isNaN(obj.transaction_id)
      ? obj.transaction_id
      : null;

  // Validasi data untuk TAMBAH & UBAH
  if (action === 'TAMBAH' || action === 'UBAH') {
    if (!obj.data || typeof obj.data !== 'object') {
      return { valid: false, error: `Field 'data' wajib diisi untuk action ${action}.` };
    }

    const d = obj.data as Record<string, unknown>;

    // Nominal harus angka positif
    if (typeof d.nominal !== 'number' || isNaN(d.nominal) || d.nominal <= 0) {
      return { valid: false, error: 'Nominal transaksi harus berupa angka positif.' };
    }

    // Tanggal harus valid YYYY-MM-DD
    if (typeof d.tanggal !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.tanggal)) {
      return { valid: false, error: 'Format tanggal harus YYYY-MM-DD.' };
    }
    const parsedDate = new Date(d.tanggal);
    if (isNaN(parsedDate.getTime())) {
      return { valid: false, error: 'Nilai tanggal tidak valid.' };
    }

    // Tipe hanya Pengeluaran atau Pemasukan
    if (d.tipe !== 'Pengeluaran' && d.tipe !== 'Pemasukan') {
      return { valid: false, error: 'Tipe transaksi hanya boleh Pengeluaran atau Pemasukan.' };
    }

    if (!d.kategori || typeof d.kategori !== 'string' || !d.kategori.trim()) {
      return { valid: false, error: 'Kategori transaksi wajib diisi.' };
    }

    if (!d.dompet || typeof d.dompet !== 'string' || !d.dompet.trim()) {
      return { valid: false, error: 'Dompet / rekening wajib diisi.' };
    }

    if (!d.deskripsi || typeof d.deskripsi !== 'string' || !d.deskripsi.trim()) {
      return { valid: false, error: 'Deskripsi transaksi wajib diisi.' };
    }
  }

  // Validasi transaction_id untuk UBAH, HAPUS, UNDO
  if (action === 'UBAH' || action === 'HAPUS' || action === 'UNDO') {
    if (transactionId === null || transactionId <= 0) {
      return {
        valid: false,
        error: `transaction_id wajib berupa angka positif untuk action ${action}.`,
      };
    }
  }

  if (typeof obj.reply !== 'string' || !obj.reply.trim()) {
    return { valid: false, error: 'Field reply wajib berupa teks string.' };
  }

  const clarificationQuestion =
    typeof obj.clarification_question === 'string' && obj.clarification_question.trim().length > 0
      ? obj.clarification_question.trim()
      : null;

  const validDataRecord = obj.data as Record<string, unknown> | undefined;

  return {
    valid: true,
    output: {
      action,
      transaction_id: transactionId,
      data:
        (action === 'TAMBAH' || action === 'UBAH') && validDataRecord
          ? {
              tanggal: String(validDataRecord.tanggal),
              kategori: String(validDataRecord.kategori).trim(),
              nominal: Math.round(Number(validDataRecord.nominal)),
              tipe: validDataRecord.tipe as 'Pengeluaran' | 'Pemasukan',
              dompet: String(validDataRecord.dompet).trim(),
              deskripsi: String(validDataRecord.deskripsi).trim(),
            }
          : null,
      reply: obj.reply.trim(),
      clarification_question: clarificationQuestion,
    },
  };
}

/**
 * Memproses pesan bahasa Indonesia dari user menggunakan Gemini dan menghasilkan struktur terstandar
 */
export async function processNaturalLanguageChat(
  text: string,
  context: GeminiContext
): Promise<{ success: boolean; data?: GeminiResponse; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GEMINI_API_KEY belum dikonfigurasi di server.' };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash-lite',
      generationConfig: {
        temperature: 0.1,
      },
    });

    const today = new Date().toISOString().split('T')[0];
    const availableWallets = context.wallets && context.wallets.length > 0
      ? context.wallets.join(', ')
      : 'BCA, GoPay, Tunai, OVO';

    const prompt = `
Kamu adalah "Dompi", asisten pintar pencatat keuangan pribadi berbahasa Indonesia.
Tugasmu adalah menganalisis pesan pengguna, menentukan maksudnya, dan menghasilkan JSON terstruktur.
Kamu TIDAK terhubung langsung ke database. Semua operasi database dijalankan oleh server berdasarkan JSON yang kamu hasilkan.

Tanggal hari ini: ${today}.
Daftar dompet yang tersedia: ${availableWallets}.

Konteks Transaksi Aktif Pengguna (terbaru):
${JSON.stringify(context.activeTransactions, null, 2)}

Konteks Transaksi Terakhir yang Dihapus (untuk UNDO):
${context.latestDeletedTransaction ? JSON.stringify(context.latestDeletedTransaction, null, 2) : 'Tidak ada transaksi yang baru dihapus.'}

Ringkasan Keuangan Pengguna Bulan Ini:
${context.summary ? JSON.stringify(context.summary, null, 2) : 'Belum ada ringkasan.'}

Pesan Pengguna:
"${text}"

ATURAN UTAMA:
1. "action" HANYA boleh salah satu dari:
   - "TAMBAH": User ingin mencatat transaksi baru.
     * Langsung tentukan tanggal (default hari ini ${today} jika tidak disebut), kategori, nominal (angka bulat positif), tipe ("Pengeluaran" atau "Pemasukan"), dompet (default "Tunai" jika tidak disebut), deskripsi.
     * Buat "reply" yang mengonfirmasi bahwa transaksi dicatat, misalnya: "Sudah dicatat: Pengeluaran Rp35.000 untuk Makan siang dari BCA."
   - "UBAH": User ingin mengoreksi / memperbarui transaksi yang sudah ada.
     * Cari ID transaksi yang dimaksud di "Konteks Transaksi Aktif Pengguna".
     * Isi "transaction_id" dengan ID yang cocok.
     * Isi "data" dengan nilai baru yang diperbarui (pertahankan field yang tidak diubah).
     * Jika ada beberapa transaksi yang mirip dan kamu ragu mana yang dimaksud, JANGAN MENEBAK! Gunakan action "KLARIFIKASI".
   - "HAPUS": User ingin menghapus transaksi yang sudah ada.
     * Cari ID transaksi yang dimaksud di "Konteks Transaksi Aktif Pengguna".
     * Isi "transaction_id" dengan ID transaksi tersebut.
     * "data" harus null.
     * Buat "reply" yang menyatakan transaksi dihapus dan beri petunjuk cara membatalkan, contoh: "Transaksi makan siang Rp35.000 sudah dihapus. Ketik 'batalkan penghapusan terakhir' jika ingin mengembalikannya."
     * Jika target transaksi ambigu, gunakan action "KLARIFIKASI".
   - "UNDO": User ingin membatalkan penghapusan transaksi terakhir (misal: "batalkan penghapusan", "undo", "kembalikan transaksi tadi").
     * Gunakan ID dari "Konteks Transaksi Terakhir yang Dihapus". Jika tidak ada transaksi yang dihapus, buat reply ramah bahwa tidak ada transaksi yang bisa dipulihkan.
   - "RINGKASAN": User bertanya mengenai ringkasan, pengeluaran, pemasukan, atau saldo (misal: "Berapa pengeluaranku bulan ini?", "Total uang keluar minggu ini?").
     * Jawab pertanyaan tersebut berdasarkan data di Ringkasan Keuangan dan Transaksi Aktif.
     * "transaction_id" harus null, "data" harus null.
   - "NGOBROL": Sapaan, basa-basi, atau pertanyaan di luar manipulasi data (misal: "Halo Dompi", "Kamu siapa?").
     * Balas dengan ramah dan santai. "transaction_id" harus null, "data" harus null.
   - "KLARIFIKASI": Jika input pengguna kurang jelas atau ambigu tentang transaksi mana yang ingin diubah/dihapus.
     * Ajukan pertanyaan singkat dan spesifik pada "clarification_question" dan "reply".

FORMAT OUTPUT:
Kamu WAJIB mengembalikan HANYA JSON murni tanpa markdown, tanpa backtick, dan tanpa teks lain di luar kurung kurawal:
{
  "action": "TAMBAH | UBAH | HAPUS | UNDO | RINGKASAN | NGOBROL | KLARIFIKASI",
  "transaction_id": number | null,
  "data": {
    "tanggal": "YYYY-MM-DD",
    "kategori": "string",
    "nominal": number,
    "tipe": "Pengeluaran | Pemasukan",
    "dompet": "string",
    "deskripsi": "string"
  } | null,
  "reply": "string",
  "clarification_question": "string" | null
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResponse = response.text().trim();

    // Hilangkan wrapper markdown ```json ... ``` jika model menyertakannya
    if (textResponse.startsWith('```')) {
      textResponse = textResponse.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(textResponse);
    } catch {
      console.error('Failed to parse Gemini response as JSON:', textResponse);
      return {
        success: false,
        error: 'Format balasan asisten tidak dapat diproses (bukan JSON valid).',
      };
    }

    const validation = validateGeminiOutput(parsed);
    if (!validation.valid || !validation.output) {
      console.error('Gemini output validation error:', validation.error, parsed);
      return {
        success: false,
        error: validation.error || 'Struktur data balasan asisten tidak valid.',
      };
    }

    return { success: true, data: validation.output };
  } catch (err) {
    console.error('Error invoking Gemini model:', err);
    return {
      success: false,
      error: 'Terjadi gangguan saat menghubungkan ke asisten kecerdasan buatan.',
    };
  }
}

/**
 * Backward-compatible helper for legacy callers
 */
export async function processChat(
  text: string,
  recentTransactions: Array<{
    id: number;
    tanggal: string;
    kategori: string;
    nominal: number;
    tipe: 'Pengeluaran' | 'Pemasukan';
    dompet?: string;
    deskripsi: string;
  }> = []
) {
  const result = await processNaturalLanguageChat(text, {
    activeTransactions: recentTransactions,
  });

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error || 'Gagal memproses pesan dengan Gemini.');
}