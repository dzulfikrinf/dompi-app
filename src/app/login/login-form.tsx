"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Mail, Lock, Loader2, ArrowRight, ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const errParam = new URLSearchParams(window.location.search).get("error")
      if (errParam) return decodeURIComponent(errParam)
    }
    return null
  })
  const [message, setMessage] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const verifiedParam = params.get("verified")
      const msgParam = params.get("message")
      if (verifiedParam === "true") {
        return "Email Anda berhasil diverifikasi! Silakan masuk ke akun Anda."
      }
      if (msgParam) return decodeURIComponent(msgParam)
    }
    return null
  })

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
          } else if (signInError.message.toLowerCase().includes("email not confirmed")) {
            setError("Email Anda belum dikonfirmasi. Silakan buka tautan konfirmasi di kotak masuk email Anda.")
          } else {
            setError(signInError.message)
          }
          setLoading(false)
          return
        }

        router.push("/beranda")
        router.refresh()
      } else {
        if (password.length < 6) {
          setError("Kata sandi minimal 6 karakter.")
          setLoading(false)
          return
        }

        // Dapatkan origin saat ini (misal https://dompi.app atau http://localhost:3000)
        const redirectOrigin =
          typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL || ""

        const emailRedirectTo = redirectOrigin
          ? `${redirectOrigin}/auth/callback?next=/beranda`
          : undefined

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }

        if (data.session) {
          router.push("/beranda")
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
    <div className="min-h-screen bg-[#FBF9F4] dark:bg-[#0F1011] text-[#121212] dark:text-[#FBF9F4] flex flex-col justify-center items-center px-4 py-12 relative font-sans selection:bg-[#FFE600] selection:text-[#121212]">
      {/* Top action buttons */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 text-xs font-display font-bold shadow-brutal-sm btn-brutal transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Ke Landing Page</span>
        </Link>
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      {/* Main card */}
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border-2 border-[#121212] dark:border-zinc-700 rounded-2xl p-6 sm:p-8 shadow-brutal">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#FFE600] border-2 border-[#121212] flex items-center justify-center p-2 mb-3 shadow-brutal-sm">
            <Image
              src="/logo.png"
              alt="Logo Dompi"
              width={40}
              height={40}
              className="w-8 h-8 object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-2xl font-black font-display tracking-tight text-zinc-950 dark:text-zinc-50">
              Dompi.
            </span>
            <span className="text-[10px] font-display font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFE600] text-[#121212] border-2 border-[#121212]">
              AI FINANSIAL
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold font-display text-zinc-900 dark:text-zinc-100">
            {mode === "login" ? "Masuk ke Akun Anda" : "Buat Akun Baru"}
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
            {mode === "login"
              ? "Kelola dan pantau catatan keuanganmu tanpa ribet."
              : "Mulai rapikan dompetmu bersama asisten cerdas Dompi."}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login")
              setError(null)
              setMessage(null)
            }}
            className={`py-1.5 text-xs font-display font-extrabold rounded-lg transition cursor-pointer ${
              mode === "login"
                ? "bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register")
              setError(null)
              setMessage(null)
            }}
            className={`py-1.5 text-xs font-display font-extrabold rounded-lg transition cursor-pointer ${
              mode === "register"
                ? "bg-[#FFE600] text-[#121212] border-2 border-[#121212] shadow-brutal-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Feedback notifications */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-500 text-rose-950 dark:text-rose-200 text-xs font-medium leading-relaxed shadow-brutal-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-500 text-amber-950 dark:text-amber-200 text-xs font-medium leading-relaxed shadow-brutal-sm">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1" htmlFor="email">
              Email
            </label>
            <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#FFE600] shadow-brutal-sm transition">
              <Mail className="w-4 h-4 text-zinc-400" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="bg-transparent border-none outline-none text-xs sm:text-sm w-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-display font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1" htmlFor="password">
              Kata Sandi
            </label>
            <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-950 border-2 border-[#121212] dark:border-zinc-700 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#FFE600] shadow-brutal-sm transition">
              <Lock className="w-4 h-4 text-zinc-400" />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none text-xs sm:text-sm w-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-medium"
              />
            </div>
            {mode === "register" && (
              <p className="text-[11px] text-zinc-500 mt-1">Minimal 6 karakter.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#FFE600] hover:bg-[#ffe81a] text-[#121212] font-display font-black py-3 px-4 rounded-xl border-2 border-[#121212] shadow-brutal btn-brutal transition text-xs sm:text-sm mt-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : mode === "login" ? (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            ) : (
              <>
                <span>Daftar Akun Gratis</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
