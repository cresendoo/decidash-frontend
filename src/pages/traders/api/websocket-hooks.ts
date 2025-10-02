import {
  DeciDashConfig,
  type WebsocketResponseMarketDepth,
  type WebsocketResponseMarketPrice,
  WSAPISession,
} from '@coldbell/decidash-ts-sdk'
import {
  type QueryKey,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import {
  getMarketDepth,
  getMarketIdBySymbol,
} from './queries'

// ============================================
// WebSocket Session Management
// ============================================

/**
 * 개별 WebSocket 세션 생성 (테스트용)
 */
export function createWsSession(
  config: DeciDashConfig = DeciDashConfig.DEVNET,
) {
  const session = new WSAPISession({
    wsURL: config.tradingVM.WSURL,
    WebSocketCtor: config.WebSocketCtor,
  })
  return {
    session,
    connect: () => session.connect(),
    disconnect: () => {
      try {
        session.disconnect()
      } catch (error) {
        // ignore disconnect error
        console.warn('WebSocket disconnect error:', error)
      }
    },
    subscribeMarketPrice: (
      market: string,
    ): AsyncIterable<WebsocketResponseMarketPrice> =>
      session.subscribeMarketPrice(market),
    subscribeMarketDepth: (
      market: string,
    ): AsyncIterable<WebsocketResponseMarketDepth> =>
      session.subscribeMarketDepth(market),
  }
}

// 싱글톤 WS 세션
let singleton: WSAPISession | null = null
// 전역 connectPromise로 중복 connect 방지
let globalConnectPromise: Promise<void> | null = null
// StrictMode 마운트/언마운트 떨림을 흡수하기 위한 지연 disconnect 타이머
let disconnectTimer: ReturnType<typeof setTimeout> | null =
  null

/**
 * 싱글톤 WebSocket 세션 가져오기
 * React StrictMode와 호환되도록 ref-counting 구현
 */
export function getWsSession(
  config: DeciDashConfig = DeciDashConfig.DEVNET,
) {
  if (!singleton) {
    singleton = new WSAPISession({
      wsURL: config.tradingVM.WSURL,
      WebSocketCtor: config.WebSocketCtor,
    })
  }

  // StrictMode로 인한 mount/unmount 이중 호출을 견디도록 ref-count 도입
  // 전역 refCount를 모듈 스코프에서 유지
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(getWsSession as any)._refCount =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (getWsSession as any)._refCount ?? 0

  async function connect(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(getWsSession as any)._refCount++
    // 빠르게 재마운트될 때 즉시 disconnect 되지 않도록 대기 중 타이머가 있으면 취소
    if (disconnectTimer) {
      clearTimeout(disconnectTimer)
      disconnectTimer = null
    }
    if (!globalConnectPromise) {
      globalConnectPromise = singleton!
        .connect()
        .catch((e: unknown) => {
          globalConnectPromise = null
          throw e
        })
    }
    return globalConnectPromise
  }

  function disconnect(): void {
    const next = Math.max(
      0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((getWsSession as any)._refCount as number) - 1,
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(getWsSession as any)._refCount = next
    if (next === 0) {
      // StrictMode에서 즉시 닫으면 CLOSING 상태에 걸릴 수 있어 약간 지연 후 닫기
      if (disconnectTimer) {
        clearTimeout(disconnectTimer)
      }
      disconnectTimer = setTimeout(() => {
        try {
          singleton!.disconnect()
        } catch (error) {
          console.warn('WebSocket disconnect error:', error)
        } finally {
          globalConnectPromise = null
          disconnectTimer = null
        }
      }, 500)
    }
  }

  return {
    session: singleton,
    connect,
    disconnect,
    subscribeMarketPrice: (
      market: string,
    ): AsyncIterable<WebsocketResponseMarketPrice> =>
      singleton!.subscribeMarketPrice(market),
    subscribeMarketDepth: (
      market: string,
    ): AsyncIterable<WebsocketResponseMarketDepth> =>
      singleton!.subscribeMarketDepth(market),
  }
}

// ============================================
// WebSocket 방식 React Query Hooks
// ============================================

/**
 * WebSocket을 사용한 실시간 마켓 가격 구독
 *
 * react-query와 WebSocket을 통합하는 방식:
 * 1. useQuery로 초기 데이터를 가져오고
 * 2. WebSocket으로 실시간 업데이트를 받아
 * 3. queryClient.setQueryData로 캐시를 직접 업데이트
 */
export const useMarketPriceStream = (
  marketSymbol: string,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
) => {
  const queryClient = useQueryClient()
  const [latestPrice, setLatestPrice] = useState<
    WebsocketResponseMarketPrice['price'] | null
  >(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const queryKey: QueryKey = [
    'marketPriceStream',
    marketSymbol,
  ]

  // react-query를 사용하여 초기 가격 데이터를 관리
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      return latestPrice
    },
    enabled: false, // WebSocket으로만 업데이트하므로 자동 fetch 비활성화
    staleTime: Infinity, // WebSocket이 항상 최신 데이터를 제공
  })

  useEffect(() => {
    if (!marketSymbol) return

    const { connect, disconnect, subscribeMarketPrice } =
      getWsSession(config)
    let cancelled = false

    const subscribe = async () => {
      try {
        setError(null)
        await connect()
        setIsConnected(true)

        const marketId =
          await getMarketIdBySymbol(marketSymbol)
        const stream = subscribeMarketPrice(marketId)

        for await (const update of stream) {
          if (cancelled) break

          setLatestPrice(update.price)

          // react-query 캐시에 최신 데이터 저장
          queryClient.setQueryData(queryKey, update.price)
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err
              : new Error('WebSocket connection failed'),
          )
          setIsConnected(false)
        }
      }
    }

    subscribe()

    return () => {
      cancelled = true
      setIsConnected(false)
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketSymbol, config])

  return {
    ...query,
    data: latestPrice,
    isConnected,
    error,
  }
}

