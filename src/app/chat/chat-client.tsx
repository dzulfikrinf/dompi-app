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
  'Ubah transaksi kopi terakhir jadi 25 ribu',
  'Hapus transaksi makan tadi',
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
    <div className="min-h-screen bg-[#050811] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Header */}
      <header className="h-18 border-b border-slate-800/80 bg-[#0a0f1c]/90 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition p-2 rounded-xl hover:bg-slate-800/60"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight leading-none flex items-center gap-2">
                Chat Dompi
                <span className="text-[10px] uppercase font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                  AI Assistant
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">{userEmail || 'Masjul'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUndo}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer disabled:opacity-50"
            title="Pulihkan transaksi terakhir yang baru dihapus"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Batalkan Penghapusan</span>
          </button>
          <Link
            href="/transaksi"
            className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daftar Transaksi</span>
          </Link>
        </div>
      </header>

      {/* Chat Messages Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col animate-fade-in-up ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed transition-all ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-[0_4px_12px_rgba(34,211,238,0.15)]'
                    : msg.isError
                    ? 'bg-rose-950/40 border border-rose-800/60 text-rose-200 rounded-bl-none'
                    : 'bg-[#0f172a] border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {/* Header tag for assistant actions */}
                {msg.sender === 'assistant' && msg.action && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        msg.action === 'TAMBAH'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : msg.action === 'UBAH'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          : msg.action === 'HAPUS'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                          : msg.action === 'UNDO'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {msg.action}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Dompi</span>
                  </div>
                )}

                {/* Message text */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Operation result details if transaction affected */}
                {msg.affectedTransaction && (
                  <div className="mt-3 p-3 rounded-xl bg-[#0a0f1c] border border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1.5">
                        {msg.affectedTransaction.tipe === 'Pengeluaran' ? (
                          <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        {msg.affectedTransaction.deskripsi}
                      </span>
                      <span
                        className={
                          msg.affectedTransaction.tipe === 'Pengeluaran'
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }
                      >
                        Rp{Number(msg.affectedTransaction.nominal).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 pt-1 border-t border-slate-800/60">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-500" />
                        {msg.affectedTransaction.kategori}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {msg.affectedTransaction.dompet || 'Tunai'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {msg.affectedTransaction.tanggal}
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className={`text-[10px] mt-2 text-right ${
                    msg.sender === 'user' ? 'text-cyan-200' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 text-sm text-slate-300 bg-[#0f172a] border border-slate-800 p-3.5 rounded-2xl rounded-bl-none max-w-xs animate-fade-in shadow-md">
              <div className="flex items-center gap-1.5 py-1 px-1 flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-typing-dot" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-typing-dot" style={{ animationDelay: '200ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-typing-dot" style={{ animationDelay: '400ms' }} />
              </div>
              <span className="text-xs text-slate-400">Dompi sedang berpikir...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 3 && !isLoading && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2 font-medium">Contoh perintah cepat:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(promptText)}
                  className="text-xs bg-[#0f172a] hover:bg-[#111c3a] border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 px-3 py-1.5 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer text-left"
                >
                  &ldquo;{promptText}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        {/* Input Form Bar */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-2 flex items-center gap-2 shadow-xl focus-within:border-cyan-500/50 transition">
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
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim()}
            className="bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 font-bold p-2.5 rounded-xl transition-all duration-150 shadow-[0_0_15px_rgba(34,211,238,0.25)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
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
