import { useEffect,useMemo, useState } from 'react'

// MarketCandleChart는 traders 전용으로 이동했습니다
import MarketCandles from '@/components/markets/MarketCandles'
import MarketTicker from '@/components/markets/MarketTicker'
import MarketTrades from '@/components/markets/MarketTrades'
import { getMarketIdBySymbol } from '@/shared/api/client'
import { createDecidashQueries } from '@/shared/api/decidashHooks'

export default function Markets() {
  const [marketId, setMarketId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 컴포넌트 마운트 시 마켓 ID 가져오기
  useEffect(() => {
    const fetchMarketId = async () => {
      try {
        setLoading(true)
        const id = await getMarketIdBySymbol('APT/USD')
        setMarketId(id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market ID')
      } finally {
        setLoading(false)
      }
    }

    fetchMarketId()
  }, [])

  const { useMarketPrice } = useMemo(() => createDecidashQueries({}), [])
  const { data } = useMarketPrice(marketId || '')

  if (loading || !marketId) {
    return <div className="text-gray-900">마켓 정보를 로딩 중...</div>
  }

  if (error) {
    return <div className="text-red-600">에러: {error}</div>
  }

  return (
    <div className="space-y-6 text-gray-900">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <MarketTicker symbol="APT/USD" />
        </div>
        <div className="md:col-span-2">
          <div className="space-y-6">
            {/* 차트 컴포넌트는 traders로 이동됨 */}
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