/**
 * WebSocket을 사용한 실시간 오더북(마켓 뎁스) 구독
 */
export type DepthLevel = {
  price: number
  size: number
  total: number
}
export type MarketDepth = {
  bids: DepthLevel[]
  asks: DepthLevel[]
  bestBid?: number
  bestAsk?: number
  spread?: number
  spreadPercent?: number
}

export const useMarketDepthStream = (
  marketSymbol: string,
  depth: number = 15,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
) => {
  const queryClient = useQueryClient()
  const [marketDepth, setMarketDepth] =
    useState<MarketDepth | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const queryKey: QueryKey = [
    'marketDepthStream',
    marketSymbol,
    depth,
  ]

  // react-query를 사용하여 오더북 데이터를 관리
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      return marketDepth
    },
    enabled: !!marketDepth, // 데이터가 있을 때만 활성화
    staleTime: Infinity,
  })

  useEffect(() => {
    if (!marketSymbol) return

    const { connect, disconnect, subscribeMarketDepth } =
      getWsSession(config)
    let cancelled = false

    const subscribe = async () => {
      try {
        setError(null)
        setIsInitialLoad(true)

        // 1. 먼저 HTTP API로 초기 데이터 가져오기
        const marketId =
          await getMarketIdBySymbol(marketSymbol)

        try {
          const httpDepth = await getMarketDepth(
            marketId,
            depth,
            config,
          )

          // HTTP 응답을 MarketDepth 형식으로 변환
          const bidsArray: Array<{
            price: number
            size: number
          }> = Array.isArray(httpDepth.bids)
            ? httpDepth.bids
            : []
          const asksArray: Array<{
            price: number
            size: number
          }> = Array.isArray(httpDepth.asks)
            ? httpDepth.asks
            : []

          const initialBids = bidsArray
            .slice(0, depth)
            .map((item, idx) => ({
              price: item.price,
              size: item.size,
              total: bidsArray
                .slice(0, idx + 1)
                .reduce((acc, b) => acc + b.size, 0),
            }))

          const initialAsks = asksArray
            .slice(0, depth)
            .map((item, idx) => ({
              price: item.price,
              size: item.size,
              total: asksArray
                .slice(0, idx + 1)
                .reduce((acc, a) => acc + a.size, 0),
            }))

          const initialDepth: MarketDepth = {
            bids: initialBids,
            asks: initialAsks,
            bestBid: initialBids[0]?.price,
            bestAsk: initialAsks[0]?.price,
            spread:
              initialBids[0] && initialAsks[0]
                ? initialAsks[0].price -
                  initialBids[0].price
                : undefined,
            spreadPercent:
              initialBids[0] &&
              initialAsks[0] &&
              initialAsks[0].price > 0
                ? ((initialAsks[0].price -
                    initialBids[0].price) /
                    initialAsks[0].price) *
                  100
                : undefined,
          }

          setMarketDepth(initialDepth)
          queryClient.setQueryData(queryKey, initialDepth)
          setIsInitialLoad(false)
        } catch (httpError) {
          console.warn(
            '[HTTP] Failed to fetch initial depth, will wait for WebSocket:',
            httpError,
          )
          // HTTP 실패해도 계속 진행 (WebSocket에서 데이터 받을 것)
        }

        // 2. WebSocket 연결 및 실시간 업데이트 구독
        await connect()
        setIsConnected(true)

        const stream = subscribeMarketDepth(marketId)

        for await (const msg of stream as AsyncIterable<WebsocketResponseMarketDepth>) {
          if (cancelled) break

          // Bids와 Asks 정렬 및 제한
          let nextBids = (msg.bids || [])
            .slice()
            .sort((a, b) => b.price - a.price)
            .slice(0, depth)
          let nextAsks = (msg.asks || [])
            .slice()
            .sort((a, b) => a.price - b.price)
            .slice(0, depth)

          // 비정상 샘플 정정: bestBid > bestAsk이면 교차 영역 필터링
          if (nextBids.length && nextAsks.length) {
            const bid0 = nextBids[0].price
            const ask0 = nextAsks[0].price
            if (bid0 > ask0) {
              const filteredBids = nextBids.filter(
                (l) => l.price <= ask0,
              )
              const filteredAsks = nextAsks.filter(
                (l) => l.price >= bid0,
              )
              if (filteredBids.length > 0)
                nextBids = filteredBids
              if (filteredAsks.length > 0)
                nextAsks = filteredAsks
            }
          }

          // 누적 크기 계산
          let acc = 0
          const mappedBids = nextBids.map((l) => {
            acc += l.size
            return {
              price: l.price,
              size: l.size,
              total: acc,
            }
          })

          acc = 0
          const mappedAsks = nextAsks.map((l) => {
            acc += l.size
            return {
              price: l.price,
              size: l.size,
              total: acc,
            }
          })

          const bestBid =
            mappedBids.length > 0
              ? mappedBids[0].price
              : undefined
          const bestAsk =
            mappedAsks.length > 0
              ? mappedAsks[0].price
              : undefined

          const spread =
            bestBid && bestAsk
              ? bestAsk - bestBid
              : undefined
          const spreadPercent =
            spread && bestAsk
              ? (spread / bestAsk) * 100
              : undefined

          const depthData: MarketDepth = {
            bids: mappedBids,
            asks: mappedAsks,
            bestBid,
            bestAsk,
            spread,
            spreadPercent,
          }

          setMarketDepth(depthData)

          // WebSocket 데이터를 받으면 확실히 로딩 완료
          setIsInitialLoad(false)

          // react-query 캐시 업데이트
          queryClient.setQueryData(queryKey, depthData)
        }
      } catch (err) {
        console.error('[WebSocket] Error:', err)
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err
              : new Error('WebSocket connection failed'),
          )
          setIsConnected(false)
          setIsInitialLoad(false)
        }
      }
    }

    subscribe()

    return () => {
      cancelled = true
      setIsConnected(false)
      setIsInitialLoad(true)
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketSymbol, depth, config])

  return {
    ...query,
    data: marketDepth,
    isLoading: isInitialLoad, // 초기 로딩 상태
    isConnected,
    error,
  }
}

