import {
  type AccountOverviews,
  DeciDashConfig,
  getAccountOverviews,
  getPortfolioChart,
  type PortfolioChartDataType,
  type PortfolioChartPoint,
  type PortfolioChartRange,
} from '@coldbell/decidash-ts-sdk'
import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

export type { DeciDashConfig } from '@coldbell/decidash-ts-sdk'

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
