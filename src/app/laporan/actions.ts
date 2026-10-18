'use server'

import { requireAuthUser } from '@/lib/auth'
import { getFinancialAnalysis, AnalyticsPeriod } from '@/lib/services/analytics-service'

export async function fetchFinancialAnalysisAction(period: AnalyticsPeriod) {
  const user = await requireAuthUser()
  return await getFinancialAnalysis(period, { userId: user.id })
}
