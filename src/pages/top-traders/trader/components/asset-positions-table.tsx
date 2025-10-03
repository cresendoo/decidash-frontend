import { useEffect, useMemo } from 'react'

import {
  useAccountPositions,
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

  const isNegative = value < 0
  const formatted = Math.abs(value).toLocaleString(
    'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )
  return isNegative ? `-$${formatted}` : `$${formatted}`
}

// ============================================
// Side Chip Component
// ============================================
function SideChip({ side }: { side: 'LONG' | 'SHORT' }) {
  if (side === 'SHORT') {
    return (
      <div className="flex shrink-0 items-center justify-center gap-[10px] rounded-lg border border-[#9f0712] bg-[rgba(70,8,9,0.5)] px-2 py-1">
        <p className="whitespace-nowrap text-xs font-normal leading-4 text-[#fb2c36]">
          SHORT
        </p>
      </div>
    )
  }
  return (
    <div className="flex shrink-0 items-center justify-center gap-[10px] rounded-lg border border-[#016630] bg-[rgba(5,46,22,0.5)] px-2 py-1">
      <p className="whitespace-nowrap text-xs font-normal leading-4 text-[#00c951]">
        LONG
      </p>
    </div>
  )
}

// ============================================
// Skeleton
// ============================================
function AssetPositionsTableSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col">
      {/* Header */}
      <div className="flex h-12 items-center border-b border-white/5">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="flex h-full items-center gap-0.5 px-4"
          >
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
          {[...Array(9)].map((_, colIndex) => (
            <div
              key={colIndex}
              className="flex h-full items-center px-4"
            >
              <div className="h-5 w-24 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ============================================
// Error
// ============================================
function AssetPositionsTableError({
  errorMessage,
}: {
  errorMessage?: string
}) {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-red-900/20 bg-red-950/10 p-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm text-red-400">
          포지션 데이터를 불러올 수 없습니다
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
function AssetPositionsTableEmpty() {
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/5 p-4">
      <p className="text-sm text-white/40">
        활성 포지션이 없습니다
      </p>
    </div>
  )
}

// ============================================
// Main Component
// ============================================
interface AssetPositionsTableProps {
  address: string
}

export default function AssetPositionsTable({
  address,
}: AssetPositionsTableProps) {
  const {
    data: positions,
    isLoading: isLoadingPositions,
    isError: isErrorPositions,
    error: errorPositions,
  } = useAccountPositions(address)

  const { data: markets, isLoading: isLoadingMarkets } =
    useMarkets()

  // 데이터 확인용 로그
  useEffect(() => {
    console.log(
      '[AssetPositionsTable] Positions:',
      positions,
    )
    console.log('[AssetPositionsTable] Markets:', markets)
  }, [positions, markets])

  // Market address to name mapping
  const marketMap = useMemo(() => {
    if (!markets) return new Map<string, string>()
    return new Map(
      markets.map((m) => [m.market_addr, m.market_name]),
    )
  }, [markets])

  const isLoading = isLoadingPositions || isLoadingMarkets
  const isError = isErrorPositions

  // 첫 로딩 (스켈레톤)
  if (isLoading && !positions) {
    return <AssetPositionsTableSkeleton />
  }

  // 에러 상태
  if (isError) {
    const errorMessage =
      errorPositions instanceof Error
        ? errorPositions.message
        : undefined
    return (
      <AssetPositionsTableError
        errorMessage={errorMessage}
      />
    )
  }

  // 빈 데이터 처리
  if (!positions || positions.length === 0) {
    return <AssetPositionsTableEmpty />
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-full flex-col">
        {/* Header */}
        <div className="flex h-12 items-center border-b border-white/5">
          <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Asset
            </p>
          </div>
          <div className="box-border flex h-full w-[90px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Type
            </p>
          </div>
          <div className="box-border flex h-full w-[180px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Position Value / Size
            </p>
          </div>
          <div className="box-border flex h-full w-[140px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Unrealized PnL
            </p>
          </div>
          <div className="box-border flex h-full w-[140px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Entry Price
            </p>
          </div>
          <div className="box-border flex h-full w-[140px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Current Price
            </p>
          </div>
          <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Liq. Price
            </p>
          </div>
          <div className="box-border flex h-full w-[140px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Margin Used
            </p>
          </div>
          <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-0.5 px-4 py-0">
            <p className="whitespace-nowrap text-sm font-normal leading-5 text-white/60">
              Funding
            </p>
          </div>
        </div>

        {/* Rows */}
        {positions.map((position, index) => {
          const assetSymbol =
            marketMap.get(position.market) || 'Unknown'
          const side = position.size > 0 ? 'LONG' : 'SHORT'
          const sizeAbs = Math.abs(position.size)
          const positionValue =
            sizeAbs * position.entry_price

          // TODO: 현재가 데이터 필요 (미실현 손익 계산용)
          const currentPrice = '-'
          const unrealizedPnl = '-'
          const unrealizedPnlPercent = '-'

          // Margin Used 계산
          const marginUsed =
            positionValue / position.user_leverage

          return (
            <div
              key={`${position.market}-${index}`}
              className="flex h-16 items-center"
            >
              {/* Asset */}
              <div className="box-border flex h-full w-[120px] shrink-0 flex-col items-start justify-center gap-0.5 overflow-hidden px-4 py-0 font-normal">
                <p className="truncate text-sm leading-5 text-white">
                  {assetSymbol}
                </p>
                <p className="truncate text-xs leading-4 text-white/60">
                  {formatCurrency(positionValue)}
                </p>
              </div>

              {/* Type (Side) */}
              <div className="box-border flex h-full w-[90px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <SideChip side={side} />
              </div>

              {/* Position Value / Size */}
              <div className="box-border flex h-full w-[180px] shrink-0 flex-col items-start justify-center gap-0.5 overflow-hidden px-4 py-0 font-normal">
                <p className="truncate text-sm leading-5 text-white">
                  {formatCurrency(positionValue)}
                </p>
                <p className="truncate text-xs leading-4 text-white/60">
                  {formatNumber(sizeAbs)} {assetSymbol}
                </p>
              </div>

              {/* Unrealized PnL */}
              <div className="box-border flex h-full w-[140px] shrink-0 flex-col items-start justify-center gap-0.5 overflow-hidden px-4 py-0 font-normal text-[#00c951]">
                <p className="truncate text-sm leading-5">
                  {unrealizedPnl}
                </p>
                <p className="truncate text-xs leading-4">
                  {unrealizedPnlPercent}
                </p>
              </div>

              {/* Entry Price */}
              <div className="box-border flex h-full w-[140px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatCurrency(position.entry_price)}
                </p>
              </div>

              {/* Current Price */}
              <div className="box-border flex h-full w-[140px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {currentPrice}
                </p>
              </div>

              {/* Liq. Price */}
              <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatCurrency(
                    position.estimated_liquidation_price,
                  )}
                </p>
              </div>

              {/* Margin Used */}
              <div className="box-border flex h-full w-[140px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p className="truncate text-sm font-normal leading-5 text-white">
                  {formatCurrency(marginUsed)}
                </p>
              </div>

              {/* Funding */}
              <div className="box-border flex h-full w-[120px] shrink-0 items-center gap-2 overflow-hidden px-4 py-0">
                <p
                  className={`truncate text-sm font-normal leading-5 ${
                    position.unrealized_funding >= 0
                      ? 'text-[#00c951]'
                      : 'text-[#fb2c36]'
                  }`}
                >
                  {formatCurrency(
                    position.unrealized_funding,
                  )}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
