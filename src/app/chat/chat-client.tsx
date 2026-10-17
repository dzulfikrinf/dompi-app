'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Sparkles,
  RotateCcw,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  List,
} from 'lucide-react'
import { sendChatMessageAction, ChatActionResult } from './actions'
import { ThemeToggle } from '@/components/theme-toggle'

type Message = {
  id: string
  sender: 'user' | 'assistant'
  text: string
  timestamp: string
  action?: string
  actionType?: string
  affectedTransaction?: {
    id: number
    tanggal: string
    kategori: string
    nominal: number
    tipe: 'Pengeluaran' | 'Pemasukan'
    dompet?: string
    deskripsi: string
  }
  affectedTransactions?: Array<{
    id: number
    tanggal: string
    kategori: string
    nominal: number
    tipe: 'Pengeluaran' | 'Pemasukan'
    dompet?: string
    deskripsi: string
  }>
  isError?: boolean
}

const SAMPLE_PROMPTS = [
  'Tadi makan siang 25rb Cash dan beli bensin 50rb Rekening',
  'Pindahin 100rb dari Rekening Utama ke Cash',
  'Analisis keuanganku bulan ini, aku boncos di apa aja?',
  'Koreksi saldo Cash asliku sekarang jadi 50.000',
  'Gimana tips mengatur budget keuangan pribadi?',
]

