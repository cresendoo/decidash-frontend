import {
  type DashboardSummary,
  DeciDashConfig,
  getTraders,
  getTradersDashboard,
  type TradersResponse,
} from '@coldbell/decidash-ts-sdk'
import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

// ============================================
// Re-export types for convenience
// ============================================
export type {
  DashboardSummary,
  Trader,
  TradersResponse,
} from '@coldbell/decidash-ts-sdk'

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

// ============================================
// Traders Query Hook
// ============================================

export interface UseTradersPagination {
  page?: number
  perPage?: number
  search?: string
  sortBy?: string
  sortDesc?: boolean
}

/**
 * 트레이더 목록 조회 (페이지네이션, 검색, 정렬 지원)
 *
 * @param config - DeciDash 설정
 * @param pagination - 페이지네이션 및 필터 옵션
 * @param options - React Query 옵션
 */
export const useTraders = (
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  pagination: UseTradersPagination = {},
  options?: Omit<
    UseQueryOptions<TradersResponse>,
    'queryKey' | 'queryFn'
  >,
) => {
  const {
    page = 1,
    perPage = 50,
    search,
    sortBy,
    sortDesc,
  } = pagination

  return useQuery({
    queryKey: [
      'traders',
      config.DeciDash,
      page,
      perPage,
      search,
      sortBy,
      sortDesc,
    ],
    queryFn: async () => {
      const data = await getTraders({
        decidashConfig: config,
        page,
        perPage,
        search,
        sortBy,
        sortDesc,
      })
      return data
    },
    staleTime: 1000 * 60, // 1분
    refetchInterval: 1000 * 30, // 30초마다 자동 업데이트
    ...options,
  })
}