/**
 * 캔들스틱 데이터에 WebSocket 실시간 업데이트 적용
 *
 * 이 훅은 기존의 캔들스틱 쿼리 결과를 실시간으로 업데이트합니다.
 * useMarketCandlesticks와 함께 사용하세요.
 */
export const useCandlestickRealtimeUpdater = (
  marketSymbol: string,
  interval: string,
  candlestickQueryKey: QueryKey,
  config: DeciDashConfig = DeciDashConfig.DEVNET,
) => {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!marketSymbol || !interval) return

    const { connect, disconnect, subscribeMarketPrice } =
      getWsSession(config)
    let cancelled = false

    const subscribe = async () => {
      try {
        await connect()
        setIsConnected(true)

        const marketId =
          await getMarketIdBySymbol(marketSymbol)
        const priceStream = subscribeMarketPrice(marketId)

        const intervalMs = (() => {
          switch (interval) {
            case '1m':
              return 60_000
            case '5m':
              return 300_000
            case '15m':
              return 900_000
            case '1h':
              return 3_600_000
            case '4h':
              return 14_400_000
            case '1d':
              return 86_400_000
            default:
              return 3_600_000
          }
        })()

        for await (const update of priceStream) {
          if (cancelled) break

          const mark = update.price.mark_px
          const ts = update.price.transaction_unix_ms
          const bucketT =
            Math.floor(ts / intervalMs) * intervalMs

          queryClient.setQueryData(
            candlestickQueryKey,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (oldData: any[] | undefined) => {
              if (!oldData || oldData.length === 0)
                return oldData

              const arr = [...oldData]
              const idx = arr.findIndex(
                (c) => c.t === bucketT,
              )

              if (idx >= 0) {
                // 기존 캔들 업데이트
                const prev = arr[idx]
                arr[idx] = {
                  ...prev,
                  h: Math.max(prev.h, mark),
                  l: Math.min(prev.l, mark),
                  c: mark,
                }
              } else {
                // 새 캔들 추가
                arr.push({
                  t: bucketT,
                  T: bucketT + intervalMs - 1,
                  o: mark,
                  h: mark,
                  l: mark,
                  c: mark,
                  v: 0,
                  i: interval,
                })
              }

              return arr
            },
          )
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            'Candlestick realtime update failed:',
            error,
          )
        }
      } finally {
        setIsConnected(false)
      }
    }

    subscribe()

    return () => {
      cancelled = true
      setIsConnected(false)
      disconnect()
    }
  }, [
    marketSymbol,
    interval,
    candlestickQueryKey,
    config,
    queryClient,
  ])

  return { isConnected }
}
