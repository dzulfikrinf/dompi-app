import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardUI from "@/components/dashboard-ui";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .is("deleted_at", null)
    .order("tanggal", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("Gagal mengambil data dari Supabase:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1c]">
        <p className="text-rose-500 font-medium">Gagal memuat data keuangan dari database.</p>
      </div>
    );
  }

  // Ambil pengaturan budget (jika tabelnya sudah dibuat)
  const { data: settingsData } = await supabase.from("settings").select("*").limit(1).single();
  const budgetBulanan = settingsData ? settingsData.budget_bulanan : 10500000;

  // Ambil daftar dompet (jika tabelnya sudah dibuat)
  const { data: walletsData } = await supabase.from("wallets").select("*");
  const wallets = walletsData || [
    { id: 1, nama: "BCA Payroll", tipe: "Rekening Utama", saldo_awal: 16420000 },
    { id: 2, nama: "GoPay & OVO", tipe: "Dompet Digital", saldo_awal: 1830000 },
    { id: 3, nama: "Bibit Investasi", tipe: "Reksa Dana", saldo_awal: 6000000 },
    { id: 4, nama: "Tunai", tipe: "Uang Fisik", saldo_awal: 600000 },
  ];

  return <DashboardUI data={transactions || []} budget={budgetBulanan} wallets={wallets} userEmail={user.email} />;
}