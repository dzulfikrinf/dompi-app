import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function processChat(text: string, recentTransactions: any[]) {
  // Menggunakan model Gemini 3.5 Flash Lite
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    Kamu adalah asisten pintar pencatat keuangan pribadi bernama "Dompi" milik masjul.
    Gayamu ramah, santai, asyik diajak ngobrol, tapi tetap teliti soal uang. 
    Kamu harus bisa merespons sapaan, curhatan, atau perintah terkait data keuangan.

    Hari ini adalah tanggal: ${today}.
    
    Pesan Masjul saat ini: "${text}"
    
    Konteks (10 transaksi terakhir yang sudah dicatat, berguna HANYA JIKA Masjul ingin mengubah/menghapus sesuatu):
    ${JSON.stringify(recentTransactions)}

    Tugasmu:
    1. Tentukan apa yang diinginkan masjul.
    2. Keluarkan HANYA format JSON yang valid, tanpa backtick, tanpa markdown, dan tanpa kalimat tambahan di luar JSON.
    3. Formatnya harus persis seperti ini:
    {
      "action": "TAMBAH" | "UBAH" | "HAPUS" | "NGOBROL",
      "transaction_id": number | null, // Wajib diisi ID transaksinya jika action UBAH atau HAPUS (cari ID-nya dari Konteks)
      "data": { // Wajib diisi jika action TAMBAH atau UBAH. Kosongkan (null) jika HAPUS/NGOBROL.
        "tanggal": "YYYY-MM-DD",
        "kategori": "string (Contoh: Makanan, Transportasi, Hiburan, dll)",
        "nominal": number (hanya angka bulat positif),
        "tipe": "Pengeluaran" | "Pemasukan",
        "deskripsi": "string"
      },
      "reply": "string (Balasan chat natural dari kamu ke masjul. Pakai bahasa Indonesia santai, sapa masjul, jelaskan apa yang barusan dikerjakan, atau balas ngobrolnya)"
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let textResponse = response.text();
  
  // Bersihkan dari format markdown
  textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
  
  return JSON.parse(textResponse);
}