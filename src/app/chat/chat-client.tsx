'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Tag,
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
  affectedTransaction?: {
    id: number
    tanggal: string
    kategori: string
    nominal: number
    tipe: 'Pengeluaran' | 'Pemasukan'
    dompet?: string
    deskripsi: string
  }
  isError?: boolean
}

const SAMPLE_PROMPTS = [
  'Tadi makan siang 35 ribu pakai BCA',
  'Catat gaji 8 juta masuk ke BCA',
  'Cek saldo semua dompet',
  'Tambah dompet Seabank saldo 500rb',
  'Berapa pengeluaranku bulan ini?',
]

export default function ChatClient({ userEmail }: { userEmail?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Halo! Saya Dompi, asisten keuangan pribadimu. Kamu bisa menyuruhku mencatat, mengubah, menghapus, atau merangkum pengeluaranmu dengan bahasa santai sehari-hari.',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputValue, setInputValue] = useState('')
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

    try {
      const res: ChatActionResult = await sendChatMessageAction(text)

      if (res.success && res.reply) {
        const assistantMessage: Message = {
          id: 'res-' + Date.now(),
          sender: 'assistant',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          action: res.geminiOutput?.action,
          affectedTransaction: res.affectedTransaction,
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
    <div className="min-h-screen bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-zinc-900">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition flex-shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold tracking-tight leading-none flex items-center gap-1.5 truncate">
                <span>Chat Dompi</span>
                <span className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1.5 py-0.2 rounded">
                  AI
                </span>
              </h1>
              <p className="hidden sm:block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[200px]">{userEmail || 'Masjul'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <ThemeToggle />
          <button
            onClick={handleUndo}
            disabled={isLoading}
            className="inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:px-3 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition cursor-pointer disabled:opacity-40"
            title="Pulihkan transaksi terakhir yang baru dihapus"
            aria-label="Batalkan penghapusan terakhir"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5">Batalkan</span>
          </button>
          <Link
            href="/transaksi"
            className="inline-flex items-center justify-center w-9 h-9 sm:w-auto sm:px-3 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition"
            title="Buka Riwayat Transaksi"
            aria-label="Buka Riwayat Transaksi"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5">Riwayat</span>
          </Link>
        </div>
      </header>

      {/* Chat Messages Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-3.5 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-br-sm'
                    : msg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-bl-sm'
                    : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-sm'
                }`}
              >
                {/* Header tag for assistant actions */}
                {msg.sender === 'assistant' && msg.action && (
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase tracking-wider">
                      {msg.action}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">Dompi</span>
                  </div>
                )}

                {/* Message text */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Operation result details if transaction affected */}
                {msg.affectedTransaction && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs text-zinc-700 dark:text-zinc-350">
                    <div className="flex items-center justify-between font-medium">
                      <span className="flex items-center gap-1.5">
                        {msg.affectedTransaction.tipe === 'Pengeluaran' ? (
                          <TrendingDown className="w-3.5 h-3.5 text-zinc-500" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                        {msg.affectedTransaction.deskripsi}
                      </span>
                      <span className="font-semibold tabular-nums">
                        Rp{Number(msg.affectedTransaction.nominal).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200 dark:border-zinc-800 text-[11px]">
                      <span>{msg.affectedTransaction.kategori}</span>
                      <span>•</span>
                      <span>{msg.affectedTransaction.dompet || 'Tunai'}</span>
                      <span>•</span>
                      <span>{msg.affectedTransaction.tanggal}</span>
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    msg.sender === 'user' ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2.5 text-sm text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 rounded-xl rounded-bl-sm max-w-xs">
              <div className="flex items-center gap-1 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs">Dompi sedang berpikir...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 3 && !isLoading && (
          <div className="mb-3">
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-1.5 font-medium">Contoh perintah cepat:</p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(promptText)}
                  className="text-xs bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1.5 rounded-lg transition active:scale-98 cursor-pointer text-left"
                >
                  &ldquo;{promptText}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 cursor-pointer text-sm leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Input Form Bar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5 flex items-center gap-2 shadow-sm focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition">
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
            placeholder="Tulis pesan ke Dompi... (contoh: Tadi makan siang 35 ribu pakai BCA)"
            disabled={isLoading}
            className="flex-1 bg-transparent px-2.5 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim()}
            className="bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 text-white dark:text-zinc-900 font-medium p-2 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
            title="Kirim pesan"
            aria-label="Kirim pesan ke Dompi"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  )
}
