import { DeciDashConfig } from '@coldbell/decidash-ts-sdk'
import {
  type CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import { useEffect, useMemo, useRef, useState } from 'react'

import { getMarketIdBySymbol } from '@/shared/api/client'
import { getWsSession } from '@/shared/api/decidash-websocket'

// 새로운 API 사용
import {
  type MarketCandlesticksInterval,
  useMarketCandlesticks,
} from '../api'

type Props = {
  symbol?: string
  interval?: MarketCandlesticksInterval
  minutes?: number
  height?: number | 'parent'
  theme?: 'light' | 'dark'
}

export default function MarketCandleChart({
  symbol = 'APT/USD',
  interval = '1m',
  height = 360,
  theme = 'light',
}: Props) {
  const [marketId, setMarketId] = useState<string | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<ReturnType<
    typeof createChart
  > | null>(null)
  const seriesRef =
    useRef<ISeriesApi<'Candlestick'> | null>(null)
  const [uiInterval, setUiInterval] = useState<
    '5m' | '15m' | '1h' | '1d'
  >(
    interval === '1d'
      ? '1d'
      : interval === '15m'
        ? '15m'
        : interval === '1h'
          ? '1h'
          : '5m',
  )

  // 마켓 ID 가져오기
  useEffect(() => {
    const fetchMarketId = async () => {
      try {
        setLoading(true)
        const id = await getMarketIdBySymbol(symbol)
        setMarketId(id)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch market ID',
        )
      } finally {
        setLoading(false)
      }
    }

    if (symbol) {
      fetchMarketId()
    }
  }, [symbol])

  const { startTime, endTime } = useMemo(() => {
    const bars = 180
    const now = Date.now()
    const ms =
      uiInterval === '5m'
        ? 5 * 60_000
        : intervalToMs(
            (uiInterval === '15m'
              ? '15m'
              : uiInterval === '1h'
                ? '1h'
                : '1d') as MarketCandlesticksInterval,
          )
    return { startTime: now - bars * ms, endTime: now }
  }, [uiInterval])

  // 새로운 API 사용: 캔들스틱 데이터 가져오기
  const apiInterval: MarketCandlesticksInterval = (
    uiInterval === '5m'
      ? '1m'
      : uiInterval === '15m'
        ? '15m'
        : uiInterval === '1h'
          ? '1h'
          : '1d'
  ) as MarketCandlesticksInterval
  const { data, isLoading } = useMarketCandlesticks(
    symbol,
    apiInterval,
    startTime,
    endTime,
    DeciDashConfig.DEVNET,
    { enabled: !!marketId },
  )

  // init chart
  useEffect(() => {
    if (loading) return
    if (!containerRef.current) return
    if (chartRef.current) return

    const el = containerRef.current
    const rect = el.getBoundingClientRect()
    const isDark = theme === 'dark'
    const chart = createChart(el, {
      layout: {
        textColor: isDark ? '#d1d4dc' : '#111827',
        background: {
          type: ColorType.Solid,
          color: isDark ? '#1a1a1a' : 'white',
        },
      },
      grid: {
        vertLines: {
          color: isDark ? '#2d2d2d' : '#f3f4f6',
        },
        horzLines: {
          color: isDark ? '#2d2d2d' : '#f3f4f6',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? '#2d2d2d' : '#e5e7eb',
      },
      timeScale: {
        borderColor: isDark ? '#2d2d2d' : '#e5e7eb',
      },
      width: Math.max(1, Math.floor(rect.width)),
      height: Math.max(1, Math.floor(rect.height)),
    })
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#16a34a',
      downColor: '#dc2626',
      borderVisible: false,
      wickUpColor: '#16a34a',
      wickDownColor: '#dc2626',
    })
    chartRef.current = chart
    seriesRef.current = series
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (w && h) chart.resize(w, h)
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [theme, loading])

  // set data when fetched (5m은 클라이언트 집계)
  useEffect(() => {
    if (loading || !data || !seriesRef.current) return
    let base = data.slice().sort((a, b) => a.t - b.t)
    if (uiInterval === '5m') {
      const bucketMs = 5 * 60_000
      const buckets: Record<
        number,
        {
          t: number
          o: number
          h: number
          l: number
          c: number
        }
      > = {}
      for (const c of base) {
        const bt = Math.floor(c.t / bucketMs) * bucketMs
        const ex = buckets[bt]
        if (!ex)
          buckets[bt] = {
            t: bt,
            o: c.o,
            h: c.h,
            l: c.l,
            c: c.c,
          }
        else {
          ex.h = Math.max(ex.h, c.h)
          ex.l = Math.min(ex.l, c.l)
          ex.c = c.c
        }
      }
      base = Object.values(buckets).sort(
        (a, b) => a.t - b.t,
      ) as typeof base
    }
    const mapped: CandlestickData<UTCTimestamp>[] =
      base.map(
        (c: {
          t: number
          o: number
          h: number
          l: number
          c: number
        }) => ({
          time: Math.floor(c.t / 1000) as UTCTimestamp,
          open: c.o,
          high: c.h,
          low: c.l,
          close: c.c,
        }),
      )
    seriesRef.current.setData(mapped)
    chartRef.current?.timeScale().fitContent()
  }, [data, uiInterval, loading, marketId])

  // live updates via WebSocket market_price stream (버킷은 uiInterval 기준)
  useEffect(() => {
    if (loading || !seriesRef.current) return
    if (!marketId) return

    const ms =
      uiInterval === '5m'
        ? 5 * 60_000
        : intervalToMs(
            uiInterval === '15m'
              ? '15m'
              : uiInterval === '1h'
                ? '1h'
                : '1d',
          )
    let lastBar: CandlestickData<UTCTimestamp> | null = null
    const series = seriesRef.current
    const { connect, disconnect, subscribeMarketPrice } =
      getWsSession(DeciDashConfig.DEVNET)
    let cancelled = false

    async function run() {
      try {
        await connect()
        if (data && data.length > 0) {
          const d = data[data.length - 1]
          lastBar = {
            time: Math.floor(d.t / 1000) as UTCTimestamp,
            open: d.o,
            high: d.h,
            low: d.l,
            close: d.c,
          }
        }
        const it = subscribeMarketPrice(marketId!)
        for await (const msg of it) {
          if (cancelled) break
          const price = msg.price.mark_px
          const ts = msg.price.transaction_unix_ms
          const bucketSec = (Math.floor(ts / ms) *
            (ms / 1000)) as UTCTimestamp

          if (
            !lastBar ||
            (lastBar.time as number) < (bucketSec as number)
          ) {
            lastBar = {
              time: bucketSec,
              open: lastBar ? lastBar.close : price,
              high: price,
              low: price,
              close: price,
            }
            series.update(lastBar)
            continue
          }

          if (
            (lastBar.time as number) ===
            (bucketSec as number)
          ) {
            lastBar = {
              time: bucketSec,
              open: lastBar.open,
              high: Math.max(lastBar.high, price),
              low: Math.min(lastBar.low, price),
              close: price,
            }
            series.update(lastBar)
          }
        }
      } catch {
        // ignore
      }
    }

    run()
    return () => {
      cancelled = true
      disconnect()
    }
  }, [marketId, uiInterval, data, loading, symbol])

  // 로딩 중이거나 에러가 있으면 (모든 훅 호출 후) 반환
  if (loading || error || !marketId) {
    return (
      <div
        className={`rounded border ${theme === 'dark' ? 'border-gray-700 bg-[#0f1115]' : 'border-gray-200 bg-white'} p-4 shadow-sm`}
      >
        <div
          className={`mb-2 text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {symbol} 캔들 ({uiInterval})
        </div>
        <div className="flex h-64 items-center justify-center text-gray-400">
          {loading
            ? '마켓 정보를 로딩 중...'
            : error || '마켓 정보를 가져올 수 없습니다'}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`rounded border ${theme === 'dark' ? 'border-gray-700 bg-[#0f1115]' : 'border-gray-200 bg-white'} p-4 shadow-sm ${height === 'parent' ? 'flex h-full flex-col' : ''}`}
    >
      <div
        className={`mb-2 flex items-center justify-between text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
      >
        <span>
          {symbol} 캔들 ({uiInterval})
        </span>
        <div className="flex items-center gap-3 text-xs">
          {(['5m', '15m', '1h', '1d'] as const).map(
            (itv) => (
              <button
                key={itv}
                onClick={() => setUiInterval(itv)}
                className={
                  itv === uiInterval
                    ? 'font-semibold text-yellow-300'
                    : theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                }
              >
                {itv === '1d' ? 'D' : itv}
              </button>
            ),
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className={
          height === 'parent' ? 'min-h-0 flex-1' : ''
        }
        style={{
          height:
            height === 'parent'
              ? undefined
              : (height as number),
          width: '100%',
          minHeight:
            height === 'parent'
              ? undefined
              : (height as number),
          position: 'relative',
        }}
      />
      {isLoading && (
        <div
          className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
        >
          차트 로딩...
        </div>
      )}
      {error && (
        <div className="mt-2 text-xs text-red-600">
          에러: {error}
        </div>
      )}
      {!isLoading &&
        !error &&
        (!data || data.length === 0) && (
          <div
            className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
          >
            표시할 캔들 데이터가 없습니다.
          </div>
        )}
    </div>
  )
}

function intervalToMs(
  i: MarketCandlesticksInterval,
): number {
  switch (i) {
    case '1m':
      return 60_000
    case '15m':
      return 15 * 60_000
    case '1h':
      return 60 * 60_000
    case '4h':
      return 4 * 60 * 60_000
    case '1d':
      return 24 * 60 * 60_000
    default:
      return 60_000
  }
}
