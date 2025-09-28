import {
  DeciDashConfig,
  type WebsocketResponseMarketPrice,
} from '@coldbell/decidash-ts-sdk'
import { useEffect, useMemo, useState } from 'react'

import { getMarketIdBySymbol } from '@/shared/api/client'
import { createDecidashQueries } from '@/shared/api/decidashHooks'
import { createWsSession } from '@/shared/api/decidash-websocket'

type Props = {
  symbol?: string
}

export default function MarketTicker({ symbol = 'APT/USD' }: Props) {
  const [marketId, setMarketId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [live, setLive] = useState<WebsocketResponseMarketPrice['price'] | null>(null)
  const queries = useMemo(() => createDecidashQueries({ config: DeciDashConfig.DEVNET }), [])

  // 마켓 ID 가져오기
  useEffect(() => {
    const fetchMarketId = async () => {
      try {
        setLoading(true)
        const id = await getMarketIdBySymbol(symbol)
        setMarketId(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market ID')
      } finally {
        setLoading(false)
      }
    }

    if (symbol) {
      fetchMarketId()
    }
  }, [symbol])

  const { data } = queries.useMarketPrice(marketId || '')

  useEffect(() => {
    if (loading || !marketId) return

    let cancelled = false
    const { connect, disconnect, subscribeMarketPrice } = createWsSession(
      DeciDashConfig.DEVNET,
    )

    async function run() {
      try {
        await connect()
        const stream = subscribeMarketPrice(marketId)
        for await (const msg of stream) {
          if (cancelled) break
          setLive(msg.price)
        }
      } catch (error) {
        // ignore error
        console.warn('Market ticker WebSocket error:', error)
      }
    }

    run()
    return () => {
      cancelled = true
      try {
        const s = subscribeMarketPrice(
          marketId,
        ) as unknown as ReadableStream<WebsocketResponseMarketPrice>
        s.cancel?.().catch(() => {})
      } catch (error) {
        // ignore cancel error
        console.warn('Market ticker cancel error:', error)
      }
      disconnect()
    }
  }, [marketId, loading])

  const latest = live ?? (data && data[0]) ?? null

  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm text-gray-500">{symbol}</div>
      <div className="flex items-end gap-4">
        <div className="text-2xl font-semibold text-gray-900">
          {latest ? latest.mark_px.toLocaleString() : '—'}
        </div>
        {latest && (
          <div className="text-xs text-gray-500">OI: {latest.open_interest.toLocaleString()}</div>
        )}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {latest ? new Date(latest.transaction_unix_ms).toLocaleString() : '대기 중'}
      </div>
    </div>
  )
}