export default function ChatClient({ userEmail }: { userEmail?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Halo! Saya Dompi, asisten keuangan pribadimu. Kamu bisa menyuruhku mencatat banyak transaksi sekaligus, pindah saldo antar dompet, atau menganalisis keuanganmu dengan bahasa santai sehari-hari.',
      timestamp: 'Baru saja',
    },
  ])
  const [inputValue, setInputValue] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('q') || ''
    }
    return ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Focus input jika ada teks awalan dari halaman Panduan (?q=...)
  useEffect(() => {
    if (inputValue) {
      inputRef.current?.focus()
    }
  }, [inputValue])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim()
    if (!text || isLoading) return

    setInputValue('')
    setErrorMessage(null)

    const userMessage: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Siapkan riwayat percakapan untuk konteks multi-turn agent
    const historyPayload = messages
      .filter((m) => !m.isError && m.text && m.id !== 'welcome')
      .slice(-8)
      .map((m) => ({
        role: (m.sender === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        text: m.text,
      }))

    try {
      const res: ChatActionResult = await sendChatMessageAction(text, historyPayload)

      if (res.success && res.reply) {
        const assistantMessage: Message = {
          id: 'res-' + Date.now(),
          sender: 'assistant',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          action: res.actionType,
          actionType: res.actionType,
          affectedTransaction: res.affectedTransaction,
          affectedTransactions: res.affectedTransactions,
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        const errorText = res.error || 'Maaf, Dompi gagal memproses pesan tersebut.'
        setErrorMessage(errorText)
        const errorAssistantMessage: Message = {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: errorText,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        }
        setMessages((prev) => [...prev, errorAssistantMessage])
      }
    } catch {
      const genericError = 'Terjadi gangguan jaringan atau koneksi server.'
      setErrorMessage(genericError)
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: genericError,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }

  const handleUndo = () => {
    handleSendMessage('batalkan penghapusan terakhir')
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] dark:bg-[#0F1011] text-[#121212] dark:text-[#FBF9F4] flex flex-col font-sans selection:bg-[#FFE600] selection:text-[#121212]">
      {/* Top Header */}
      <header className="h-16 sm:h-20 border-b-2 border-[#121212] dark:border-zinc-800 bg-[#FBF9F4]/90 dark:bg-[#0F1011]/90 backdrop-blur-md px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/beranda"
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 border-[#121212] dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-brutal-sm btn-brutal transition flex-shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#FFE600] border-2 border-[#121212] flex items-center justify-center text-[#121212] shadow-brutal-sm flex-shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold font-display tracking-tight leading-none flex items-center gap-1.5 truncate text-zinc-950 dark:text-zinc-50">
                <span>Chat Dompi</span>
                <span className="text-[10px] font-black bg-[#00F0FF] text-[#121212] border border-[#121212] px-1.5 py-0.2 rounded uppercase">
                  AI AGENT
                </span>
              </h1>
              <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[200px] font-medium">
                {userEmail || 'Masjul'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ThemeToggle />
          <button
            onClick={handleUndo}
            disabled={isLoading}
            className="inline-flex items-center justify-center h-10 px-3 sm:px-4 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-[#121212] dark:border-zinc-700 text-xs font-display font-bold shadow-brutal-sm btn-brutal transition cursor-pointer disabled:opacity-40"
            title="Pulihkan transaksi terakhir yang baru dihapus"
            aria-label="Batalkan penghapusan terakhir"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline ml-1.5">Batalkan</span>
          </button>
          <Link
            href="/transaksi"
            className="inline-flex items-center justify-center h-10 px-3 sm:px-4 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-2 border-[#121212] dark:border-zinc-700 text-xs font-display font-bold shadow-brutal-sm btn-brutal transition"
            title="Buka Riwayat Transaksi"
            aria-label="Buka Riwayat Transaksi"
          >
            <List className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline ml-1.5">Riwayat</span>
          </Link>
        </div>
      </header>

      {/* Chat Messages Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#FFE600] text-[#121212] border-2 border-[#121212] rounded-tr-xs shadow-brutal font-medium'
                    : msg.isError
                    ? 'bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-950 dark:text-rose-200 rounded-tl-xs shadow-brutal-sm'
                    : 'bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-tl-xs shadow-brutal'
                }`}
              >
                {/* Header tag for assistant actions */}
                {msg.sender === 'assistant' && msg.action && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-display font-black px-2 py-0.5 rounded bg-[#00FF66] text-[#121212] border border-[#121212] uppercase tracking-wider">
                      {msg.action}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold font-display">Dompi AI</span>
                  </div>
                )}

                {/* Message text */}
                <div className="whitespace-pre-wrap font-medium">{msg.text}</div>

                {/* Operation result details if transactions affected */}
                {msg.affectedTransactions && msg.affectedTransactions.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {msg.affectedTransactions.map((trx, idx) => (
                      <div
                        key={trx.id || idx}
                        className="p-3 rounded-xl bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 space-y-1 text-xs text-zinc-800 dark:text-zinc-200 shadow-2xs font-mono"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-xs">
                            {trx.tipe === 'Pengeluaran' ? (
                              <TrendingDown className="w-3.5 h-3.5 text-[#FF4365] flex-shrink-0" />
                            ) : (
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            )}
                            <span className="truncate">{trx.deskripsi}</span>
                          </span>
                          <span className={`font-display font-black tabular-nums flex-shrink-0 ml-2 ${trx.tipe === 'Pengeluaran' ? 'text-[#FF4365]' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            Rp{Number(trx.nominal).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 pt-1.5 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-sans font-medium">
                          <span className="px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded border border-zinc-300 dark:border-zinc-700">{trx.kategori}</span>
                          <span>•</span>
                          <span>{trx.dompet || 'Cash'}</span>
                          <span>•</span>
                          <span>{trx.tanggal}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : msg.affectedTransaction ? (
                  <div className="mt-3 p-3 rounded-xl bg-[#FBF9F4] dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-800 space-y-1 text-xs text-zinc-800 dark:text-zinc-200 shadow-2xs font-mono">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-xs">
                        {msg.affectedTransaction.tipe === 'Pengeluaran' ? (
                          <TrendingDown className="w-3.5 h-3.5 text-[#FF4365] flex-shrink-0" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        )}
                        <span className="truncate">{msg.affectedTransaction.deskripsi}</span>
                      </span>
                      <span className={`font-display font-black tabular-nums flex-shrink-0 ml-2 ${msg.affectedTransaction.tipe === 'Pengeluaran' ? 'text-[#FF4365]' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        Rp{Number(msg.affectedTransaction.nominal).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 pt-1.5 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-sans font-medium">
                      <span className="px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded border border-zinc-300 dark:border-zinc-700">{msg.affectedTransaction.kategori}</span>
                      <span>•</span>
                      <span>{msg.affectedTransaction.dompet || 'Cash'}</span>
                      <span>•</span>
                      <span>{msg.affectedTransaction.tanggal}</span>
                    </div>
                  </div>
                ) : null}

                {msg.timestamp ? (
                  <div
                    suppressHydrationWarning
                    className={`text-[10px] mt-2 text-right font-display font-bold ${
                      msg.sender === 'user' ? 'text-[#121212]/70' : 'text-zinc-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 text-xs font-display font-bold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 px-4 py-3 rounded-2xl rounded-tl-xs shadow-brutal max-w-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FFE600] border border-[#121212] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#00F0FF] border border-[#121212] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#00FF66] border border-[#121212] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Dompi sedang berpikir...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 3 && !isLoading && (
          <div className="mb-4">
            <p className="text-[11px] font-display font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
              Contoh Perintah Cepat:
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(promptText)}
                  className="text-xs font-display font-bold bg-white dark:bg-zinc-900 hover:bg-[#FFE600] hover:text-[#121212] border-2 border-[#121212] dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 rounded-xl shadow-brutal-sm btn-brutal transition cursor-pointer text-left"
                >
                  &ldquo;{promptText}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-950 dark:text-rose-200 text-xs font-bold font-display flex items-center justify-between shadow-brutal-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 cursor-pointer font-black text-sm"
            >
              ×
            </button>
          </div>
        )}

        {/* Input Form Bar */}
        <div className="bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-2 flex items-center gap-2 shadow-brutal transition">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Tulis santai: 'Tadi makan bakso 35 ribu pakai Cash'..."
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none disabled:opacity-50 font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim()}
            className="bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] font-display font-black p-3 rounded-xl border-2 border-[#121212] shadow-brutal-sm btn-brutal transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer flex items-center gap-1.5"
            title="Kirim pesan"
            aria-label="Kirim pesan ke Dompi"
          >
            <span className="hidden sm:inline text-xs">Kirim</span>
            <Send className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </main>
    </div>
  )
}
