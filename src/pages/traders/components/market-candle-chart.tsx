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

// 새로운 API 사용
import {
  type MarketCandlesticksInterval,
  useMarketCandlesticks,
} from '../api'
import { getMarketIdBySymbol } from '../api/queries'
import { getWsSession } from '../api/websocket-hooks'

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
    const ms = intervalToMs(interval)
    return { startTime: now - bars * ms, endTime: now }
  }, [interval])

  // 새로운 API 사용: 캔들스틱 데이터 가져오기
  const apiInterval: MarketCandlesticksInterval = interval
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

  // set data when fetched
  useEffect(() => {
    if (loading || !data || !seriesRef.current) return
    const base = data.slice().sort((a, b) => a.t - b.t)
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
  }, [data, interval, loading, marketId])

  // live updates via WebSocket market_price stream
  useEffect(() => {
    if (loading || !seriesRef.current) return
    if (!marketId) return

    const ms = intervalToMs(interval)
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
  }, [marketId, interval, data, loading, symbol])

  // 로딩 중이거나 에러가 있으면 (모든 훅 호출 후) 반환
  if (loading || error || !marketId) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-sm text-white/40">
          {loading
            ? 'Loading chart...'
            : error || 'Unable to load chart'}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${height === 'parent' ? 'flex h-full flex-col' : ''}`}
    >
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
        <div className="mt-2 text-xs text-white/40">
          Loading candles...
        </div>
      )}
      {error && (
        <div className="mt-2 text-xs text-red-400">
          Error: {error}
        </div>
      )}
      {!isLoading &&
        !error &&
        (!data || data.length === 0) && (
          <div className="mt-2 text-xs text-white/40">
            No candle data available
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
