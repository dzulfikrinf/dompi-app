"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react"

export default function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const supabase = createClient()

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          if (signInError.message.toLowerCase().includes("invalid login credentials")) {
            setError("Email atau kata sandi tidak valid.")
          } else {
            setError(signInError.message)
          }
          setLoading(false)
          return
        }

        router.push("/")
        router.refresh()
      } else {
        if (password.length < 6) {
          setError("Kata sandi minimal 6 karakter.")
          setLoading(false)
          return
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }

        if (data.session) {
          router.push("/")
          router.refresh()
        } else {
          setMessage(
            "Pendaftaran berhasil! Jika konfirmasi email aktif, silakan periksa kotak masuk Anda atau coba masuk."
          )
          setLoading(false)
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.")
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#050811] text-slate-200 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-[#0a0f1c] border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex flex-col items-center gap-2 mb-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 hover:scale-105">
              <Image
                src="/logo.png"
                alt="Logo Dompi"
                width={64}
                height={64}
                className="w-16 h-16 object-contain drop-shadow-xl"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">dompi</span>
              <span className="text-[10px] font-bold border border-cyan-500/50 bg-[#0f172a] text-cyan-400 px-2 py-0.5 rounded-full uppercase">
                Pro
              </span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">
            {mode === "login" ? "Masuk ke Akun Anda" : "Buat Akun Baru"}
          </h1>
          <p className="text-xs text-slate-400 mt-1 text-center">
            {mode === "login"
              ? "Kelola dan pantau catatan keuangan Anda dengan aman."
              : "Mulai catat keuangan pribadi dengan asisten cerdas Dompi."}
          </p>
        </div>

        {/* Feedback notifications */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs leading-relaxed">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs leading-relaxed">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="email">
              Email
            </label>
            <div className="flex items-center gap-3 bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/40 transition">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="password">
              Kata Sandi
            </label>
            <div className="flex items-center gap-3 bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/40 transition">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate-500"
              />
            </div>
            {mode === "register" && (
              <p className="text-[11px] text-slate-500 mt-1">Minimal 6 karakter.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.25)] mt-6 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : mode === "login" ? (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Daftar Akun</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center">
          {mode === "login" ? (
            <p className="text-xs text-slate-400">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register")
                  setError(null)
                  setMessage(null)
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition ml-1 cursor-pointer"
              >
                Daftar sekarang
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Sudah memiliki akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login")
                  setError(null)
                  setMessage(null)
                }}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition ml-1 cursor-pointer"
              >
                Masuk di sini
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
