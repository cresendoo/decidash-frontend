import {
  type MarketCandlesticks,
  type MarketCandlesticksInterval,
} from '@coldbell/decidash-ts-sdk'
import { useEffect,useMemo, useState } from 'react'

import { getMarketIdBySymbol } from '@/shared/api/client'
import { createDecidashQueries } from '@/shared/api/decidashHooks'

type Props = {
  symbol?: string
  interval?: MarketCandlesticksInterval
  minutes?: number
}

export default function MarketCandles({
  symbol = 'APT/USD',
  interval = '1m',
  minutes = 60,
}: Props) {
  const [marketId, setMarketId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const { startTime, endTime } = useMemo(() => {
    const end = Date.now()
    return { startTime: end - minutes * 60_000, endTime: end }
  }, [minutes])
  const { useMarketCandlesticks } = useMemo(() => createDecidashQueries({}), [])
  const { data } = useMarketCandlesticks({
    market: marketId || '',
    interval,
    startTime,
    endTime,
  })

  if (loading || !marketId) {
    return <div className="text-gray-900">캔들 로딩...</div>
  }

  if (error) {
    return <div className="text-red-600">에러: {error}</div>
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium text-gray-700">최근 캔들 ({interval})</div>
      <div className="max-h-64 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-gray-500">
            <tr>
              <th className="py-1">시작</th>
              <th className="py-1">O</th>
              <th className="py-1">H</th>
              <th className="py-1">L</th>
              <th className="py-1">C</th>
              <th className="py-1">V</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {data
              ?.slice()
              .reverse()
              .map((c: MarketCandlesticks, idx: number) => (
                <tr key={`${c.t}-${idx}`} className="border-t border-gray-100">
                  <td className="py-1 text-xs">{new Date(c.t).toLocaleTimeString()}</td>
                  <td className="py-1 text-xs">{c.o.toLocaleString()}</td>
                  <td className="py-1 text-xs">{c.h.toLocaleString()}</td>
                  <td className="py-1 text-xs">{c.l.toLocaleString()}</td>
                  <td className="py-1 text-xs">{c.c.toLocaleString()}</td>
                  <td className="py-1 text-xs">{c.v.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
