export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

import { DeciDashConfig, MARKET_LIST } from '@coldbell/decidash-ts-sdk'

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

export function getMarketIdBySymbol(symbol: string): string {
  const id = MARKET_LIST[symbol]
  if (!id) throw new Error(`Unknown market symbol: ${symbol}`)
  return id
}
