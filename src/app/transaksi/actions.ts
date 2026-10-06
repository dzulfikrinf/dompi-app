'use server'

import { revalidatePath } from 'next/cache'
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  undoDeleteTransaction,
  TransactionInput,
} from '@/lib/services/transaction-service'

export type ActionResponse<T = unknown> = {
  success: boolean
  error?: string
  data?: T
}

export type { TransactionInput }

export async function createTransactionAction(
  input: TransactionInput
): Promise<ActionResponse> {
  const result = await createTransaction(input)
  if (result.success) {
    revalidatePath('/transaksi')
    revalidatePath('/')
  }
  return result
}

export async function updateTransactionAction(
  id: number,
  input: TransactionInput
): Promise<ActionResponse> {
  const result = await updateTransaction(id, input)
  if (result.success) {
    revalidatePath('/transaksi')
    revalidatePath('/')
  }
  return result
}

export async function deleteTransactionAction(id: number): Promise<ActionResponse> {
  const result = await deleteTransaction(id)
  if (result.success) {
    revalidatePath('/transaksi')
    revalidatePath('/')
  }
  return result
}

export async function undoDeleteTransactionAction(id?: number): Promise<ActionResponse> {
  const result = await undoDeleteTransaction(id)
  if (result.success) {
    revalidatePath('/transaksi')
    revalidatePath('/')
  }
  return result
}
