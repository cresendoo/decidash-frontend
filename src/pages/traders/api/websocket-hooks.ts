import {
  DeciDashConfig,
  type WebsocketResponseMarketDepth,
  type WebsocketResponseMarketPrice,
} from '@coldbell/decidash-ts-sdk'
import {
  type QueryKey,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { getMarketIdBySymbol } from '@/shared/api/client'
import { getWsSession } from '@/shared/api/decidash-websocket'

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
  }, [marketSymbol, config, queryClient])

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
    useState<MarketDepth>({
      bids: [],
      asks: [],
    })
  const [isConnected, setIsConnected] = useState(false)
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
    enabled: false, // WebSocket으로만 업데이트
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
        await connect()
        setIsConnected(true)

        const marketId =
          await getMarketIdBySymbol(marketSymbol)
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

          // react-query 캐시 업데이트
          queryClient.setQueryData(queryKey, depthData)
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
  }, [marketSymbol, depth, config, queryClient])

  return {
    ...query,
    data: marketDepth,
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
