import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function parseTransaction(text: string) {
  // Menggunakan model Gemini 1.5 Flash yang sangat cepat
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
  
  const prompt = `
    Kamu adalah asisten pencatat keuangan pribadi yang pintar. 
    Analisis teks berikut dan ekstrak data keuangannya.
    
    Teks: "${text}"
    
    Keluarkan HANYA format JSON yang valid, tanpa backtick, tanpa markdown, dan tanpa kalimat tambahan.
    Gunakan struktur ini persis:
    {
      "tanggal": "YYYY-MM-DD", (gunakan tanggal hari ini jika teks tidak menyebutkan kapan)
      "kategori": "string (contoh: Makanan, Transportasi, Gaji, dll)",
      "nominal": number (hanya angka bulat, tanpa titik, koma, atau simbol Rp),
      "tipe": "Pengeluaran" atau "Pemasukan",
      "deskripsi": "string (keterangan singkat dari teksnya)"
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let textResponse = response.text();
  
  // Membersihkan hasil jika Gemini masih membandel memberikan markdown code block
  textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
  
  return JSON.parse(textResponse);
}