import { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createTransactionsBatch,
  updateTransaction,
  deleteTransaction,
  undoDeleteTransaction,
  TransactionRecord,
  TransactionInput,
} from '@/lib/services/transaction-service'
import {
  getWallets,
  createWallet,
  updateWallet,
  deleteWallet,
  calculateWalletBalances,
  transferWalletBalance,
  adjustWalletBalance,
} from '@/lib/services/wallet-service'
import {
  getFinancialAnalysis,
  AnalyticsPeriod,
  formatFinancialAnalysisFallback,
} from '@/lib/services/analytics-service'
import {
  processAgentChat,
  generateFinancialAnalysisNarrative,
  GeminiContext,
  ChatHistoryItem,
} from '@/lib/gemini'

export type AgentExecutionOptions = {
  client?: SupabaseClient
  userId?: string
  history?: ChatHistoryItem[]
}

export type AgentExecutionResult = {
  success: boolean
  reply?: string
  error?: string
  actionType?: string
  affectedTransactions?: TransactionRecord[]
}

async function resolveClientAndUser(options?: AgentExecutionOptions) {
  const client = options?.client ?? (await createServerSupabaseClient())
  let userId = options?.userId

  if (!userId) {
    const {
      data: { user },
    } = await client.auth.getUser()
    userId = user?.id
  }

  return { client, userId }
}

/**
 * Service terpadu yang memproses pesan chat menggunakan Gemini Function Calling
 * dan mengeksekusi operasi database sesuai keputusan asisten AI.
 */
