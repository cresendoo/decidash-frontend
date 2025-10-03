import { useEffect, useMemo } from 'react'

import {
  useMarkets,
  useUserOpenOrders,
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

// ============================================
// Skeleton
// ============================================
function OpenOrdersTableSkeleton() {
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
        {[...Array(3)].map((_, rowIndex) => (
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
function OpenOrdersTableError({
  errorMessage,
}: {
  errorMessage?: string
}) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-red-900/20 bg-red-950/10 p-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-red-400">
          주문 데이터를 불러올 수 없습니다
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
function OpenOrdersTableEmpty() {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/5 p-4">
      <p className="text-sm text-white/40">
        열린 주문이 없습니다
      </p>
    </div>
  )
}

// ============================================
// Main Component
// ============================================
interface OpenOrdersTableProps {
  address: string
}

export default function OpenOrdersTable({
  address,
}: OpenOrdersTableProps) {
  const {
    data: orders,
    isLoading: isLoadingOrders,
    isError,
    error,
  } = useUserOpenOrders(address)

  const { data: markets, isLoading: isLoadingMarkets } =
    useMarkets()

  // 데이터 확인용 로그
  useEffect(() => {
    console.log('[OpenOrdersTable] Orders:', orders)
    console.log('[OpenOrdersTable] Markets:', markets)
  }, [orders, markets])

  // Market address to name mapping
  const marketMap = useMemo(() => {
    if (!markets) return new Map<string, string>()
    return new Map(
      markets.map((m) => [m.market_addr, m.market_name]),
    )
  }, [markets])

  const isLoading = isLoadingOrders || isLoadingMarkets

  // 첫 로딩 (스켈레톤)
  if (isLoading && !orders) {
    return <OpenOrdersTableSkeleton />
  }

  // 에러 상태
  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : undefined
    return (
      <OpenOrdersTableError errorMessage={errorMessage} />
    )
  }

  // 빈 데이터 처리
  if (!orders || orders.length === 0) {
    return <OpenOrdersTableEmpty />
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
          <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Type
            </p>
          </div>
          <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Size
            </p>
          </div>
          <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Filled
            </p>
          </div>
          <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Price
            </p>
          </div>
          <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Status
            </p>
          </div>
        </div>

        {/* Rows */}
        {orders.map((order, index) => {
          const assetSymbol =
            marketMap.get(order.market) || 'Unknown'
          const side = order.is_buy ? 'BUY' : 'SELL'

          return (
            <div
              key={`${order.market}-${index}`}
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

              {/* Type */}
              <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {order.trigger_condition || 'Limit'}
                </p>
              </div>

              {/* Size */}
              <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatNumber(order.orig_size)}
                </p>
              </div>

              {/* Filled */}
              <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatNumber(
                    order.orig_size - order.remaining_size,
                  )}
                </p>
              </div>

              {/* Price */}
              <div className="box-border flex h-full w-[150px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatCurrency(order.price)}
                </p>
              </div>

              {/* Status */}
              <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white/60">
                  {order.status}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
