"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

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
    <div className="min-h-screen bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative font-sans">
      {/* Theme toggle in top right corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      {/* Main card */}
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-7 shadow-sm">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Logo Dompi"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
                priority
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold tracking-tight">dompi</span>
              <span className="text-[10px] font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded uppercase">
                Pro
              </span>
            </div>
          </div>
          <h1 className="text-lg font-semibold">
            {mode === "login" ? "Masuk ke Akun Anda" : "Buat Akun Baru"}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 text-center">
            {mode === "login"
              ? "Kelola dan pantau catatan keuangan Anda dengan aman."
              : "Mulai catat keuangan pribadi dengan asisten cerdas Dompi."}
          </p>
        </div>

        {/* Feedback notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs leading-relaxed">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs leading-relaxed">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1" htmlFor="email">
              Email
            </label>
            <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition">
              <Mail className="w-4 h-4 text-zinc-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="bg-transparent border-none outline-none text-xs sm:text-sm w-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1" htmlFor="password">
              Kata Sandi
            </label>
            <div className="flex items-center gap-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition">
              <Lock className="w-4 h-4 text-zinc-400" />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none text-xs sm:text-sm w-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              />
            </div>
            {mode === "register" && (
              <p className="text-[11px] text-zinc-400 mt-1">Minimal 6 karakter.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-zinc-900 font-medium py-2.5 px-4 rounded-lg transition text-xs sm:text-sm mt-5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : mode === "login" ? (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Daftar Akun</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
          {mode === "login" ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register")
                  setError(null)
                  setMessage(null)
                }}
                className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline underline-offset-4 transition ml-1 cursor-pointer"
              >
                Daftar sekarang
              </button>
            </p>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Sudah memiliki akun?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login")
                  setError(null)
                  setMessage(null)
                }}
                className="text-zinc-900 dark:text-zinc-100 font-medium hover:underline underline-offset-4 transition ml-1 cursor-pointer"
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
