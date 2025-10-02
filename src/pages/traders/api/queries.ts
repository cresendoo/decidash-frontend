import {
  DeciDashConfig,
  getAccountPositions,
  getMarket,
  getMarketCandlesticks,
  getMarketPrice,
  MARKET_LIST,
  type MarketCandlesticks,
  type MarketCandlesticksInterval,
  type MarketPrice,
  type MarketTradeHistory,
  type UserPosition,
} from '@coldbell/decidash-ts-sdk'
import {
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

// ============================================
// Utility Types
// ============================================

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
}

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
// HTTP Utility Functions
// ============================================

const defaultHeaders = {
  'Content-Type': 'application/json',
}

export async function http<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', headers = {}, body } = options
  const res = await fetch(url, {
    method,
    headers: { ...defaultHeaders, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export function createDeciDashConfig(
  overrides: Partial<DeciDashConfig> = {},
): DeciDashConfig {
  return {
    ...DeciDashConfig.DEVNET,
    ...overrides,
    tradingVM: {
      ...DeciDashConfig.DEVNET.tradingVM,
      ...overrides.tradingVM,
    },
    node: {
      ...DeciDashConfig.DEVNET.node,
      ...overrides.node,
    },
    fetchFn: overrides.fetchFn ?? fetch,
    WebSocketCtor: overrides.WebSocketCtor ?? undefined,
  }
}

// 마켓 목록을 캐싱하기 위한 변수
let marketCache: Map<string, string> | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5분

export async function getMarketIdBySymbol(
  symbol: string,
): Promise<string> {
  const now = Date.now()

  // 캐시가 없거나 만료되었으면 새로 가져오기
  if (
    !marketCache ||
    !cacheTimestamp ||
    now - cacheTimestamp > CACHE_DURATION
  ) {
    try {
      const markets = await getMarket({
        decidashConfig: DeciDashConfig.DEVNET,
      })

      marketCache = new Map()
      for (const market of markets) {
        marketCache.set(
          market.market_name,
          market.market_addr,
        )
      }
      cacheTimestamp = now
    } catch (error) {
      // API 호출 실패시 기존 MARKET_LIST 폴백
      console.warn(
        'Failed to fetch markets from API, falling back to MARKET_LIST:',
        error,
      )
      return (
        MARKET_LIST[symbol] ||
        (() => {
          throw new Error(
            `Unknown market symbol: ${symbol}`,
          )
        })()
      )
    }
  }

  const marketId = marketCache.get(symbol)
  if (!marketId) {
    throw new Error(`Unknown market symbol: ${symbol}`)
  }

  return marketId
}

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

/**
 * Market Depth (오더북) 조회 - HTTP API
 * 초기 데이터 로딩용
 */
export interface MarketDepthResponse {
  bids: { price: number; size: number }[]
  asks: { price: number; size: number }[]
}

export const getMarketDepth = async (
  marketId: string,
  limit: number = 100,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
): Promise<MarketDepthResponse> => {
  const { fetchFn, tradingVM } = config
  const url = `${tradingVM.APIURL}/api/v1/depths?market=${marketId}&limit=${limit}`

  const response = await (fetchFn || fetch)(url)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch market depth: ${response.statusText}`,
    )
  }

  return await response.json()
}

/**
 * 사용자 포지션 조회
 */
export const useUserPositions = (
  userAddress: string | null,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<UserPosition[]>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'userPositions',
      userAddress,
      config.tradingVM.APIURL,
    ],
    queryFn: async () => {
      if (!userAddress) return []
      return await getAccountPositions({
        decidashConfig: config,
        user: userAddress,
        includeDeleted: false,
        limit: 100,
      })
    },
    enabled: !!userAddress,
    staleTime: 1000 * 30, // 30초
    ...options,
  })
}

/**
 * 사용자 거래 내역 조회 - HTTP API 직접 호출
 */
export const getUserTradeHistory = async (
  userAddress: string,
  limit: number = 50,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
): Promise<MarketTradeHistory[]> => {
  const { fetchFn, tradingVM } = config
  const url = `${tradingVM.APIURL}/api/v1/trade_history?user=${userAddress}&limit=${limit}`

  const response = await (fetchFn || fetch)(url)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch trade history: ${response.statusText}`,
    )
  }

  return await response.json()
}

export const useUserTradeHistory = (
  userAddress: string | null,
  limit: number = 50,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
  options?: Omit<
    UseQueryOptions<MarketTradeHistory[]>,
    'queryKey' | 'queryFn'
  >,
) => {
  return useQuery({
    queryKey: [
      'userTradeHistory',
      userAddress,
      limit,
      config.tradingVM.APIURL,
    ],
    queryFn: async () => {
      if (!userAddress) return []
      return await getUserTradeHistory(
        userAddress,
        limit,
        config,
      )
    },
    enabled: !!userAddress,
    staleTime: 1000 * 30, // 30초
    ...options,
  })
}
