export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

import { DeciDashConfig, getMarket,getTradersDashboard, MARKET_LIST } from '@coldbell/decidash-ts-sdk'

export interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
}

const defaultHeaders = {
  'Content-Type': 'application/json',
}

export async function http<T>(url: string, options: RequestOptions = {}): Promise<T> {
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

// DeciDash SDK helpers

export function createDeciDashConfig(overrides: Partial<DeciDashConfig> = {}): DeciDashConfig {
  return {
    ...DeciDashConfig.DEVNET,
    ...overrides,
    tradingVM: { ...DeciDashConfig.DEVNET.tradingVM, ...overrides.tradingVM },
    node: { ...DeciDashConfig.DEVNET.node, ...overrides.node },
    fetchFn: overrides.fetchFn ?? fetch,
    WebSocketCtor: overrides.WebSocketCtor ?? undefined,
  }
}

// 마켓 목록을 캐싱하기 위한 변수
let marketCache: Map<string, string> | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5분

export async function getMarketIdBySymbol(symbol: string): Promise<string> {
  const now = Date.now()

  // 캐시가 없거나 만료되었으면 새로 가져오기
  if (!marketCache || !cacheTimestamp || (now - cacheTimestamp) > CACHE_DURATION) {
    try {
      const markets = await getMarket({
        decidashConfig: DeciDashConfig.DEVNET
      })

      marketCache = new Map()
      for (const market of markets) {
        marketCache.set(market.market_name, market.market_addr)
      }
      cacheTimestamp = now
    } catch (error) {
      // API 호출 실패시 기존 MARKET_LIST 폴백
      console.warn('Failed to fetch markets from API, falling back to MARKET_LIST:', error)
      return MARKET_LIST[symbol] || (() => { throw new Error(`Unknown market symbol: ${symbol}`) })()
    }
  }

  const marketId = marketCache.get(symbol)
  if (!marketId) {
    throw new Error(`Unknown market symbol: ${symbol}`)
  }

  return marketId
}
