import { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import {
  createTransactionsBatch,
  updateTransaction,
  deleteTransaction,
  undoDeleteTransaction,
  searchTransactions,
  TransactionRecord,
  TransactionInput,
  TransactionSearchParams,
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
  GeminiContext,
  ChatHistoryItem,
  AgentToolCall,
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

function extractNominal(text?: string): number | null {
  if (!text) return null
  const s = text.toLowerCase().trim()
  const jt = s.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/)
  if (jt) return Math.round(parseFloat(jt[1].replace(',', '.')) * 1000000)
  const clean = s.replace(/\./g, '')
  const rb = clean.match(/(\d+)\s*(?:k|rb|ribu)/)
  if (rb) return parseInt(rb[1], 10) * 1000
  const num = clean.match(/\b\d{4,9}\b/)
  if (num) return parseInt(num[0], 10)
  return null
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

    // 5. Tool Handler untuk mengeksekusi operasi database secara riil (ReAct Loop)
    const toolHandler = async (toolCall: AgentToolCall) => {
      const { name: toolName, args } = toolCall

      switch (toolName) {
        case 'record_transactions': {
          const rawItems = (args.items as TransactionInput[]) || []
          if (!Array.isArray(rawItems) || rawItems.length === 0) {
            return {
              result: { success: false, error: 'Data transaksi kosong dari asisten.' },
              fallbackReply: 'Data transaksi tidak ditemukan untuk dicatat.',
            }
          }

          const createRes = await createTransactionsBatch(rawItems, serviceOpts)
          if (!createRes.success || !createRes.data) {
            return {
              result: { success: false, error: createRes.error || 'Gagal menyimpan transaksi ke database.' },
              fallbackReply: createRes.error || 'Gagal menyimpan transaksi ke database.',
            }
          }

          const details = createRes.data
            .map((t) => `• ${t.deskripsi}: ${t.tipe === 'Pengeluaran' ? '-' : '+'}Rp${Number(t.nominal).toLocaleString('id-ID')} (${t.dompet})`)
            .join('\n')

          const baseReply = typeof args.reply === 'string' && args.reply.trim()
            ? args.reply.trim()
            : (createRes.data.length > 0 ? `Berhasil mencatat ${createRes.data.length} transaksi:\n${details}` : 'Berhasil mencatat transaksi.')

          return {
            result: {
              success: true,
              count: createRes.data.length,
              recordedTransactions: createRes.data.map((t) => ({
                id: t.id,
                tanggal: t.tanggal,
                deskripsi: t.deskripsi,
                nominal: t.nominal,
                tipe: t.tipe,
                dompet: t.dompet,
                kategori: t.kategori,
              })),
            },
            actionType: 'RECORD_TRANSACTIONS',
            affectedTransactions: createRes.data,
            fallbackReply: baseReply,
          }
        }

        case 'query_transactions': {
          const queryParams: TransactionSearchParams = {
            query: typeof args.query === 'string' ? args.query : undefined,
            kategori: typeof args.kategori === 'string' ? args.kategori : undefined,
            dompet: typeof args.dompet === 'string' ? args.dompet : undefined,
            tipe: args.tipe === 'Pengeluaran' || args.tipe === 'Pemasukan' ? args.tipe : undefined,
            startDate: typeof args.startDate === 'string' ? args.startDate : undefined,
            endDate: typeof args.endDate === 'string' ? args.endDate : undefined,
            limit: typeof args.limit === 'number' ? args.limit : 10,
          }

          const searchRes = await searchTransactions(queryParams, serviceOpts)
          if (!searchRes.success || !searchRes.data) {
            return {
              result: { success: false, error: searchRes.error || 'Gagal mencari data transaksi.' },
              fallbackReply: 'Gagal mencari transaksi.',
            }
          }

          const listText = searchRes.data.length > 0
            ? searchRes.data
                .map((t) => `• [${t.tanggal}] ${t.deskripsi}: ${t.tipe === 'Pengeluaran' ? '-' : '+'}Rp${Number(t.nominal).toLocaleString('id-ID')} (${t.dompet})`)
                .join('\n')
            : 'Tidak ada transaksi yang cocok.'

          const baseReply = typeof args.reply === 'string' && args.reply.trim()
            ? args.reply.trim()
            : `Ditemukan ${searchRes.data.length} transaksi:`

          const fullReply = searchRes.data.length > 0 ? `${baseReply}\n\n${listText}` : baseReply

          return {
            result: {
              success: true,
              totalFound: searchRes.data.length,
              transactions: searchRes.data.map((t) => ({
                id: t.id,
                tanggal: t.tanggal,
                deskripsi: t.deskripsi,
                nominal: t.nominal,
                tipe: t.tipe,
                dompet: t.dompet,
                kategori: t.kategori,
              })),
            },
            actionType: 'QUERY_TRANSACTIONS',
            affectedTransactions: searchRes.data,
            fallbackReply: fullReply,
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
              result: { success: false, error: transferRes.error || 'Gagal memproses transfer antar dompet.' },
              fallbackReply: transferRes.error || 'Gagal memproses transfer dompet.',
            }
          }

          const d = transferRes.data
          const adminText = d.biayaAdmin > 0 ? ` (biaya admin: Rp${d.biayaAdmin.toLocaleString('id-ID')})` : ''
          return {
            result: {
              success: true,
              transfer: d,
            },
            actionType: 'TRANSFER_WALLET',
            fallbackReply: `Transfer Rp${Number(d.nominal).toLocaleString('id-ID')} dari ${d.fromWallet} ke ${d.toWallet}${adminText} berhasil dicatat!`,
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
              result: { success: false, error: adjustRes.error || 'Gagal menyesuaikan saldo dompet.' },
              fallbackReply: adjustRes.error || 'Gagal menyesuaikan saldo dompet.',
            }
          }

          return {
            result: {
              success: true,
              adjustment: adjustRes.data,
            },
            actionType: 'ADJUST_WALLET',
            fallbackReply: `Saldo dompet ${adjustRes.data.walletNama} berhasil disesuaikan menjadi Rp${Number(adjustRes.data.saldoBaru).toLocaleString('id-ID')}.`,
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
              return {
                result: { success: false, error: createWRes.error || 'Gagal membuat dompet baru.' },
                fallbackReply: createWRes.error || 'Gagal membuat dompet baru.',
              }
            }
            return {
              result: { success: true, wallet: createWRes.data },
              actionType: 'CREATE_WALLET',
              fallbackReply: `Dompet "${createWRes.data?.nama}" (${createWRes.data?.tipe}) berhasil dibuat dengan saldo awal Rp${Number(createWRes.data?.saldo_awal || 0).toLocaleString('id-ID')}.`,
            }
          }

          if (action === 'UPDATE') {
            let targetId = walletId
            if (!targetId) {
              const found = rawWallets.find((w) => w.nama.toLowerCase() === walletName.toLowerCase())
              targetId = found?.id
            }
            if (!targetId) {
              return {
                result: { success: false, error: `Dompet "${walletName}" tidak ditemukan.` },
                fallbackReply: `Dompet "${walletName}" tidak ditemukan.`,
              }
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
              return {
                result: { success: false, error: updateWRes.error || 'Gagal memperbarui dompet.' },
                fallbackReply: updateWRes.error || 'Gagal memperbarui dompet.',
              }
            }
            return {
              result: { success: true, wallet: updateWRes.data },
              actionType: 'UPDATE_WALLET',
              fallbackReply: `Dompet "${updateWRes.data?.nama}" berhasil diperbarui.`,
            }
          }

          if (action === 'DELETE') {
            let targetId = walletId
            if (!targetId) {
              const found = rawWallets.find((w) => w.nama.toLowerCase() === walletName.toLowerCase())
              targetId = found?.id
            }
            if (!targetId) {
              return {
                result: { success: false, error: `Dompet "${walletName}" tidak ditemukan.` },
                fallbackReply: `Dompet "${walletName}" tidak ditemukan.`,
              }
            }
            const delRes = await deleteWallet(targetId, serviceOpts)
            if (!delRes.success) {
              return {
                result: { success: false, error: delRes.error || 'Gagal menghapus dompet.' },
                fallbackReply: delRes.error || 'Gagal menghapus dompet.',
              }
            }
            return {
              result: { success: true, wallet: delRes.data },
              actionType: 'DELETE_WALLET',
              fallbackReply: `Dompet "${delRes.data?.nama}" berhasil dihapus.`,
            }
          }

          return {
            result: { success: false, error: 'Aksi dompet tidak dikenali.' },
            fallbackReply: 'Aksi dompet tidak dikenali.',
          }
        }

        case 'get_financial_analysis': {
          const period: AnalyticsPeriod = (args.period as AnalyticsPeriod) || 'this_month'
          const analysisDataRes = await getFinancialAnalysis(period, serviceOpts)

          if (!analysisDataRes.success || !analysisDataRes.data) {
            return {
              result: { success: false, error: analysisDataRes.error || 'Gagal mengumpulkan data analisis keuangan.' },
              fallbackReply: analysisDataRes.error || 'Gagal mengumpulkan analisis keuangan.',
            }
          }

          const fallbackText = formatFinancialAnalysisFallback(analysisDataRes.data)

          return {
            result: {
              success: true,
              period,
              analysis: analysisDataRes.data,
            },
            actionType: 'FINANCIAL_ANALYSIS',
            fallbackReply: fallbackText,
          }
        }

        case 'update_or_delete_transaction': {
          const action = typeof args.action === 'string' ? args.action : ''
          let transactionId =
            typeof args.transactionId === 'number' && args.transactionId > 0
              ? args.transactionId
              : args.transactionId
                ? Number(args.transactionId)
                : undefined
          const targetQuery = typeof args.targetQuery === 'string' ? args.targetQuery.trim() : undefined
          const newData = (args.newData || {}) as Partial<TransactionInput>

          // Jika ID tidak ada, cari dari targetQuery di daftar transaksi aktif
          if (!transactionId && targetQuery) {
            const nominal = extractNominal(targetQuery)
            if (nominal) {
              const matchedByNominal = allActiveTransactions.filter((t) => Number(t.nominal) === nominal)
              if (matchedByNominal.length > 0) {
                const cleanWords = targetQuery
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, ' ')
                  .split(/\s+/)
                  .filter((w) => w.length > 2 && !String(nominal).includes(w))
                const best = matchedByNominal.find((t) => cleanWords.some((w) => t.deskripsi.toLowerCase().includes(w)))
                transactionId = best ? best.id : matchedByNominal[0].id
              }
            }

            if (!transactionId) {
              const cleanQ = targetQuery.toLowerCase().trim()
              const matchedByDesc = allActiveTransactions.find(
                (t) => t.deskripsi.toLowerCase().includes(cleanQ) || cleanQ.includes(t.deskripsi.toLowerCase())
              )
              if (matchedByDesc) {
                transactionId = matchedByDesc.id
              }
            }
          }

          if (action === 'UPDATE') {
            const targetId = transactionId || (allActiveTransactions.length > 0 ? allActiveTransactions[0].id : null)
            if (!targetId) {
              return {
                result: { success: false, error: 'Target transaksi yang ingin diubah tidak ditemukan.' },
                fallbackReply: 'Maaf, transaksi yang dimaksud tidak ditemukan untuk diubah.',
              }
            }

            // Ambil data transaksi lama untuk merge agar partial update (misal rename saja) berhasil
            let existingTrx = allActiveTransactions.find((t) => t.id === targetId)
            if (!existingTrx) {
              const { data: dbTrx } = await client
                .from('transactions')
                .select('*')
                .eq('id', targetId)
                .eq('user_id', userId)
                .is('deleted_at', null)
                .maybeSingle()
              existingTrx = dbTrx || undefined
            }

            if (!existingTrx) {
              return {
                result: { success: false, error: 'Transaksi tidak ditemukan.' },
                fallbackReply: 'Maaf, transaksi tersebut tidak ditemukan di catatanmu.',
              }
            }

            const mergedInput: TransactionInput = {
              tanggal: newData.tanggal && /^\d{4}-\d{2}-\d{2}$/.test(newData.tanggal) ? newData.tanggal : existingTrx.tanggal,
              kategori: newData.kategori && newData.kategori.trim() ? newData.kategori.trim() : existingTrx.kategori,
              nominal:
                typeof newData.nominal === 'number' && newData.nominal > 0 ? Math.round(newData.nominal) : existingTrx.nominal,
              tipe: newData.tipe === 'Pengeluaran' || newData.tipe === 'Pemasukan' ? newData.tipe : existingTrx.tipe,
              dompet: newData.dompet && newData.dompet.trim() ? newData.dompet.trim() : existingTrx.dompet,
              deskripsi: newData.deskripsi && newData.deskripsi.trim() ? newData.deskripsi.trim() : existingTrx.deskripsi,
            }

            const updRes = await updateTransaction(targetId, mergedInput, serviceOpts)
            if (!updRes.success || !updRes.data) {
              return {
                result: { success: false, error: updRes.error || 'Gagal memperbarui transaksi.' },
                fallbackReply: updRes.error || 'Gagal memperbarui transaksi.',
              }
            }

            const defaultReply = `Transaksi "${existingTrx.deskripsi}" berhasil diubah menjadi "${updRes.data.deskripsi}" (Rp${Number(updRes.data.nominal).toLocaleString('id-ID')}).`

            return {
              result: { success: true, transaction: updRes.data },
              actionType: 'UPDATE_TRANSACTION',
              affectedTransactions: [updRes.data],
              fallbackReply: typeof args.reply === 'string' && args.reply.trim() ? args.reply : defaultReply,
            }
          }

          if (action === 'DELETE') {
            const targetId = transactionId || (allActiveTransactions.length > 0 ? allActiveTransactions[0].id : null)
            if (!targetId) {
              return {
                result: { success: false, error: 'ID transaksi yang ingin dihapus tidak ditemukan.' },
                fallbackReply: 'ID transaksi yang ingin dihapus tidak ditemukan.',
              }
            }
            const delTrxRes = await deleteTransaction(targetId, serviceOpts)
            if (!delTrxRes.success || !delTrxRes.data) {
              return {
                result: { success: false, error: delTrxRes.error || 'Gagal menghapus transaksi.' },
                fallbackReply: delTrxRes.error || 'Gagal menghapus transaksi.',
              }
            }
            return {
              result: { success: true, transaction: delTrxRes.data },
              actionType: 'DELETE_TRANSACTION',
              affectedTransactions: [delTrxRes.data],
              fallbackReply:
                typeof args.reply === 'string' && args.reply.trim()
                  ? args.reply
                  : `Transaksi "${delTrxRes.data.deskripsi}" Rp${Number(delTrxRes.data.nominal).toLocaleString('id-ID')} sudah dihapus.`,
            }
          }

          if (action === 'UNDO') {
            const undoRes = await undoDeleteTransaction(transactionId || undefined, serviceOpts)
            if (!undoRes.success || !undoRes.data) {
              return {
                result: { success: false, error: undoRes.error || 'Tidak ada transaksi yang dapat dipulihkan.' },
                fallbackReply: undoRes.error || 'Tidak ada transaksi yang dapat dipulihkan.',
              }
            }
            return {
              result: { success: true, transaction: undoRes.data },
              actionType: 'UNDO_TRANSACTION',
              affectedTransactions: [undoRes.data],
              fallbackReply:
                typeof args.reply === 'string' && args.reply.trim()
                  ? args.reply
                  : `Transaksi "${undoRes.data.deskripsi}" Rp${Number(undoRes.data.nominal).toLocaleString('id-ID')} berhasil dipulihkan.`,
            }
          }

          return {
            result: { success: false, error: 'Aksi transaksi tidak valid.' },
            fallbackReply: 'Aksi transaksi tidak valid.',
          }
        }

        default:
          return {
            result: { success: false, error: `Tool ${toolName} tidak dikenal.` },
            fallbackReply: 'Tindakan berhasil diproses.',
          }
      }
    }

    // 6. Panggil Gemini Agent NLU & Function Calling dengan ReAct Loop
    const agentRes = await processAgentChat(
      trimmed,
      context,
      options?.history || [],
      toolHandler
    )

    if (!agentRes.success) {
      return {
        success: false,
        error: agentRes.error || 'Gagal memproses pesan dengan asisten AI.',
      }
    }

    return {
      success: true,
      reply: agentRes.reply || 'Ada yang bisa Dompi bantu lagi untuk keuanganmu?',
      actionType: agentRes.actionType || 'CHAT',
      affectedTransactions: agentRes.affectedTransactions as TransactionRecord[] | undefined,
    }
  } catch (err) {
    console.error('Unhandled error in executeFinancialAgent:', err)
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memproses percakapan dengan asisten.',
    }
  }
}
