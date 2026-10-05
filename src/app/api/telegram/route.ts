import { NextResponse } from 'next/server';
import { parseTransaction } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Mengecek apakah request ini berisi pesan teks biasa dari Telegram
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      // 1. Suruh Gemini menganalisis teks pesan
      let transactionData;
      try {
        transactionData = await parseTransaction(text);
      } catch (e) {
        console.error("Gemini Parsing Error:", e);
        await sendMessage(chatId, 'Maaf, saya gagal memahami catatan keuangan ini. Pastikan formatnya jelas (misal: "makan siang 20rb").');
        return NextResponse.json({ status: 'ok' }); // Status tetap 'ok' agar Telegram tidak mengulang webhook
      }

      // 2. Jika di analisis Gemini tidak ada tanggal, pakaikan tanggal server
      if (!transactionData.tanggal) {
         transactionData.tanggal = new Date().toISOString().split('T')[0];
      }

      // 3. Simpan data yang sudah dirapikan AI ke Supabase
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            tanggal: transactionData.tanggal,
            kategori: transactionData.kategori,
            nominal: transactionData.nominal,
            tipe: transactionData.tipe,
            deskripsi: transactionData.deskripsi,
          },
        ]);

      // 4. Balas chat user di Telegram
      if (error) {
        console.error("Supabase Error:", error);
        await sendMessage(chatId, 'Waduh, gagal menyimpan data ke database. Coba lagi nanti ya.');
      } else {
        const nominalFormat = transactionData.nominal.toLocaleString('id-ID');
        const icon = transactionData.tipe === 'Pengeluaran' ? '📉' : '📈';
        const reply = `✅ **Berhasil dicatat!**\n\nKategori: ${transactionData.kategori}\nTipe: ${icon} ${transactionData.tipe}\nNominal: Rp ${nominalFormat}\nDeskripsi: ${transactionData.deskripsi}`;
        
        await sendMessage(chatId, reply);
      }
    }

    // Selalu balas 'ok' supaya Telegram tahu pesan sudah kita terima
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

// Fungsi pembantu untuk membalas chat ke Telegram
async function sendMessage(chatId: string | number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown',
    }),
  });
}