import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Tool } from '@google/generative-ai';

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
  tambah_saldo?: number;
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
    selisihBulanIni?: number;
    totalSaldoTerkini?: number;
    jumlahTransaksi: number;
    rincianDompet?: Array<{
      nama: string;
      tipe?: string;
      saldo: number;
    }>;
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
      tambah_saldo:
        validDataDompet.tambah_saldo !== undefined && !isNaN(Number(validDataDompet.tambah_saldo))
          ? Math.round(Number(validDataDompet.tambah_saldo))
          : undefined,
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

Ringkasan Keuangan Pengguna Bulan Ini (Arus Kas & Total Saldo):
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

   - "UBAH_DOMPET": User ingin mengubah data dompet (menambah saldo, mengganti saldo, ganti nama, atau ganti tipe).
     * PERHATIAN UTAMA (MENAMBAH SALDO DOMPET):
       Jika user memberi perintah untuk MENAMBAH saldo dompet (misal: "tambah saldo dompet BCA 50rb", "tambah saldo Tunai 100.000", "tambahkan saldo dompet OVO 25rb", "isi saldo dompet BCA 50rb"):
       - User bermaksud MENAMBAHKAN nominal tersebut ke saldo yang sudah ada, BUKAN mengganti saldonya!
       - JANGAN isi field "saldo_awal" dengan angka penambahan itu! (Karena mengisi saldo_awal akan mengganti/menimpa saldo dompet).
       - WAJIB gunakan field "tambah_saldo": [nominal penambahan] di dalam "data_dompet".
       - Cari ID dompet yang cocok di Daftar Dompet Pengguna, isi "wallet_id" dengan ID tersebut.
       - Hitung estimasi saldo baru (saldo sekarang + nominal penambahan).
       - Buat "reply": "Saldo dompet [Nama] berhasil ditambah sebesar Rp[Nominal Ditambah]! Saldo sekarang menjadi Rp[Saldo Baru]."
     * MENGATUR ULANG / MENIMPA / MENGGANTI SALDO:
       Jika user secara eksplisit ingin MENGGANTI / MENIMPA / SET saldo menjadi nominal tertentu (misal: "ubah saldo BCA jadi 20jt", "ganti saldo dompet Tunai jadi 500.000", "set saldo Gopay 100rb"):
       - Gunakan field "saldo_awal": [nominal baru yang dituju].
       - Isi "wallet_id" dengan ID dompet yang cocok.
       - Buat "reply": "Saldo dompet [Nama] berhasil diubah menjadi Rp[Nominal Baru]."
     * MENGURANGI SALDO DOMPET:
       Jika user ingin mengurangi saldo dompet (misal: "kurangi saldo dompet BCA 20rb"):
       - Gunakan field "tambah_saldo": -[nominal pengurangan] (angka negatif).
       - Buat "reply": "Saldo dompet [Nama] berhasil dikurangi sebesar Rp[Nominal Pengurangan]."
     * MENGUBAH NAMA / TIPE DOMPET:
       Jika user ingin ganti nama atau tipe (misal: "ganti nama dompet Gopay jadi GoPay Tabungan"):
       - Isi "wallet_id" dengan ID dompet yang cocok.
       - Gunakan field "nama" atau "tipe".

   - "HAPUS_DOMPET": User ingin menghapus dompet / rekening.
     * Contoh: "hapus dompet Bibit", "delete rekening Mandiri", "hapus dompet OVO".
     * Cari ID dompet yang cocok di Daftar Dompet Pengguna.
     * Isi "wallet_id" dengan ID dompet tersebut. "data_dompet": null.
     * Buat "reply" konfirmasi: "Dompet [Nama] telah dihapus."

   - "LIHAT_DOMPET": User menanyakan daftar dompet atau saldo rekening mereka.
     * Contoh: "cek dompet", "ada dompet apa aja?", "berapa saldo semua dompetku?", "lihat saldo rekening", "cek saldo".
     * "wallet_id": null, "data_dompet": null.
     * Buat "reply" yang merinci daftar semua dompet pengguna beserta saldo terkini / saldo awalnya secara rapi dan sebutkan Total Saldo keseluruhan.

   --- UMUM ---
   - "RINGKASAN": User bertanya mengenai ringkasan atau rekap keuangan (misal: "rekap keuangan", "ringkasan keuangan", "laporan keuangan", "rekap bulan ini", "rekap", "bagaimana keuanganku?").
     * PENTING SEKALI: Balasan rekap keuangan JANGAN CUMA menyebutkan pemasukan dan pengeluaran! Kamu WAJIB menyertakan Total Saldo dan Rincian Saldo Dompet!
     * Struktur balasan WAJIB memuat:
       1. Periode (Bulan ini).
       2. Total Pemasukan bulan ini (Rp...).
       3. Total Pengeluaran bulan ini (Rp...).
       4. Selisih / Arus Kas Bersih bulan ini (Surplus / Defisit Rp...).
       5. TOTAL SALDO SAAT INI (Rp... gabungan seluruh dompet/rekening pengguna).
       6. Rincian Saldo masing-masing dompet/rekening (sebutkan nama dompet dan saldo terkininya, misal BCA: Rp..., GoPay: Rp..., Tunai: Rp...).
     * Susun balasan dengan format yang rapi, ramah, dan terstruktur menggunakan bullet points serta emoji agar nyaman dibaca.

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
    "saldo_awal": number,
    "tambah_saldo": number
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

