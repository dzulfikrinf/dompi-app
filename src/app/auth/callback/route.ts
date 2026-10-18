import { NextResponse } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams, origin } = requestUrl

  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Tentukan base URL (mendukung proxy / load balancer Vercel via x-forwarded-host)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const isLocalEnv = process.env.NODE_ENV === 'development'

  const baseUrl = isLocalEnv
    ? origin
    : forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : origin

  let next = searchParams.get('next') ?? '/beranda'
  if (!next.startsWith('/')) {
    next = '/beranda'
  }

  // Jika ada laporan error langsung dari Supabase Auth
  if (error || errorDescription) {
    const errorMsg = errorDescription || error || 'Konfirmasi email gagal.'
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(errorMsg)}`)
  }

  const supabase = await createClient()

  // 1. Alur PKCE: Tukar kode otorisasi menjadi sesi pengguna aktif
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
    console.error('Error saat exchange auth code:', exchangeError.message)
  }

  // 2. Alur Token Hash: Verifikasi OTP langsung
  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!verifyError) {
      return NextResponse.redirect(`${baseUrl}${next}`)
    }
    console.error('Error saat verifikasi OTP token_hash:', verifyError.message)
  }

  // Fallback: Jika kode/token tidak valid atau sudah kedaluwarsa
  return NextResponse.redirect(
    `${baseUrl}/login?error=${encodeURIComponent(
      'Tautan konfirmasi email tidak valid atau sudah kedaluwarsa. Silakan coba masuk atau daftar ulang.'
    )}`
  )
}
