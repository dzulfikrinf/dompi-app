import { GoogleGenerativeAI } from '@google/generative-ai';

export type GeminiAction =
  | 'TAMBAH'
  | 'UBAH'
  | 'HAPUS'
  | 'UNDO'
  | 'RINGKASAN'
  | 'NGOBROL'
  | 'KLARIFIKASI'
  | 'TAMBAH_DOMPET'
  | 'UBAH_DOMPET'
  | 'HAPUS_DOMPET'
  | 'LIHAT_DOMPET';

export type GeminiTransactionData = {
  tanggal: string;
  kategori: string;
  nominal: number;
  tipe: 'Pengeluaran' | 'Pemasukan';
  dompet: string;
  deskripsi: string;
};

export type GeminiWalletData = {
  nama?: string;
  tipe?: string;
  saldo_awal?: number;
};

export type GeminiResponse = {
  action: GeminiAction;
  transaction_id: number | null;
  wallet_id: number | null;
  data: GeminiTransactionData | null;
  data_dompet: GeminiWalletData | null;
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
  walletDetails?: Array<{
    id: number;
    nama: string;
    tipe: string;
    saldo_awal: number;
    saldo_terkini?: number;
  }>;
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
    'TAMBAH_DOMPET',
    'UBAH_DOMPET',
    'HAPUS_DOMPET',
    'LIHAT_DOMPET',
  ];

  if (typeof obj.action !== 'string' || !validActions.includes(obj.action as GeminiAction)) {
    return { valid: false, error: `Action '${obj.action}' tidak valid.` };
  }

  const action = obj.action as GeminiAction;
  const transactionId =
    typeof obj.transaction_id === 'number' && !isNaN(obj.transaction_id)
      ? obj.transaction_id
      : null;

  const walletId =
    typeof obj.wallet_id === 'number' && !isNaN(obj.wallet_id)
      ? obj.wallet_id
      : null;

  // Validasi data untuk transaksi (TAMBAH & UBAH)
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

  // Validasi dompet: TAMBAH_DOMPET
  if (action === 'TAMBAH_DOMPET') {
    if (!obj.data_dompet || typeof obj.data_dompet !== 'object') {
      return { valid: false, error: `Field 'data_dompet' wajib diisi untuk action TAMBAH_DOMPET.` };
    }
    const dw = obj.data_dompet as Record<string, unknown>;
    if (!dw.nama || typeof dw.nama !== 'string' || !dw.nama.trim()) {
      return { valid: false, error: 'Nama dompet wajib diisi untuk TAMBAH_DOMPET.' };
    }
  }

  // Validasi dompet: UBAH_DOMPET & HAPUS_DOMPET
  if (action === 'UBAH_DOMPET' || action === 'HAPUS_DOMPET') {
    if (walletId === null || walletId <= 0) {
      return {
        valid: false,
        error: `wallet_id wajib berupa angka positif untuk action ${action}.`,
      };
    }
    if (action === 'UBAH_DOMPET') {
      if (!obj.data_dompet || typeof obj.data_dompet !== 'object') {
        return { valid: false, error: `Field 'data_dompet' wajib diisi untuk action UBAH_DOMPET.` };
      }
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
  const validDataDompet = obj.data_dompet as Record<string, unknown> | undefined;

  let parsedDataDompet: GeminiWalletData | null = null;
  if ((action === 'TAMBAH_DOMPET' || action === 'UBAH_DOMPET') && validDataDompet) {
    parsedDataDompet = {
      nama: validDataDompet.nama ? String(validDataDompet.nama).trim() : undefined,
      tipe: validDataDompet.tipe ? String(validDataDompet.tipe).trim() : (action === 'TAMBAH_DOMPET' ? 'Rekening Bank' : undefined),
      saldo_awal:
        validDataDompet.saldo_awal !== undefined && !isNaN(Number(validDataDompet.saldo_awal))
          ? Math.round(Number(validDataDompet.saldo_awal))
          : (action === 'TAMBAH_DOMPET' ? 0 : undefined),
    };
  }

  return {
    valid: true,
    output: {
      action,
      transaction_id: transactionId,
      wallet_id: walletId,
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
      data_dompet: parsedDataDompet,
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
    const availableWallets = context.walletDetails && context.walletDetails.length > 0
      ? context.walletDetails.map(w => `${w.nama} (ID: ${w.id}, Tipe: ${w.tipe}, Saldo Awal: ${w.saldo_awal}, Saldo Terkini: ${w.saldo_terkini ?? w.saldo_awal})`).join('\n')
      : (context.wallets && context.wallets.length > 0 ? context.wallets.join(', ') : 'BCA, GoPay, Tunai, OVO');

    const prompt = `
Kamu adalah "Dompi", asisten pintar pencatat keuangan pribadi berbahasa Indonesia.
Tugasmu adalah menganalisis pesan pengguna, menentukan maksudnya (termasuk pencatatan transaksi & manajemen dompet), dan menghasilkan JSON terstruktur.
Kamu TIDAK terhubung langsung ke database. Semua operasi database dijalankan oleh server berdasarkan JSON yang kamu hasilkan.

Tanggal hari ini: ${today}.

Daftar Dompet & Rekening Pengguna (ID, Nama, Tipe, Saldo):
${availableWallets}

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
   --- OPERASI TRANSAKSI ---
   - "TAMBAH": User ingin mencatat pengeluaran/pemasukan baru.
     * Tentukan tanggal (${today} jika tidak disebut), kategori, nominal (angka bulat positif), tipe ("Pengeluaran" atau "Pemasukan"), dompet (pilih yang paling cocok dari daftar dompet, default "Tunai"), deskripsi.
     * Buat "reply" konfirmasi ramah: "Sudah dicatat: Pengeluaran Rp35.000 untuk Makan siang dari BCA."
   - "UBAH": User ingin mengoreksi / memperbarui transaksi yang sudah ada.
     * Cari ID transaksi yang dimaksud di "Konteks Transaksi Aktif Pengguna".
     * Isi "transaction_id" dengan ID yang cocok.
     * Isi "data" dengan nilai baru yang diperbarui.
   - "HAPUS": User ingin menghapus transaksi yang sudah ada.
     * Cari ID transaksi yang dimaksud di "Konteks Transaksi Aktif Pengguna".
     * Isi "transaction_id" dengan ID transaksi tersebut. "data" harus null.
   - "UNDO": User ingin membatalkan penghapusan transaksi terakhir (misal: "batalkan penghapusan", "undo").
     * Gunakan ID dari "Konteks Transaksi Terakhir yang Dihapus".

   --- OPERASI DOMPET / REKENING ---
   - "TAMBAH_DOMPET": User ingin membuat dompet / rekening / pos simpanan baru.
     * Contoh: "tambah dompet Seabank saldo 500rb", "bikin dompet baru OVO", "tambah akun Bank Jago tipe Rekening Bank saldo 1.000.000".
     * Isi "data_dompet": { "nama": "string", "tipe": "string (misal: Rekening Bank, Dompet Digital, Reksa Dana / Investasi, Uang Fisik / Tunai, Lainnya)", "saldo_awal": number (default 0 jika tidak disebut) }.
     * "transaction_id": null, "wallet_id": null.
     * Buat "reply" konfirmasi: "Dompet [Nama] berhasil dibuat dengan saldo awal Rp[Nominal]."
   - "UBAH_DOMPET": User ingin mengubah data dompet (nama, tipe, atau saldo awal dompet).
     * Contoh: "update saldo awal BCA jadi 20jt", "ubah saldo dompet Tunai jadi 500.000", "ganti nama dompet Gopay jadi GoPay Tabungan".
     * Cari ID dompet yang cocok di Daftar Dompet Pengguna.
     * Isi "wallet_id" dengan ID dompet tersebut.
     * Isi "data_dompet" dengan field yang diubah (misal { "saldo_awal": 20000000 } atau { "nama": "GoPay Tabungan" }).
     * Buat "reply" konfirmasi perubahan yang jelas.
   - "HAPUS_DOMPET": User ingin menghapus dompet / rekening.
     * Contoh: "hapus dompet Bibit", "delete rekening Mandiri", "hapus dompet OVO".
     * Cari ID dompet yang cocok di Daftar Dompet Pengguna.
     * Isi "wallet_id" dengan ID dompet tersebut. "data_dompet": null.
     * Buat "reply" konfirmasi: "Dompet [Nama] telah dihapus."
   - "LIHAT_DOMPET": User menanyakan daftar dompet atau saldo rekening mereka.
     * Contoh: "cek dompet", "ada dompet apa aja?", "berapa saldo semua dompetku?", "lihat saldo rekening".
     * "wallet_id": null, "data_dompet": null.
     * Buat "reply" yang merinci daftar semua dompet pengguna beserta saldo terkini / saldo awalnya secara rapi dan enak dibaca.

   --- UMUM ---
   - "RINGKASAN": User bertanya mengenai ringkasan keuangan bulanan / mingguan.
   - "NGOBROL": Sapaan, basa-basi, atau pertanyaan umum.
   - "KLARIFIKASI": Jika input kurang jelas / ambigu tentang transaksi/dompet mana yang dimaksud. Ajukan pertanyaan singkat spesifik.

FORMAT OUTPUT:
Kamu WAJIB mengembalikan HANYA JSON murni tanpa markdown, tanpa backtick, dan tanpa teks di luar kurung kurawal:
{
  "action": "TAMBAH | UBAH | HAPUS | UNDO | RINGKASAN | NGOBROL | KLARIFIKASI | TAMBAH_DOMPET | UBAH_DOMPET | HAPUS_DOMPET | LIHAT_DOMPET",
  "transaction_id": number | null,
  "wallet_id": number | null,
  "data": {
    "tanggal": "YYYY-MM-DD",
    "kategori": "string",
    "nominal": number,
    "tipe": "Pengeluaran | Pemasukan",
    "dompet": "string",
    "deskripsi": "string"
  } | null,
  "data_dompet": {
    "nama": "string",
    "tipe": "string",
    "saldo_awal": number
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