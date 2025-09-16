import {
  DeciDashConfig,
  MARKET_LIST,
  type MarketCandlesticksInterval,
} from '@coldbell/decidash-ts-sdk'
import {
  type CandlestickData,
  CandlestickSeries,
  ColorType,
  createChart,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import { useEffect, useMemo, useRef } from 'react'

import { createDecidashQueries } from '@/shared/api/decidashHooks'
import { createWsSession } from '@/shared/api/decidashWs'

type Props = {
  symbol?: keyof typeof MARKET_LIST
  interval?: MarketCandlesticksInterval
  minutes?: number
  height?: number
}

export default function MarketCandleChart({
  symbol = 'APT/USD',
  interval = '1m',
  minutes = 180,
  height = 360,
}: Props) {
  const marketId = MARKET_LIST[symbol]
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  const { startTime, endTime } = useMemo(() => {
    const end = Date.now()
    return { startTime: end - minutes * 60_000, endTime: end }
  }, [minutes, interval])
  const { useMarketCandlesticks } = useMemo(() => createDecidashQueries({}), [])
  const { data, isLoading, error } = useMarketCandlesticks({
    market: marketId,
    interval,
    startTime,
    endTime,
  })

  // init chart
  useEffect(() => {
    if (!containerRef.current) return
    if (chartRef.current) return

    const el = containerRef.current
    const rect = el.getBoundingClientRect()
    const chart = createChart(el, {
      layout: { textColor: '#111827', background: { type: ColorType.Solid, color: 'white' } },
      grid: {
        vertLines: { color: '#f3f4f6' },
        horzLines: { color: '#f3f4f6' },
      },
      rightPriceScale: { borderColor: '#e5e7eb' },
      timeScale: { borderColor: '#e5e7eb' },
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
  }, [])

  // set data when fetched
  useEffect(() => {
    if (!data || !seriesRef.current) return
    const mapped: CandlestickData<UTCTimestamp>[] = data
      .slice()
      .sort((a, b) => a.t - b.t)
      .map((c) => ({
        time: Math.floor(c.t / 1000) as UTCTimestamp,
        open: c.o,
        high: c.h,
        low: c.l,
        close: c.c,
      }))
    seriesRef.current.setData(mapped)
    chartRef.current?.timeScale().fitContent()
  }, [data])

  // live updates via WebSocket market_price stream
  useEffect(() => {
    if (!seriesRef.current) return

    const ms = intervalToMs(interval)
    let lastBar: CandlestickData<UTCTimestamp> | null = null
    const series = seriesRef.current
    const { connect, disconnect, subscribeMarketPrice } = createWsSession(DeciDashConfig.DEVNET)
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
        const it = subscribeMarketPrice(marketId)
        for await (const msg of it) {
          if (cancelled) break
          const price = msg.price.mark_px
          const ts = msg.price.transaction_unix_ms
          const bucketSec = (Math.floor(ts / ms) * (ms / 1000)) as UTCTimestamp

          if (!lastBar || (lastBar.time as number) < (bucketSec as number)) {
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

          if ((lastBar.time as number) === (bucketSec as number)) {
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
  }, [marketId, interval, data])

  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium text-gray-700">
        {symbol} 캔들 ({interval})
      </div>
      <div
        ref={containerRef}
        style={{ height, width: '100%', minHeight: height, position: 'relative' }}
      />
      {isLoading && <div className="mt-2 text-xs text-gray-500">차트 로딩...</div>}
      {error && <div className="mt-2 text-xs text-red-600">에러: {(error as Error).message}</div>}
      {!isLoading && !error && (!data || data.length === 0) && (
        <div className="mt-2 text-xs text-gray-500">표시할 캔들 데이터가 없습니다.</div>
      )}
    </div>
  )
}

function intervalToMs(i: MarketCandlesticksInterval): number {
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
  }
}
