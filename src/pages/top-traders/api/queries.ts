import {
  type DashboardSummary,
  DeciDashConfig,
  getTradersDashboard,
} from '@coldbell/decidash-ts-sdk'
import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

// ============================================
// Re-export types for convenience
// ============================================
export type { DashboardSummary } from '@coldbell/decidash-ts-sdk'

// ============================================
// React Query Hooks
// ============================================

/**
 * 트레이더 대시보드 요약 정보 조회
 *
 * Market Sentiment, Top Performer, Asset Concentration, Trader Profitability 등의 정보를 포함합니다.
 */
export const useTradersDashboard = (
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<DashboardSummary>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['tradersDashboard', config.DeciDash],
    queryFn: async () => {
      const data = await getTradersDashboard({
        decidashConfig: config,
      })
      return data
    },
    staleTime: 1000 * 60, // 1분
    refetchInterval: 1000 * 30, // 30초마다 자동 업데이트
    ...options,
  })
}
