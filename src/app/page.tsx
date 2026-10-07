import { requireAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DashboardUI from "@/components/dashboard-ui";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await requireAuthUser();
  const supabase = await createClient();

  // Ambil transaksi aktif dan daftar dompet milik user secara paralel dari database
  const [
    { data: transactions, error: trxError },
    { data: walletsData, error: walletError },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("tanggal", { ascending: false })
      .order("id", { ascending: false }),
    supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: true }),
  ]);

  if (trxError) {
    console.error("Gagal mengambil data transaksi dari Supabase:", trxError);
  }
  if (walletError) {
    console.error("Gagal mengambil data dompet dari Supabase:", walletError);
  }

  // Gunakan data murni 100% dari database
  const wallets = (walletsData || []).map((w) => ({
    id: Number(w.id),
    nama: w.nama,
    tipe: w.tipe,
    saldo_awal: Number(w.saldo_awal || 0),
  }));

  return (
    <DashboardUI
      data={transactions || []}
      wallets={wallets}
      userEmail={user.email}
    />
  );
}