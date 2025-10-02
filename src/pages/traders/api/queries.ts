import {
  DeciDashConfig,
  getMarket,
  getMarketCandlesticks,
  getMarketPrice,
  type MarketCandlesticks,
  type MarketCandlesticksInterval,
  type MarketPrice,
} from '@coldbell/decidash-ts-sdk'
import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

import { getMarketIdBySymbol } from '@/shared/api/client'

// ============================================
// Re-export types for convenience
// ============================================
export type {
  MarketCandlesticks,
  MarketCandlesticksInterval,
  MarketPrice,
} from '@coldbell/decidash-ts-sdk'

// Re-export websocket hook types
export type {
  DepthLevel,
  MarketDepth,
} from './websocket-hooks'

// ============================================
// HTTP 방식 React Query Hooks
// ============================================

/**
 * 마켓 목록 조회
 */
export const useMarkets = (
  config: DeciDashConfig = DeciDashConfig.DEVNET,
) => {
  return useQuery({
    queryKey: ['markets', config.tradingVM.APIURL],
    queryFn: async () => {
      const markets = await getMarket({
        decidashConfig: config,
      })
      return markets
    },
    staleTime: 5 * 60_000, // 5분
  })
}

/**
 * 마켓 이름 목록 조회 (심플 버전)
 */
export const useMarketNames = (
  config: DeciDashConfig = DeciDashConfig.DEVNET,
) => {
  return useQuery({
    queryKey: ['marketNames', config.tradingVM.APIURL],
    queryFn: async () => {
      const markets = await getMarket({
        decidashConfig: config,
      })
      return markets.map((m) => m.market_name)
    },
    staleTime: 5 * 60_000, // 5분
  })
}

/**
 * 특정 마켓의 현재 가격 조회
 */
export const useMarketPrice = (
  marketSymbol: string,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<number>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'marketPrice',
      marketSymbol,
      config.tradingVM.APIURL,
    ],
    queryFn: async () => {
      const marketId =
        await getMarketIdBySymbol(marketSymbol)
      const priceData = await getMarketPrice({
        decidashConfig: config,
        market: marketId,
      })
      return priceData.length > 0 ? priceData[0].mark_px : 0
    },
    enabled: !!marketSymbol,
    staleTime: 1000 * 60, // 1분
    refetchInterval: 1000 * 5, // 5초마다 자동 업데이트
    ...options,
  })
}

/**
 * 특정 마켓의 전체 가격 정보 조회
 */
export const useMarketPriceDetail = (
  marketSymbol: string,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<MarketPrice[]>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'marketPriceDetail',
      marketSymbol,
      config.tradingVM.APIURL,
    ],
    queryFn: async () => {
      const marketId =
        await getMarketIdBySymbol(marketSymbol)
      const priceData = await getMarketPrice({
        decidashConfig: config,
        market: marketId,
      })
      return priceData
    },
    enabled: !!marketSymbol,
    staleTime: 1000 * 60, // 1분
    ...options,
  })
}

/**
 * 캔들스틱 데이터 조회
 */
export const useMarketCandlesticks = (
  marketSymbol: string,
  interval: MarketCandlesticksInterval,
  startTime: number,
  endTime: number,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<MarketCandlesticks[]>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'candlesticks',
      marketSymbol,
      interval,
      startTime,
      endTime,
      config.tradingVM.APIURL,
    ],
    queryFn: async () => {
      const marketId =
        await getMarketIdBySymbol(marketSymbol)
      const candlestickData = await getMarketCandlesticks({
        decidashConfig: config,
        market: marketId,
        interval,
        startTime,
        endTime,
      })
      return candlestickData
    },
    enabled:
      !!marketSymbol &&
      !!interval &&
      !!startTime &&
      !!endTime,
    staleTime: 1000 * 60 * 5, // 5분
    ...options,
  })
}

/**
 * 마켓 심볼로 마켓 ID를 조회
 */
export const useMarketId = (marketSymbol: string) => {
  return useQuery({
    queryKey: ['marketId', marketSymbol],
    queryFn: async () => {
      return await getMarketIdBySymbol(marketSymbol)
    },
    enabled: !!marketSymbol,
    staleTime: 5 * 60_000, // 5분 (마켓 ID는 자주 변경되지 않음)
  })
}
