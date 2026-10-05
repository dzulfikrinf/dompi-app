import { NextResponse } from 'next/server';
import { processChat } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      // 1. Ambil 10 transaksi terakhir sebagai konteks untuk AI (supaya bisa paham kalau disuruh "hapus yang terakhir")
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .order('id', { ascending: false })
        .limit(10);

      // 2. Suruh Gemini memproses chat-nya
      let aiResponse;
      try {
        aiResponse = await processChat(text, recentTransactions || []);
      } catch (e) {
        console.error("Gemini Error:", e);
        await sendMessage(chatId, 'Waduh masjul, otak AI-ku lagi nge-blank bentar. Coba kirim lagi ya! 🙏');
        return NextResponse.json({ status: 'ok' });
      }

      const { action, transaction_id, data, reply } = aiResponse;
      let dbError = null;

      // 3. Lakukan aksi ke database sesuai keputusan AI
      if (action === "TAMBAH" && data) {
        if (!data.tanggal) data.tanggal = new Date().toISOString().split('T')[0];
        const { error } = await supabase.from('transactions').insert([
          {
            tanggal: data.tanggal,
            kategori: data.kategori,
            nominal: data.nominal,
            tipe: data.tipe,
            deskripsi: data.deskripsi,
          }
        ]);
        dbError = error;
      } 
      else if (action === "UBAH" && transaction_id && data) {
        const { error } = await supabase.from('transactions').update(data).eq('id', transaction_id);
        dbError = error;
      } 
      else if (action === "HAPUS" && transaction_id) {
        const { error } = await supabase.from('transactions').delete().eq('id', transaction_id);
        dbError = error;
      }

      // 4. Balas pesannya ke Telegram menggunakan kalimat natural buatan Gemini
      if (dbError) {
        console.error("Supabase Error:", dbError);
        await sendMessage(chatId, 'Hmm, aku gagal nyimpen ke database nih masjul. Cek koneksi atau coba lagi ya.');
      } else {
        // Balasan natural dari AI
        await sendMessage(chatId, reply);
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

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
      // Parse mode dihilangkan agar tidak error kalau Gemini ngeluarin karakter spesial
    }),
  });
}