import { requireAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import DashboardUI from "@/components/dashboard-ui";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await requireAuthUser();
  const supabase = await createClient();

  // Ambil transaksi, pengaturan budget, dan daftar dompet secara paralel
  const [
    { data: transactions, error },
    { data: settingsData },
    { data: walletsData },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("*")
      .is("deleted_at", null)
      .order("tanggal", { ascending: false })
      .order("id", { ascending: false }),
    supabase.from("settings").select("*").limit(1).maybeSingle(),
    supabase.from("wallets").select("*"),
  ]);

  if (error) {
    console.error("Gagal mengambil data dari Supabase:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1c]">
        <p className="text-rose-500 font-medium">Gagal memuat data keuangan dari database.</p>
      </div>
    );
  }

  const budgetBulanan = settingsData ? settingsData.budget_bulanan : 10500000;
  const wallets = walletsData && walletsData.length > 0 ? walletsData : [
    { id: 1, nama: "BCA Payroll", tipe: "Rekening Utama", saldo_awal: 16420000 },
    { id: 2, nama: "GoPay & OVO", tipe: "Dompet Digital", saldo_awal: 1830000 },
    { id: 3, nama: "Bibit Investasi", tipe: "Reksa Dana", saldo_awal: 6000000 },
    { id: 4, nama: "Tunai", tipe: "Uang Fisik", saldo_awal: 600000 },
  ];

  return <DashboardUI data={transactions || []} budget={budgetBulanan} wallets={wallets} userEmail={user.email} />;
}