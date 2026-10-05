import { supabase } from "@/lib/supabase";
import DashboardUI from "@/components/dashboard-ui";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("tanggal", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("Gagal mengambil data dari Supabase:", error);
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0f1c]">
        <p className="text-rose-500 font-medium">Gagal memuat data keuangan.</p>
      </div>
    );
  }

  return <DashboardUI data={data || []} />;
}