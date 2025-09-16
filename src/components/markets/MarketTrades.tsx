import { MARKET_LIST } from '@coldbell/decidash-ts-sdk'
import { createDecidashQueries } from '@/shared/api/decidashHooks'
import { useMemo } from 'react'

type Props = { symbol?: keyof typeof MARKET_LIST; limit?: number }

export default function MarketTrades({ symbol = 'APT/USD', limit = 24 }: Props) {
  const marketId = MARKET_LIST[symbol]
  const { useMarketTradeHistory } = useMemo(() => createDecidashQueries({}), [])
  const { data, isLoading, error } = useMarketTradeHistory(marketId, limit)

  if (isLoading) return <div className="text-gray-900">체결 로딩...</div>
  if (error) return <div className="text-red-600">에러: {(error as Error).message}</div>

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
