'use server'

import { revalidatePath } from 'next/cache'
import {
  createWallet,
  updateWallet,
  deleteWallet,
  WalletInput,
  ServiceResult,
  WalletRecord,
} from '@/lib/services/wallet-service'

export async function createWalletAction(
  input: WalletInput
): Promise<ServiceResult<WalletRecord>> {
  const result = await createWallet(input)

  if (result.success) {
    revalidatePath('/dompet')
    revalidatePath('/')
    revalidatePath('/transaksi')
    revalidatePath('/chat')
  }

  return result
}

export async function updateWalletAction(
  walletId: number,
  input: Partial<WalletInput>
): Promise<ServiceResult<WalletRecord>> {
  const result = await updateWallet(walletId, input)

  if (result.success) {
    revalidatePath('/dompet')
    revalidatePath('/')
    revalidatePath('/transaksi')
    revalidatePath('/chat')
  }

  return result
}

export async function deleteWalletAction(
  walletId: number
): Promise<ServiceResult<{ id: number; nama: string }>> {
  const result = await deleteWallet(walletId)

  if (result.success) {
    revalidatePath('/dompet')
    revalidatePath('/')
    revalidatePath('/transaksi')
    revalidatePath('/chat')
  }

  return result
}
