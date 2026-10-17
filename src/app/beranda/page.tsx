import { requireAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DashboardUI from "@/components/dashboard-ui";
import { getWallets, WalletRecord } from "@/lib/services/wallet-service";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Beranda • Dompi',
  description: 'Neo-dashboard finansial cerdas Dompi',
};

export default async function BerandaPage() {
  const user = await requireAuthUser();

  const supabase = await createClient();

  // Ambil transaksi aktif dan daftar dompet milik user secara paralel dari database
  const [
    { data: transactions, error: trxError },
    walletsResult,
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("tanggal", { ascending: false })
      .order("id", { ascending: false }),
    getWallets({ client: supabase, userId: user.id }),
  ]);

  if (trxError) {
    console.error("Gagal mengambil data transaksi dari Supabase:", trxError);
  }

  const wallets: WalletRecord[] =
    walletsResult.success && walletsResult.data ? walletsResult.data : [];

  return (
    <DashboardUI
      data={transactions || []}
      wallets={wallets}
      userEmail={user.email}
    />
  );
}
