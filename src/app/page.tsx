import { supabase } from "@/lib/supabase";
import DashboardUI from "@/components/dashboard-ui";

// Force dynamic supaya selalu fetch data terbaru setiap ada refresh
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Ambil semua data dari Supabase, diurutkan dari yang terbaru
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("tanggal", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("Gagal mengambil data dari Supabase:", error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-rose-500 font-medium">Gagal memuat data keuangan.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <DashboardUI data={data || []} />
    </main>
  );
}