// ==========================================
// AGENTIC FUNCTION CALLING IMPLEMENTATION
// ==========================================

export type ChatHistoryItem = {
  role: 'user' | 'assistant' | 'model';
  text: string;
};

export type AgentToolCall = {
  name: string;
  args: Record<string, unknown>;
};

export type ToolExecutionHandler = (
  toolCall: AgentToolCall
) => Promise<{
  result: Record<string, unknown>;
  actionType?: string;
  affectedTransactions?: unknown[];
  fallbackReply?: string;
}>;

export type AgentChatResult = {
  success: boolean;
  reply?: string;
  toolCall?: AgentToolCall;
  error?: string;
  actionType?: string;
  affectedTransactions?: unknown[];
};

const AGENT_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'record_transactions',
        description:
          'Catat satu atau banyak transaksi keuangan (pengeluaran atau pemasukan) sekaligus ke database. Panggil fungsi ini jika pengguna ingin mencatat transaksi harian baik dalam bahasa santai/slang, formal, maupun multi-item dalam satu kalimat.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            reply: {
              type: SchemaType.STRING,
              description: 'Balasan konfirmasi opsional.',
            },
            items: {
              type: SchemaType.ARRAY,
              description: 'Daftar transaksi yang akan dicatat.',
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  tanggal: {
                    type: SchemaType.STRING,
                    description: 'Format YYYY-MM-DD. Gunakan tanggal hari ini jika pengguna tidak menyebut tanggal khusus.',
                  },
                  kategori: {
                    type: SchemaType.STRING,
                    description:
                      'Kategori transaksi (contoh: Makanan & Minuman, Transportasi, Belanja, Tagihan, Hiburan, Kesehatan, Gaji, Investasi, Lainnya).',
                  },
                  nominal: {
                    type: SchemaType.NUMBER,
                    description: 'Nominal transaksi dalam rupiah (angka bulat positif lebih dari 0).',
                  },
                  tipe: {
                    type: SchemaType.STRING,
                    enum: ['Pengeluaran', 'Pemasukan'],
                    description: 'Tipe transaksi: Pengeluaran atau Pemasukan.',
                  },
                  dompet: {
                    type: SchemaType.STRING,
                    description:
                      'Nama dompet/rekening sumber atau tujuan (sesuaikan dengan daftar dompet pengguna yang ada).',
                  },
                  deskripsi: {
                    type: SchemaType.STRING,
                    description: 'Keterangan detail transaksi (contoh: Makan siang nasi padang, Beli bensin Pertamax).',
                  },
                },
                required: ['tanggal', 'kategori', 'nominal', 'tipe', 'dompet', 'deskripsi'],
              },
            },
          },
          required: ['items'],
        },
      },
      {
        name: 'query_transactions',
        description:
          'Cari atau filter riwayat transaksi pengguna berdasarkan kata kunci pada deskripsi/kategori, rentang tanggal, dompet, atau tipe transaksi. Panggil jika pengguna menanyakan transaksi lampau, memeriksa apakah pernah membeli sesuatu, atau melihat daftar pengeluaran tertentu.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: {
              type: SchemaType.STRING,
              description: 'Kata kunci pencarian (contoh: bensin, indomaret, kopi, obat, shopee).',
            },
            kategori: {
              type: SchemaType.STRING,
              description: 'Filter kategori transaksi spesifik (opsional).',
            },
            dompet: {
              type: SchemaType.STRING,
              description: 'Filter nama dompet/rekening (opsional).',
            },
            tipe: {
              type: SchemaType.STRING,
              enum: ['Pengeluaran', 'Pemasukan'],
              description: 'Filter tipe transaksi (opsional).',
            },
            startDate: {
              type: SchemaType.STRING,
              description: 'Tanggal awal pencarian format YYYY-MM-DD (opsional).',
            },
            endDate: {
              type: SchemaType.STRING,
              description: 'Tanggal akhir pencarian format YYYY-MM-DD (opsional).',
            },
            limit: {
              type: SchemaType.NUMBER,
              description: 'Batas jumlah transaksi (default 10, maksimal 30).',
            },
          },
        },
      },
      {
        name: 'transfer_wallet_balance',
        description:
          'Memindahkan saldo atau mutasi transfer dana dari satu dompet/rekening ke dompet/rekening lain (contoh: transfer antar bank, tarik tunai ATM, top up dompet digital).',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            fromWallet: {
              type: SchemaType.STRING,
              description: 'Nama dompet asal pengirim dana.',
            },
            toWallet: {
              type: SchemaType.STRING,
              description: 'Nama dompet tujuan penerima dana.',
            },
            nominal: {
              type: SchemaType.NUMBER,
              description: 'Nominal dana yang dipindahkan (angka bulat positif).',
            },
            biayaAdmin: {
              type: SchemaType.NUMBER,
              description: 'Biaya admin/transfer jika ada (angka bulat positif, default 0).',
            },
            catatan: {
              type: SchemaType.STRING,
              description: 'Keterangan/tujuan transfer (opsional, contoh: top up ShopeePay, tarik tunai).',
            },
            tanggal: {
              type: SchemaType.STRING,
              description: 'Format YYYY-MM-DD (opsional, default hari ini).',
            },
            reply: {
              type: SchemaType.STRING,
              description: 'Balasan konfirmasi opsional.',
            },
          },
          required: ['fromWallet', 'toWallet', 'nominal'],
        },
      },
      {
        name: 'adjust_wallet_balance',
        description:
          'Menyesuaikan atau merekonsiliasi saldo dompet agar cocok dengan saldo riil/fisik nyata pengguna (contoh: user berkata "saldo cash asliku sisa 45.000 tolong sesuaikan").',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            walletName: {
              type: SchemaType.STRING,
              description: 'Nama dompet yang akan disesuaikan saldonya.',
            },
            nominalTarget: {
              type: SchemaType.NUMBER,
              description: 'Nominal saldo riil/nyata yang baru (angka bulat positif atau nol).',
            },
            catatan: {
              type: SchemaType.STRING,
              description: 'Catatan alasan penyesuaian (opsional).',
            },
            tanggal: {
              type: SchemaType.STRING,
              description: 'Format YYYY-MM-DD (opsional, default hari ini).',
            },
            reply: {
              type: SchemaType.STRING,
              description: 'Balasan konfirmasi opsional.',
            },
          },
          required: ['walletName', 'nominalTarget'],
        },
      },
      {
        name: 'manage_wallet',
        description:
          'Mengelola dompet: membuat dompet baru, mengubah nama/tipe dompet, atau menghapus dompet.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            action: {
              type: SchemaType.STRING,
              enum: ['CREATE', 'UPDATE', 'DELETE'],
              description: 'Tindakan yang akan dilakukan terhadap dompet.',
            },
            walletName: {
              type: SchemaType.STRING,
              description: 'Nama dompet saat ini atau nama dompet baru yang akan dibuat.',
            },
            walletId: {
              type: SchemaType.NUMBER,
              description: 'ID dompet jika diketahui dari konteks.',
            },
            newName: {
              type: SchemaType.STRING,
              description: 'Nama baru jika ingin mengganti nama dompet.',
            },
            tipe: {
              type: SchemaType.STRING,
              description:
                'Tipe dompet (contoh: Rekening Bank, Dompet Digital, Reksa Dana / Investasi, Uang Fisik / Tunai, Kartu Kredit, Lainnya).',
            },
            saldoAwal: {
              type: SchemaType.NUMBER,
              description: 'Saldo awal untuk dompet baru (default 0).',
            },
            reply: {
              type: SchemaType.STRING,
              description: 'Balasan konfirmasi opsional.',
            },
          },
          required: ['action', 'walletName'],
        },
      },
      {
        name: 'get_financial_analysis',
        description:
          'Mengambil data analisis mendalam keuangan pengguna (arus kas, pos pengeluaran terboros/Pareto, rasio tabungan, rata-rata harian, perbandingan dengan bulan lalu). Panggil fungsi ini jika pengguna meminta analisis, evaluasi pengeluaran, bertanya pos mana yang boros, atau mengecek kesehatan finansial.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            period: {
              type: SchemaType.STRING,
              enum: ['this_month', 'last_month', 'last_7_days', 'last_30_days', 'all'],
              description: 'Periode waktu analisis yang diinginkan (default this_month).',
            },
            focus: {
              type: SchemaType.STRING,
              description: 'Fokus pertanyaan pengguna (misal: pos boros, perbandingan bulan lalu, tren pengeluaran, rasio tabungan).',
            },
            reply: {
              type: SchemaType.STRING,
              description: 'Balasan konfirmasi opsional.',
            },
          },
          required: ['period'],
        },
      },
      {
        name: 'update_or_delete_transaction',
        description:
          'Mengoreksi atau menghapus transaksi yang sudah ada di database (contoh: "eh nominal tadi bukan 50rb tapi 35rb", "hapus transaksi makan siang tadi", "batalkan penghapusan terakhir").',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            action: {
              type: SchemaType.STRING,
              enum: ['UPDATE', 'DELETE', 'UNDO'],
              description: 'Tindakan: UPDATE (ubah), DELETE (hapus), atau UNDO (pulihkan transaksi terakhir).',
            },
            transactionId: {
              type: SchemaType.NUMBER,
              description: 'ID transaksi target (cari dari Konteks Transaksi Pengguna). Untuk UNDO, ID transaksi terakhir yang dihapus.',
            },
            newData: {
              type: SchemaType.OBJECT,
              description: 'Data baru untuk UPDATE transaksi.',
              properties: {
                tanggal: { type: SchemaType.STRING },
                kategori: { type: SchemaType.STRING },
                nominal: { type: SchemaType.NUMBER },
                tipe: { type: SchemaType.STRING, enum: ['Pengeluaran', 'Pemasukan'] },
                dompet: { type: SchemaType.STRING },
                deskripsi: { type: SchemaType.STRING },
              },
            },
            reply: {
              type: SchemaType.STRING,
              description: 'Balasan konfirmasi opsional.',
            },
          },
          required: ['action'],
        },
      },
    ],
  },
];

