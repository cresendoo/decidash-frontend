import {
  type AccountOverviews,
  DeciDashConfig,
  type FundingRateHistoryEntry,
  getAccountOverviews,
  getAccountPositions,
  getMarkets,
  getPortfolioChart,
  getUserFundingRateHistory,
  getUserOpenOrders,
  getUserTradeHistory,
  type Market,
  type MarketTradeHistory,
  type OpenOrder,
  type PortfolioChartDataType,
  type PortfolioChartPoint,
  type PortfolioChartRange,
  type UserPosition,
} from '@coldbell/decidash-ts-sdk'
import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

export type { DeciDashConfig } from '@coldbell/decidash-ts-sdk'

// ============================================
// Markets Query
// ============================================

export const useMarkets = (
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<Market[]>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: ['markets', config.tradingVM.APIURL],
    queryFn: async () => {
      console.log('[useMarkets] Fetching markets...')

      try {
        const res = await getMarkets({
          decidashConfig: config,
        })

        console.log('[useMarkets] Response:', res)

        return res
      } catch (err) {
        console.error('[useMarkets] Error:', err)
        throw err
      }
    },
    staleTime: 300_000, // 5분
    refetchInterval: 300_000,
    ...options,
  })
}

// ============================================
// Account Overviews Query
// ============================================

export const useAccountOverviews = (
  address: string | null,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<AccountOverviews | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'accountOverviews',
      config.DeciDash,
      address,
    ],
    queryFn: async () => {
      if (!address) {
        console.log(
          '[useAccountOverviews] No address provided',
        )
        return null
      }

      console.log(
        '[useAccountOverviews] Fetching for address:',
        address,
      )

      try {
        const res = await getAccountOverviews({
          decidashConfig: config,
          user: address,
        })

        console.log('[useAccountOverviews] Response:', res)

        return res
      } catch (err) {
        console.error('[useAccountOverviews] Error:', err)
        throw err
      }
    },
    enabled: !!address,
    staleTime: 60_000,
    refetchInterval: 30_000,
    ...options,
  })
}

// ============================================
// Portfolio Chart Query
// ============================================

export const usePortfolioChart = (
  address: string | null,
  range: PortfolioChartRange = '1d',
  dataType: PortfolioChartDataType = 'pnl',
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<PortfolioChartPoint[] | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'portfolioChart',
      config.DeciDash,
      address,
      range,
      dataType,
    ],
    queryFn: async () => {
      if (!address) {
        console.log(
          '[usePortfolioChart] No address provided',
        )
        return null
      }

      console.log('[usePortfolioChart] Fetching:', {
        address,
        range,
        dataType,
      })

      try {
        const res = await getPortfolioChart({
          decidashConfig: config,
          user: address,
          range,
          dataType,
        })

        console.log('[usePortfolioChart] Response:', res)

        return res
      } catch (err) {
        console.error('[usePortfolioChart] Error:', err)
        throw err
      }
    },
    enabled: !!address,
    staleTime: 60_000,
    refetchInterval: 30_000,
    ...options,
  })
}

// ============================================
// Account Positions Query
// ============================================

export const useAccountPositions = (
  address: string | null,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<UserPosition[] | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'accountPositions',
      config.tradingVM.APIURL,
      address,
    ],
    queryFn: async () => {
      if (!address) {
        console.log(
          '[useAccountPositions] No address provided',
        )
        return null
      }

      console.log(
        '[useAccountPositions] Fetching for address:',
        address,
      )

      try {
        const res = await getAccountPositions({
          decidashConfig: config,
          user: address,
          includeDeleted: false,
          limit: 100,
        })

        console.log('[useAccountPositions] Response:', res)

        return res
      } catch (err) {
        console.error('[useAccountPositions] Error:', err)
        throw err
      }
    },
    enabled: !!address,
    staleTime: 30_000,
    refetchInterval: 15_000,
    ...options,
  })
}

// ============================================
// User Open Orders Query
// ============================================

export const useUserOpenOrders = (
  address: string | null,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<OpenOrder[] | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'userOpenOrders',
      config.tradingVM.APIURL,
      address,
    ],
    queryFn: async () => {
      if (!address) {
        console.log(
          '[useUserOpenOrders] No address provided',
        )
        return null
      }

      console.log(
        '[useUserOpenOrders] Fetching for address:',
        address,
      )

      try {
        const res = await getUserOpenOrders({
          decidashConfig: config,
          user: address,
        })
        console.log('[useUserOpenOrders] Response:', res)
        return res
      } catch (err) {
        console.error('[useUserOpenOrders] Error:', err)
        throw err
      }
    },
    enabled: !!address,
    staleTime: 30_000,
    refetchInterval: 15_000,
    ...options,
  })
}

// ============================================
// User Trade History Query (Recent Fills)
// ============================================

export const useUserTradeHistory = (
  address: string | null,
  limit: number = 50,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<MarketTradeHistory[] | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'userTradeHistory',
      config.tradingVM.APIURL,
      address,
      limit,
    ],
    queryFn: async () => {
      if (!address) {
        console.log(
          '[useUserTradeHistory] No address provided',
        )
        return null
      }

      console.log(
        '[useUserTradeHistory] Fetching for address:',
        address,
      )

      try {
        const res = await getUserTradeHistory({
          decidashConfig: config,
          user: address,
          limit,
        })
        console.log('[useUserTradeHistory] Response:', res)
        return res
      } catch (err) {
        console.error('[useUserTradeHistory] Error:', err)
        throw err
      }
    },
    enabled: !!address,
    staleTime: 30_000,
    refetchInterval: 15_000,
    ...options,
  })
}

// ============================================
// Funding Rate History Query
// ============================================

export const useFundingRateHistory = (
  address: string | null,
  limit: number = 50,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<FundingRateHistoryEntry[] | null>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'fundingRateHistory',
      config.tradingVM.APIURL,
      address,
      limit,
    ],
    queryFn: async () => {
      if (!address) {
        console.log(
          '[useFundingRateHistory] No address provided',
        )
        return null
      }

      console.log(
        '[useFundingRateHistory] Fetching for address:',
        address,
      )

      try {
        const res = await getUserFundingRateHistory({
          decidashConfig: config,
          user: address,
          limit,
        })
        console.log(
          '[useFundingRateHistory] Response:',
          res,
        )
        return res
      } catch (err) {
        console.error('[useFundingRateHistory] Error:', err)
        throw err
      }
    },
    enabled: !!address,
    staleTime: 60_000,
    refetchInterval: 30_000,
    ...options,
  })
}

// ============================================
// Note: Completed Trades
// ============================================
// SDK에 getCompletedTrades 함수가 없으므로
// getUserTradeHistory를 사용하여 완료된 거래를 표시합니다.

export const useCompletedTrades = useUserTradeHistory
