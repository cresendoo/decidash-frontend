import { useEffect, useMemo, useState } from 'react'
import {
  DeciDashConfig,
  MARKET_LIST,
  type WebsocketResponseMarketPrice,
} from '@coldbell/decidash-ts-sdk'
import { createWsSession } from '@/shared/api/decidashWs'
import { createDecidashQueries } from '@/shared/api/decidashHooks'

type Props = {
  symbol?: keyof typeof MARKET_LIST
}

export default function MarketTicker({ symbol = 'APT/USD' }: Props) {
  const marketId = MARKET_LIST[symbol]
  const [live, setLive] = useState<WebsocketResponseMarketPrice['price'] | null>(null)
  const queries = useMemo(() => createDecidashQueries({ config: DeciDashConfig.DEVNET }), [])
  const { data } = queries.useMarketPrice(marketId)

  useEffect(() => {
    let cancelled = false
    const { session, connect, disconnect, subscribeMarketPrice } = createWsSession(
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
      } catch (e) {
        // swallow for UI
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
      } catch {}
      disconnect()
    }
  }, [marketId])

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