/**
 * Memproses chat percakapan natural pengguna dengan Gemini Function Calling & ReAct Loop
 */
export async function processAgentChat(
  text: string,
  context: GeminiContext,
  history: ChatHistoryItem[] = [],
  toolHandler?: ToolExecutionHandler
): Promise<AgentChatResult> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'GEMINI_API_KEY belum dikonfigurasi di server.' };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const nowWIB = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const today = nowWIB.toISOString().split('T')[0];

    const availableWallets =
      context.walletDetails && context.walletDetails.length > 0
        ? context.walletDetails
            .map(
              (w) =>
                `• ${w.nama} (ID: ${w.id}, Tipe: ${w.tipe}, Saldo Awal: Rp${Number(w.saldo_awal).toLocaleString('id-ID')}, Saldo Terkini: Rp${Number(w.saldo_terkini ?? w.saldo_awal).toLocaleString('id-ID')})`
            )
            .join('\n')
        : (context.wallets && context.wallets.length > 0 ? context.wallets.join(', ') : 'Cash');

    const recentTrxSummary = (context.activeTransactions || [])
      .slice(0, 15)
      .map(
        (t) =>
          `ID ${t.id} [${t.tanggal}] ${t.tipe} Rp${Number(t.nominal).toLocaleString('id-ID')} | ${t.kategori} | ${t.dompet || 'Cash'} | "${t.deskripsi}"`
      )
      .join('\n');

    const systemInstruction = `
Kamu adalah "Dompi", asisten finansial pribadi cerdas, ramah, dan solutif berbahasa Indonesia.
Kamu bisa diajak berdiskusi tentang apa saja: ngobrol santai, konsultasi perencanaan keuangan, budgeting (50-30-20, amplop belanja), evaluasi pengeluaran, edukasi investasi pemula, maupun analisis arus kas.
Gaya bicaramu santai, hangat, dan komunikatif selayaknya sahabat diskusi yang paham keuangan ("aku" / "kamu").

Tanggal hari ini: ${today} (WIB).

Daftar Dompet / Rekening Pengguna Saat Ini (Data Saldo Terkini Akurat):
${availableWallets}

Transaksi Aktif Terakhir Pengguna (15 transaksi terbaru):
${recentTrxSummary || 'Belum ada transaksi.'}

Transaksi Terakhir yang Dihapus (Konteks UNDO):
${context.latestDeletedTransaction ? `ID ${context.latestDeletedTransaction.id}: ${context.latestDeletedTransaction.deskripsi} Rp${Number(context.latestDeletedTransaction.nominal).toLocaleString('id-ID')}` : 'Tidak ada transaksi yang baru dihapus.'}

Ringkasan Finansial Bulan Ini (${context.summary?.bulanIni || 'Bulan Ini'}):
${
  context.summary
    ? `- Total Pemasukan: Rp${Number(context.summary.totalPemasukan).toLocaleString('id-ID')}