export async function executeFinancialAgent(
  message: string,
  options?: AgentExecutionOptions
): Promise<AgentExecutionResult> {
  try {
    const trimmed = message?.trim()
    if (!trimmed) {
      return { success: false, error: 'Pesan tidak boleh kosong.' }
    }

    const { client, userId } = await resolveClientAndUser(options)
    if (!userId) {
      return { success: false, error: 'Sesi Anda tidak valid. Silakan login kembali.' }
    }

    const serviceOpts = { client, userId }

    // 1. Ambil SEMUA transaksi aktif pengguna untuk kalkulasi saldo & ringkasan yang 100% akurat
    const { data: allMutationTrx, error: trxErr } = await client
      .from('transactions')
      .select('id, tanggal, tipe, dompet, nominal, kategori, deskripsi, deleted_at')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('tanggal', { ascending: false })

    if (trxErr) {
      console.error('Error fetching transactions for agent context:', trxErr)
    }

    const allActiveTransactions = allMutationTrx || []

    // 2. Transaksi aktif terbaru untuk konteks prompt (15 transaksi teratas)
    const activeTransactions = allActiveTransactions.slice(0, 15)

    // 3. Ambil transaksi terakhir yang dihapus (konteks UNDO)
    const { data: latestDeleted } = await client
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // 4. Ambil data dompet dan hitung saldo terkini menggunakan SEMUA transaksi aktif
    const walletsResult = await getWallets(serviceOpts)
    const rawWallets = walletsResult.success && walletsResult.data ? walletsResult.data : []
    const { walletsWithBalance, totalSaldoTerkini } = calculateWalletBalances(
      rawWallets,
      allActiveTransactions
    )
    const walletNames = rawWallets.map((w) => w.nama)

    // 5. Hitung ringkasan bulan ini dengan zona waktu Asia/Jakarta (WIB)
    const nowWIB = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
    const currentMonthPrefix = `${nowWIB.getFullYear()}-${String(nowWIB.getMonth() + 1).padStart(2, '0')}`

    const thisMonthTransactions = allActiveTransactions.filter((t) =>
      t.tanggal.startsWith(currentMonthPrefix)
    )
    const totalPengeluaran = thisMonthTransactions
      .filter((t) => t.tipe === 'Pengeluaran' && !t.kategori?.toLowerCase().includes('transfer'))
      .reduce((sum, t) => sum + Number(t.nominal || 0), 0)
    const totalPemasukan = thisMonthTransactions
      .filter((t) => t.tipe === 'Pemasukan' && !t.kategori?.toLowerCase().includes('transfer'))
      .reduce((sum, t) => sum + Number(t.nominal || 0), 0)

    const context: GeminiContext = {
      activeTransactions: activeTransactions.map((t) => ({
        id: t.id,
        tanggal: t.tanggal,
        kategori: t.kategori,
        nominal: t.nominal,
        tipe: t.tipe,
        dompet: t.dompet,
        deskripsi: t.deskripsi,
      })),
      latestDeletedTransaction: latestDeleted
        ? {
            id: latestDeleted.id,
            tanggal: latestDeleted.tanggal,
            kategori: latestDeleted.kategori,
            nominal: latestDeleted.nominal,
            tipe: latestDeleted.tipe,
            dompet: latestDeleted.dompet,
            deskripsi: latestDeleted.deskripsi,
            deleted_at: latestDeleted.deleted_at,
          }
        : null,
      wallets: walletNames,
      walletDetails: walletsWithBalance.map((w) => ({
        id: w.id,
        nama: w.nama,
        tipe: w.tipe,
        saldo_awal: w.saldo_awal,
        saldo_terkini: w.saldo_terkini,
      })),
      summary: {
        bulanIni: currentMonthPrefix,
        totalPengeluaran,
        totalPemasukan,
        selisihBulanIni: totalPemasukan - totalPengeluaran,
        totalSaldoTerkini,
        jumlahTransaksi: thisMonthTransactions.length,
        rincianDompet: walletsWithBalance.map((w) => ({
          nama: w.nama,
          tipe: w.tipe,
          saldo: w.saldo_terkini ?? w.saldo_awal,
        })),
      },
    }

    // 5. Panggil Gemini Agent NLU & Function Calling
    const agentRes = await processAgentChat(trimmed, context, options?.history || [])
    if (!agentRes.success) {
      return {
        success: false,
        error: agentRes.error || 'Gagal memproses pesan dengan asisten AI.',
      }
    }

    // 6a. Jika pengguna hanya ngobrol biasa / bertanya tips (tanpa pemanggilan tool)
    if (!agentRes.toolCall) {
      return {
        success: true,
        reply: agentRes.reply || 'Ada yang bisa Dompi bantu lagi untuk keuanganmu?',
        actionType: 'CHAT',
      }
    }

    const { name: toolName, args } = agentRes.toolCall

    // 6b. Eksekusi tool terpilih
    switch (toolName) {
      case 'record_transactions': {
        const rawItems = (args.items as TransactionInput[]) || []
        if (!Array.isArray(rawItems) || rawItems.length === 0) {
          return { success: false, error: 'Data transaksi kosong dari asisten.' }
        }

        const createRes = await createTransactionsBatch(rawItems, serviceOpts)
        if (!createRes.success || !createRes.data) {
          return {
            success: false,
            error: createRes.error || 'Gagal menyimpan transaksi ke database.',
          }
        }

        return {
          success: true,
          reply:
            agentRes.reply ||
            `Berhasil mencatat ${createRes.data.length} transaksi ke dalam catatan keuanganmu.`,
          actionType: 'RECORD_TRANSACTIONS',
          affectedTransactions: createRes.data,
        }
      }

      case 'transfer_wallet_balance': {
        const fromWallet = typeof args.fromWallet === 'string' ? args.fromWallet : ''
        const toWallet = typeof args.toWallet === 'string' ? args.toWallet : ''
        const nominal = typeof args.nominal === 'number' ? args.nominal : Number(args.nominal || 0)
        const biayaAdmin = typeof args.biayaAdmin === 'number' ? args.biayaAdmin : args.biayaAdmin ? Number(args.biayaAdmin) : undefined
        const catatan = typeof args.catatan === 'string' ? args.catatan : undefined
        const tanggal = typeof args.tanggal === 'string' ? args.tanggal : undefined

        const transferRes = await transferWalletBalance(
          {
            fromWalletName: fromWallet,
            toWalletName: toWallet,
            nominal,
            biayaAdmin,
            catatan,
            tanggal,
          },
          serviceOpts
        )

        if (!transferRes.success || !transferRes.data) {
          return {
            success: false,
            error: transferRes.error || 'Gagal memproses transfer antar dompet.',
          }
        }

        const d = transferRes.data
        const adminText = d.biayaAdmin > 0 ? ` (biaya admin: Rp${d.biayaAdmin.toLocaleString('id-ID')})` : ''
        return {
          success: true,
          reply:
            agentRes.reply ||
            `Transfer Rp${Number(d.nominal).toLocaleString('id-ID')} dari ${d.fromWallet} ke ${d.toWallet}${adminText} berhasil dicatat!`,
          actionType: 'TRANSFER_WALLET',
        }
      }

      case 'adjust_wallet_balance': {
        const walletName = typeof args.walletName === 'string' || typeof args.walletName === 'number' ? args.walletName : String(args.walletName || '')
        const nominalTarget = typeof args.nominalTarget === 'number' ? args.nominalTarget : Number(args.nominalTarget || 0)
        const catatan = typeof args.catatan === 'string' ? args.catatan : undefined
        const tanggal = typeof args.tanggal === 'string' ? args.tanggal : undefined

        const adjustRes = await adjustWalletBalance(
          {
            walletNameOrId: walletName,
            nominalTarget,
            catatan,
            tanggal,
          },
          serviceOpts
        )

        if (!adjustRes.success || !adjustRes.data) {
          return {
            success: false,
            error: adjustRes.error || 'Gagal menyesuaikan saldo dompet.',
          }
        }

        return {
          success: true,
          reply:
            agentRes.reply ||
            `Saldo dompet ${adjustRes.data.walletNama} berhasil disesuaikan menjadi Rp${Number(adjustRes.data.saldoBaru).toLocaleString('id-ID')}.`,
          actionType: 'ADJUST_WALLET',
        }
      }

      case 'manage_wallet': {
        const action = typeof args.action === 'string' ? args.action : ''
        const walletName = typeof args.walletName === 'string' ? args.walletName : ''
        const walletId = typeof args.walletId === 'number' ? args.walletId : args.walletId ? Number(args.walletId) : undefined
        const newName = typeof args.newName === 'string' ? args.newName : undefined
        const tipe = typeof args.tipe === 'string' ? args.tipe : undefined
        const saldoAwal = typeof args.saldoAwal === 'number' ? args.saldoAwal : args.saldoAwal !== undefined ? Number(args.saldoAwal) : undefined

        if (action === 'CREATE') {
          const createWRes = await createWallet(
            {
              nama: walletName,
              tipe: tipe || 'Rekening Bank',
              saldo_awal: saldoAwal ?? 0,
            },
            serviceOpts
          )
          if (!createWRes.success) {
            return { success: false, error: createWRes.error || 'Gagal membuat dompet baru.' }
          }
          return {
            success: true,
            reply:
              agentRes.reply ||
              `Dompet "${createWRes.data?.nama}" (${createWRes.data?.tipe}) berhasil dibuat dengan saldo awal Rp${Number(createWRes.data?.saldo_awal || 0).toLocaleString('id-ID')}.`,
            actionType: 'CREATE_WALLET',
          }
        }

        if (action === 'UPDATE') {
          // Cari ID jika belum ada
          let targetId = walletId
          if (!targetId) {
            const found = rawWallets.find((w) => w.nama.toLowerCase() === walletName.toLowerCase())
            targetId = found?.id
          }
          if (!targetId) {
            return { success: false, error: `Dompet "${walletName}" tidak ditemukan.` }
          }

          const updateWRes = await updateWallet(
            targetId,
            {
              nama: newName || undefined,
              tipe: tipe || undefined,
              saldo_awal: saldoAwal !== undefined ? saldoAwal : undefined,
            },
            serviceOpts
          )
          if (!updateWRes.success) {
            return { success: false, error: updateWRes.error || 'Gagal memperbarui dompet.' }
          }
          return {
            success: true,
            reply: agentRes.reply || `Dompet "${updateWRes.data?.nama}" berhasil diperbarui.`,
            actionType: 'UPDATE_WALLET',
          }
        }

        if (action === 'DELETE') {
          let targetId = walletId
          if (!targetId) {
            const found = rawWallets.find((w) => w.nama.toLowerCase() === walletName.toLowerCase())
            targetId = found?.id
          }
          if (!targetId) {
            return { success: false, error: `Dompet "${walletName}" tidak ditemukan.` }
          }
          const delRes = await deleteWallet(targetId, serviceOpts)
          if (!delRes.success) {
            return { success: false, error: delRes.error || 'Gagal menghapus dompet.' }
          }
          return {
            success: true,
            reply: agentRes.reply || `Dompet "${delRes.data?.nama}" berhasil dihapus.`,
            actionType: 'DELETE_WALLET',
          }
        }

        return { success: false, error: 'Aksi dompet tidak dikenali.' }
      }

      case 'get_financial_analysis': {
        const period: AnalyticsPeriod = (args.period as AnalyticsPeriod) || 'this_month'
        const analysisDataRes = await getFinancialAnalysis(period, serviceOpts)

        if (!analysisDataRes.success || !analysisDataRes.data) {
          return {
            success: false,
            error: analysisDataRes.error || 'Gagal mengumpulkan data analisis keuangan.',
          }
        }

        // Susun narasi analitik mendalam dengan kecerdasan Gemini
        let narrative = ''
        try {
          narrative = await generateFinancialAnalysisNarrative(analysisDataRes.data, trimmed)
        } catch (e) {
          console.warn('generateFinancialAnalysisNarrative failed:', e)
        }

        // Jika AI mengembalikan pesan gagal atau kosong, gunakan fallback formatter terstruktur
        if (!narrative || narrative.includes('Terjadi kendala')) {
          narrative = formatFinancialAnalysisFallback(analysisDataRes.data)
        }

        return {
          success: true,
          reply: narrative,
          actionType: 'FINANCIAL_ANALYSIS',
        }
      }

      case 'update_or_delete_transaction': {
        const action = typeof args.action === 'string' ? args.action : ''
        const transactionId = typeof args.transactionId === 'number' ? args.transactionId : args.transactionId ? Number(args.transactionId) : undefined
        const newData = args.newData as TransactionInput | undefined

        if (action === 'UPDATE') {
          if (!transactionId || !newData) {
            return { success: false, error: 'Target transaksi atau data koreksi tidak lengkap.' }
          }
          const updRes = await updateTransaction(transactionId, newData, serviceOpts)
          if (!updRes.success) {
            return { success: false, error: updRes.error || 'Gagal memperbarui transaksi.' }
          }
          return {
            success: true,
            reply:
              agentRes.reply ||
              `Transaksi "${updRes.data?.deskripsi}" berhasil diubah menjadi Rp${Number(updRes.data?.nominal).toLocaleString('id-ID')}.`,
            actionType: 'UPDATE_TRANSACTION',
            affectedTransactions: updRes.data ? [updRes.data] : undefined,
          }
        }

        if (action === 'DELETE') {
          if (!transactionId) {
            return { success: false, error: 'ID transaksi yang ingin dihapus tidak ditemukan.' }
          }
          const delTrxRes = await deleteTransaction(transactionId, serviceOpts)
          if (!delTrxRes.success) {
            return { success: false, error: delTrxRes.error || 'Gagal menghapus transaksi.' }
          }
          return {
            success: true,
            reply:
              agentRes.reply ||
              `Transaksi "${delTrxRes.data?.deskripsi}" Rp${Number(delTrxRes.data?.nominal).toLocaleString('id-ID')} sudah dihapus.`,
            actionType: 'DELETE_TRANSACTION',
            affectedTransactions: delTrxRes.data ? [delTrxRes.data] : undefined,
          }
        }

        if (action === 'UNDO') {
          const undoRes = await undoDeleteTransaction(transactionId || undefined, serviceOpts)
          if (!undoRes.success) {
            return { success: false, error: undoRes.error || 'Tidak ada transaksi yang dapat dipulihkan.' }
          }
          return {
            success: true,
            reply:
              agentRes.reply ||
              `Transaksi "${undoRes.data?.deskripsi}" Rp${Number(undoRes.data?.nominal).toLocaleString('id-ID')} berhasil dipulihkan.`,
            actionType: 'UNDO_TRANSACTION',
            affectedTransactions: undoRes.data ? [undoRes.data] : undefined,
          }
        }

        return { success: false, error: 'Aksi transaksi tidak valid.' }
      }

      default:
        return {
          success: true,
          reply: agentRes.reply || 'Tindakan berhasil diproses.',
          actionType: toolName,
        }
    }
  } catch (err) {
    console.error('Unhandled error in executeFinancialAgent:', err)
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memproses percakapan dengan asisten.',
    }
  }
}
