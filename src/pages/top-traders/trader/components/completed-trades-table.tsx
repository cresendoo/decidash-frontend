import { useEffect, useMemo } from 'react'

import {
  useCompletedTrades,
  useMarkets,
} from '../api/queries'

// ============================================
// Utility Functions
// ============================================

const formatNumber = (
  value: number | null | undefined,
): string => {
  if (value === null || value === undefined) return '-'
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}

const formatCurrency = (
  value: number | null | undefined,
): string => {
  if (value === null || value === undefined) return '-'
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

const formatDate = (
  timestamp: number | null | undefined,
): string => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ============================================
// Skeleton
// ============================================
function CompletedTradesTableSkeleton() {
  return (
    <div className="min-w-[1000px] animate-pulse">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex h-12 items-center border-b border-white/5">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-1 px-4">
              <div className="h-4 w-20 rounded bg-white/10" />
            </div>
          ))}
        </div>

        {/* Rows */}
        {[...Array(5)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex h-16 items-center"
          >
            {[...Array(7)].map((_, colIndex) => (
              <div
                key={colIndex}
                className="flex flex-1 px-4"
              >
                <div className="h-5 w-24 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Error
// ============================================
function CompletedTradesTableError({
  errorMessage,
}: {
  errorMessage?: string
}) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-red-900/20 bg-red-950/10 p-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-red-400">
          완료된 거래 데이터를 불러올 수 없습니다
        </p>
        {errorMessage && (
          <p className="text-xs text-red-400/60">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================
// Empty
// ============================================
function CompletedTradesTableEmpty() {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/5 p-4">
      <p className="text-sm text-white/40">
        완료된 거래가 없습니다
      </p>
    </div>
  )
}

// ============================================
// Main Component
// ============================================
interface CompletedTradesTableProps {
  address: string
}

export default function CompletedTradesTable({
  address,
}: CompletedTradesTableProps) {
  const {
    data: trades,
    isLoading: isLoadingTrades,
    isError,
    error,
  } = useCompletedTrades(address, 50)

  const { data: markets, isLoading: isLoadingMarkets } =
    useMarkets()

  // 데이터 확인용 로그
  useEffect(() => {
    console.log('[CompletedTradesTable] Trades:', trades)
    console.log('[CompletedTradesTable] Markets:', markets)
  }, [trades, markets])

  // Market address to name mapping
  const marketMap = useMemo(() => {
    if (!markets) return new Map<string, string>()
    return new Map(
      markets.map((m) => [m.market_addr, m.market_name]),
    )
  }, [markets])

  const isLoading = isLoadingTrades || isLoadingMarkets

  // 첫 로딩 (스켈레톤)
  if (isLoading && !trades) {
    return <CompletedTradesTableSkeleton />
  }

  // 에러 상태
  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : undefined
    return (
      <CompletedTradesTableError
        errorMessage={errorMessage}
      />
    )
  }

  // 빈 데이터 처리
  if (!trades || trades.length === 0) {
    return <CompletedTradesTableEmpty />
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-full flex-col">
        {/* Header */}
        <div className="flex h-12 items-center border-b border-white/5">
          <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Asset
            </p>
          </div>
          <div className="box-border flex h-full w-[100px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Side
            </p>
          </div>
          <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Size
            </p>
          </div>
          <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Price
            </p>
          </div>
          <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Total
            </p>
          </div>
          <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Fee
            </p>
          </div>
          <div className="box-border flex h-full w-[180px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Time
            </p>
          </div>
        </div>

        {/* Rows */}
        {trades.map((trade, index) => {
          const assetSymbol =
            marketMap.get(trade.market) || 'Unknown'
          // action이 "OpenLong", "CloseLong"이면 BUY, "OpenShort", "CloseShort"이면 SELL
          const side = trade.action.includes('Long')
            ? 'BUY'
            : 'SELL'

          return (
            <div
              key={`${trade.market}-${index}`}
              className="flex h-16 items-center"
            >
              {/* Asset */}
              <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0 font-normal">
                <p className="truncate text-sm leading-5 text-white">
                  {assetSymbol}
                </p>
              </div>

              {/* Side */}
              <div className="box-border flex h-full w-[100px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p
                  className={`truncate text-sm font-normal leading-5 ${
                    side === 'BUY'
                      ? 'text-[#00c951]'
                      : 'text-[#fb2c36]'
                  }`}
                >
                  {side}
                </p>
              </div>

              {/* Size */}
              <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatNumber(trade.size)}
                </p>
              </div>

              {/* Price */}
              <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatCurrency(trade.price)}
                </p>
              </div>

              {/* Total */}
              <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatCurrency(trade.size * trade.price)}
                </p>
              </div>

              {/* Fee */}
              <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatCurrency(trade.fee_amount || 0)}
                </p>
              </div>

              {/* Time */}
              <div className="box-border flex h-full w-[180px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatDate(trade.transaction_unix_ms)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