- Total Pengeluaran: Rp${Number(context.summary.totalPengeluaran).toLocaleString('id-ID')}
- Surplus / Defisit Bulan Ini: Rp${Number(context.summary.selisihBulanIni).toLocaleString('id-ID')}
- Total Seluruh Saldo Terkini: Rp${Number(context.summary.totalSaldoTerkini || 0).toLocaleString('id-ID')}
- Jumlah Transaksi Bulan Ini: ${context.summary.jumlahTransaksi || 0} transaksi`
    : 'Belum ada ringkasan.'
}

KEMAMPUAN MEMAHAMI INPUT FLEKSIBEL & SLANG (NATURAL LANGUAGE UNDERSTANDING):
- Pengguna tidak wajib memakai format tertentu. Input bisa berupa curhat, pesan santai, singkatan slang, atau daftar belanja panjang.
- Pemahaman Nominal Otomatis:
  • "25k", "25rb" -> 25000
  • "1.5jt", "1,5 juta" -> 1500000
  • "ceban" -> 10000, "gocap" -> 50000, "seceng" -> 1000, "pekgo" -> 150000
  • "500 perak" -> 500
- Multi-Transaksi dalam Satu Kalimat:
  • Jika pengguna menyebut beberapa transaksi sekaligus (misal: "tadi beli bensin 30k qris bca trus mampir beli cilok 10k cash"), catat semua ke dalam array 'items' di tool record_transactions.
- Estimasi Tanggal Relatif:
  • "kemarin", "tadi pagi", "lusa", dsb, sesuaikan dengan tanggal referensi hari ini (${today}).
- Nama Dompet:
  • Cocokkan dengan Daftar Dompet Pengguna secara fleksibel (misal "bca" -> dompet dengan nama yang mengandung bca).
  • Jika pengguna tidak menyebut dompet, gunakan dompet default yang paling wajar (utamakan Cash atau rekening pertama).
- Kategori Otomatis:
  • Tentukan kategori yang logis secara mandiri jika tidak disebutkan eksplisit (makan/kopi -> Makanan & Minuman, bensin/parkir -> Transportasi, token/wifi -> Tagihan, gaji/bonus -> Gaji, dst).

ATURAN PENGGUNAAN TOOL & RESPON NATURAL:
1. PENCATATAN TRANSAKSI (record_transactions):
   - Panggil jika ada pemasukan atau pengeluaran baru yang ingin dicatat.
   - Setelah tool selesai dijalankan, sampaikan konfirmasi pencatatan dengan hangat, jelas, dan sebutkan rinciannya secara ringkas.
2. PENCARIAN TRANSAKSI (query_transactions):
   - Panggil jika pengguna menanyakan transaksi spesifik lampau atau memeriksa riwayat pembelian tertentu.
   - Setelah data ditemukan, rangkumkan hasilnya untuk pengguna secara komunikatif.
3. TRANSFER DANA (transfer_wallet_balance):
   - Panggil jika pengguna memindahkan saldo antar dompet/rekening.
4. KOREKSI SALDO RIIL (adjust_wallet_balance):
   - Panggil jika pengguna ingin mencocokkan saldo aplikasi dengan saldo fisik/asli nyata.
5. KELOLA DOMPET (manage_wallet):
   - Panggil jika ingin membuat, mengubah nama, atau menghapus dompet.
6. UPDATE / DELETE / UNDO TRANSAKSI (update_or_delete_transaction):
   - Panggil jika pengguna mengoreksi transaksi lampau atau memulihkan transaksi yang terhapus.
7. ANALISIS KEUANGAN (get_financial_analysis):
   - Panggil jika pengguna meminta evaluasi pos boros, arus kas, tren pengeluaran, atau kesehatan keuangan.
8. PERCAKAPAN UMUM / MULTI-INTENT:
   - Jika pengguna hanya mengobrol, menyapa, bertanya rumus finansial, atau berdiskusi edukasi, JANGAN panggil tool apapun. Balaslah langsung dengan ramah dan bernas.
   - Jika pengguna mencatat transaksi SEKALIGUS bertanya hal lain (misal: "catat kopi 20k cash, sekalian mau tanya tips budgeting dong"), panggil tool record_transactions terlebih dahulu. Ketika hasil tool diterima, berikan konfirmasi pencatatan DAN jawab pertanyaan pengguna secara lengkap dalam satu balasan yang padu!

PANDUAN FORMAT TAMPILAN:
- Buat teks balasan bersih, rapi, dan mudah dibaca (gunakan baris baru jika berganti topik).
- Gunakan bullet point (•) untuk daftar/rincian.
- Berikan penekanan tebal (**kata**) secukupnya pada angka atau kata kunci penting, hindari simbol bintang yang berlebihan.
`;

    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-flash-latest',
      'gemini-flash-lite-latest',
    ];

    // Susun riwayat percakapan untuk chat context
    // Ambil maksimal 10 pesan terakhir agar konteks tetap segar
    const recentHistory = (history || []).slice(-10).map((h) => ({
      role: h.role === 'assistant' || h.role === 'model' ? ('model' as const) : ('user' as const),
      parts: [{ text: h.text }],
    }));

    let lastError: unknown = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          tools: AGENT_TOOLS as unknown as Tool[],
          systemInstruction,
          generationConfig: {
            temperature: 0.5,
          },
        });

        // Buat chat session dengan history
        const chat = model.startChat({
          history: recentHistory,
        });

        let result = await chat.sendMessage(text);
        let response = await result.response;
        let calls = response.functionCalls();

        let lastActionType: string | undefined;
        let lastAffectedTrx: unknown[] | undefined;
        let fallbackReply: string | undefined;
        let turn = 0;
        const maxTurns = 3;

        while (calls && calls.length > 0 && turn < maxTurns) {
          turn++;
          const call = calls[0];
          const callArgs = (call.args || {}) as Record<string, unknown>;
          const currentToolCall: AgentToolCall = {
            name: call.name,
            args: callArgs,
          };

          if (!toolHandler) {
            return {
              success: true,
              toolCall: currentToolCall,
              reply: typeof callArgs.reply === 'string' ? callArgs.reply : undefined,
            };
          }

          const execOutcome = await toolHandler(currentToolCall);
          if (execOutcome.actionType) lastActionType = execOutcome.actionType;
          if (execOutcome.affectedTransactions) lastAffectedTrx = execOutcome.affectedTransactions;
          if (execOutcome.fallbackReply) fallbackReply = execOutcome.fallbackReply;

          try {
            result = await chat.sendMessage([
              {
                functionResponse: {
                  name: call.name,
                  response: execOutcome.result,
                },
              },
            ]);
            response = await result.response;
            calls = response.functionCalls();
          } catch (reactErr) {
            console.warn(`FunctionResponse error on model ${modelName}:`, reactErr);
            return {
              success: true,
              reply:
                fallbackReply ||
                (typeof callArgs.reply === 'string' && callArgs.reply.trim()
                  ? callArgs.reply
                  : 'Aksi berhasil diproses.'),
              actionType: lastActionType,
              affectedTransactions: lastAffectedTrx,
            };
          }
        }

        let finalText = '';
        try {
          finalText = response.text()?.trim() || '';
        } catch {
          finalText = fallbackReply || 'Permintaanmu sudah berhasil diproses.';
        }

        return {
          success: true,
          reply: finalText || fallbackReply || 'Permintaanmu sudah berhasil diproses.',
          actionType: lastActionType,
          affectedTransactions: lastAffectedTrx,
        };
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed in processAgentChat, trying next candidate...`, err);
      }
    }

    console.error('All candidate models failed in processAgentChat:', lastError);
    return {
      success: false,
      error: 'Terjadi gangguan saat menghubungkan ke asisten kecerdasan buatan.',
    };
  } catch (err) {
    console.error('Error in processAgentChat:', err);
    return {
      success: false,
      error: 'Terjadi gangguan saat menghubungkan ke asisten kecerdasan buatan.',
    };
  }
}


/**
 * Menghasilkan narasi analisis keuangan mendalam dan personal
 */
export async function generateFinancialAnalysisNarrative(
  analysisData: unknown,
  userPrompt: string
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return 'Data analisis keuangan berhasil diambil, namun kunci API belum terkonfigurasi.';
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-flash-latest',
      'gemini-flash-lite-latest',
    ];

    const prompt = `
