import { MARKET_LIST } from '@coldbell/decidash-ts-sdk'
import { useMemo } from 'react'

import MarketCandleChart from '@/components/markets/MarketCandleChart'
import MarketCandles from '@/components/markets/MarketCandles'
import MarketTicker from '@/components/markets/MarketTicker'
import MarketTrades from '@/components/markets/MarketTrades'
import { createDecidashQueries } from '@/shared/api/decidashHooks'

export default function Markets() {
  const marketId = MARKET_LIST['APT/USD']
  const { useMarketPrice } = useMemo(() => createDecidashQueries({}), [])
  const { data, isLoading, error } = useMarketPrice(marketId)

  if (isLoading) return <div className="text-gray-900">로딩 중...</div>
  if (error) return <div className="text-red-600">에러: {(error as Error).message}</div>

  return (
    <div className="space-y-6 text-gray-900">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <MarketTicker symbol="APT/USD" />
        </div>
        <div className="md:col-span-2">
          <div className="space-y-6">
            <MarketCandleChart symbol="APT/USD" interval="1m" minutes={180} />
            <MarketCandles symbol="APT/USD" interval="1m" minutes={120} />
          </div>
        </div>
      </div>
      <MarketTrades symbol="APT/USD" limit={24} />
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">원시 가격 데이터</h3>
        <pre className="overflow-auto rounded bg-gray-100 p-3 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
