import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import TransaksiClient, { Transaction, WalletItem } from "./transaksi-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function TransaksiPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch transactions (RLS automatically restricts to user's rows, exclude soft-deleted)
  const { data: transactions, error: trxError } = await supabase
    .from("transactions")
    .select("*")
    .is("deleted_at", null)
    .order("tanggal", { ascending: false })
    .order("id", { ascending: false })

  if (trxError) {
    console.error("Gagal mengambil daftar transaksi:", trxError)
  }

  // Fetch wallets (RLS automatically restricts to user's rows)
  const { data: walletsData } = await supabase
    .from("wallets")
    .select("id, nama, tipe")
    .order("id", { ascending: true })

  const wallets: WalletItem[] = walletsData && walletsData.length > 0
    ? walletsData
    : [
        { id: 1, nama: "BCA Payroll", tipe: "Rekening Utama" },
        { id: 2, nama: "GoPay", tipe: "Dompet Digital" },
        { id: 3, nama: "Bibit Investasi", tipe: "Reksa Dana" },
        { id: 4, nama: "Tunai", tipe: "Uang Fisik" },
      ]

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050811] text-slate-200 p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
          <div className="h-16 w-full bg-[#0f172a] border border-slate-800/60 rounded-2xl animate-shimmer" />
          <div className="h-28 w-full bg-[#0f172a] border border-slate-800/60 rounded-3xl animate-shimmer" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 w-full bg-[#0f172a] border border-slate-800/60 rounded-2xl animate-shimmer" />
            ))}
          </div>
        </div>
      }
    >
      <TransaksiClient
        initialTransactions={(transactions as Transaction[]) || []}
        wallets={wallets}
        userEmail={user.email}
      />
    </Suspense>
  )
}