Pertanyaan / Permintaan Pengguna:
"${userPrompt}"

Data Analitik Keuangan Riil Pengguna:
${JSON.stringify(analysisData, null, 2)}

Buatlah balasan analisis keuangan yang mendalam, santai, dan bersahabat untuk pengguna!
`;

    let lastError: unknown = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction:
            'Kamu adalah Dompi, asisten keuangan pribadi yang santai, cerdas, bersahabat, dan solutif. Tugasmu adalah membaca data analitik keuangan riil pengguna, membedah di mana pos bocor halus atau pos terboros, memberikan evaluasi rasio tabungan dan arus kas, serta memberikan tips hemat realistis yang actionable. Gunakan bullet points (•), heading yang jelas, dan susunan paragraf yang rapi dan nyaman dibaca tanpa emotikon atau simbol bintang berlebihan.',
          generationConfig: {
            temperature: 0.5,
          },
        });

        const res = await model.generateContent(prompt);
        const response = await res.response;
        return response.text().trim();
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed in narrative generation, trying next...`, err);
      }
    }

    console.error('All candidate models failed in generateFinancialAnalysisNarrative:', lastError);
    return 'Terjadi kendala saat menyusun laporan narasi analisis keuangan.';
  } catch (err) {
    console.error('Error generating financial analysis narrative:', err);
    return 'Terjadi kendala saat menyusun laporan narasi analisis keuangan.';
  }
}
