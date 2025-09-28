import { useEffect,useMemo, useState } from 'react'

import { getMarketIdBySymbol } from '@/shared/api/client'
import { createDecidashQueries } from '@/shared/api/decidashHooks'

type Props = { symbol?: string; limit?: number }

export default function MarketTrades({ symbol = 'APT/USD', limit = 24 }: Props) {
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

  const { useMarketTradeHistory } = useMemo(() => createDecidashQueries({}), [])
  const { data } = useMarketTradeHistory(marketId || '', limit)

  if (loading || !marketId) {
    return <div className="text-gray-900">체결 로딩...</div>
  }

  if (error) {
    return <div className="text-red-600">에러: {error}</div>
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-sm font-medium text-gray-700">최근 체결</div>
      <div className="max-h-64 overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-gray-500">
            <tr>
              <th className="py-1">시간</th>
              <th className="py-1">액션</th>
              <th className="py-1">가격</th>
              <th className="py-1">수량</th>
              <th className="py-1">P/L</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {data?.map((t, idx) => (
              <tr key={`${t.transaction_version}-${idx}`} className="border-t border-gray-100">
                <td className="py-1 text-xs">
                  {new Date(t.transaction_unix_ms).toLocaleTimeString()}
                </td>
                <td className="py-1 text-xs">{t.action}</td>
                <td className="py-1 text-xs">{t.price.toLocaleString()}</td>
                <td className="py-1 text-xs">{t.size.toLocaleString()}</td>
                <td className={`py-1 text-xs ${t.is_profit ? 'text-green-600' : 'text-red-600'}`}>
                  {t.realized_pnl_amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
