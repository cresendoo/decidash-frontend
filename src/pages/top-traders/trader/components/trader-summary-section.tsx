import { DeciDashConfig } from '@coldbell/decidash-ts-sdk'
import { useEffect, useState } from 'react'

import { useAccountOverviews } from '../api/queries'

// ============================================
// Utility Functions
// ============================================

const formatCurrency = (value?: number): string => {
  if (value === undefined || value === null) return '-'

  const isNegative = value < 0
  const abs = Math.abs(value)

  let formatted = ''
  if (abs >= 1_000_000_000) {
    formatted = `$${(abs / 1_000_000_000).toFixed(2)}B`
  } else if (abs >= 1_000_000) {
    formatted = `$${(abs / 1_000_000).toFixed(2)}M`
  } else if (abs >= 1_000) {
    formatted = `$${(abs / 1_000).toFixed(2)}K`
  } else {
    formatted = `$${abs.toFixed(2)}`
  }

  return isNegative ? `-${formatted}` : formatted
}

const formatPercentage = (value?: number): string => {
  if (value === undefined || value === null) return '-'
  return `${value.toFixed(2)}%`
}

const formatLeverage = (value?: number): string => {
  if (value === undefined || value === null) return '-'
  return `${value.toFixed(2)}x`
}

// ============================================
// Skeleton Components
// ============================================

function TraderSummarySkeleton() {
  return (
    <div className="flex w-full items-start gap-5 pb-2 pt-1">
      {/* Total Value Skeleton */}
      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="h-7 w-36 animate-pulse rounded bg-white/10" />
        <div className="flex gap-3">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        </div>
      </div>

      {/* Withdrawable Skeleton */}
      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="h-7 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
      </div>

      {/* Leverage Skeleton */}
      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
          <div className="h-6 w-12 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="h-7 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  )
}

// ============================================
// Error Component
// ============================================

function TraderSummaryError({
  errorMessage,
}: {
  errorMessage?: string
}) {
  return (
    <div className="flex w-full items-start gap-5 pb-2 pt-1">
      <div className="flex flex-col gap-2">
        <p className="text-sm leading-5 text-white/60">
          Total Value
        </p>
        <p className="text-lg font-medium leading-7 text-red-400">
          Unable to load data
        </p>
        {errorMessage && (
          <p className="text-xs leading-4 text-white/40">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================
// Empty Data Component
// ============================================

function TraderSummaryEmpty() {
  return (
    <div className="flex w-full items-start gap-5 pb-2 pt-1">
      <div className="flex flex-col gap-2">
        <p className="text-sm leading-5 text-white/60">
          Total Value
        </p>
        <p className="text-lg font-medium leading-7 text-white/40">
          No data available
        </p>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

interface TraderSummarySectionProps {
  address?: string
}

export default function TraderSummarySection({
  address,
}: TraderSummarySectionProps) {
  const mockAddress =
    '0x955b081079c839f2d765105e226efe6f2db3c35c6355a619c946c9ad1c1a003d'
  const userAddress = address ?? mockAddress

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    dataUpdatedAt,
  } = useAccountOverviews(
    userAddress,
    DeciDashConfig.DEVNET,
  )

  // Countdown timer for next refresh (30초 refetchInterval 기준)
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    // dataUpdatedAt이 변경되면 카운트다운 리셋
    setCountdown(30)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30 // 리셋
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [dataUpdatedAt])

  // First Loading (Skeleton)
  if (isLoading && !data) {
    return <TraderSummarySkeleton />
  }

  // Error State
  if (isError) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error'
    return (
      <TraderSummaryError errorMessage={errorMessage} />
    )
  }

  // Empty Data
  if (!data) {
    return <TraderSummaryEmpty />
  }

  // Background refetching indicator
  const isRefetching = isFetching && !isLoading

  // Debug: 전체 데이터 구조 확인

  // Extract data from AccountOverviews (SDK 타입 사용)
  const perpEquity = data.perp_equity_balance ?? 0
  const unrealizedPnL = data.unrealized_pnl ?? 0
  const spotValue = 0 // DTO에 spot 관련 필드 없음

  // Total Value = perp_equity_balance + unrealized_pnl
  const totalValue = perpEquity + unrealizedPnL

  // Withdrawable - SDK 타입에 없는 필드이므로 임시로 0 처리
  // TODO: 실제 API 응답 확인 후 수정 필요
  const withdrawable = 0

  const withdrawablePercent =
    totalValue > 0
      ? (withdrawable / totalValue) * 100
      : undefined

  // Leverage = cross_account_leverage_ratio (null일 수 있음)
  const leverage =
    data.cross_account_leverage_ratio ?? undefined

  // Total Position Value = total_margin
  const totalPositionValue = data.total_margin ?? 0

  return (
    <div className="relative flex w-full items-start gap-5 pb-2 pt-1">
      {/* Background Loading Indicator */}
      {isRefetching && (
        <div className="absolute right-0 top-0 z-10 flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/90 px-3 py-1 shadow-lg backdrop-blur-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          <span className="text-xs text-white/80">
            Updating...
          </span>
        </div>
      )}

      {/* Total Value */}
      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm leading-5 text-white/60">
            Total Value
          </p>
          <div className="flex items-center justify-center gap-2.5 rounded-full border border-stone-800 px-2 py-1">
            <p className="text-xs leading-4 text-white/60">
              Combined
            </p>
          </div>
        </div>
        <p className="whitespace-nowrap text-lg font-medium leading-7 text-white">
          {formatCurrency(totalValue)}
        </p>
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <p className="text-xs leading-4 text-white/60">
              Perp
            </p>
            <p className="text-xs leading-4 text-white">
              {formatCurrency(perpEquity)}
            </p>
          </div>
          <div className="flex items-center justify-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <p className="text-xs leading-4 text-white/60">
              Spot
            </p>
            <p className="text-xs leading-4 text-white">
              {formatCurrency(spotValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawable */}
      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm leading-5 text-white/60">
            Withdrawable
          </p>
          <div className="flex items-center justify-center gap-2.5 rounded-full border border-stone-800 px-2 py-1">
            <p className="text-xs leading-4 text-white/60">
              {formatPercentage(withdrawablePercent)}
            </p>
          </div>
        </div>
        <p className="whitespace-nowrap text-lg font-medium leading-7 text-white">
          {formatCurrency(withdrawable)}
        </p>
        <div className="flex items-center justify-center gap-1">
          <p className="text-xs leading-4 text-white/60">
            Free margin available
          </p>
        </div>
      </div>

      {/* Leverage */}
      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm leading-5 text-white/60">
            Leverage
          </p>
          <div className="flex items-center justify-center gap-2.5 rounded-full border border-[#ede030] px-2 py-1">
            <p className="text-xs leading-4 text-[#ede030]">
              {formatLeverage(leverage)}
            </p>
          </div>
        </div>
        <p className="whitespace-nowrap text-lg font-medium leading-7 text-white">
          {formatCurrency(totalPositionValue)}
        </p>
        <div className="flex items-center justify-center gap-1">
          <p className="text-xs leading-4 text-white/60">
            Total position value
          </p>
        </div>
      </div>

      {/* Right: Next refresh countdown */}
      <div className="flex min-w-0 grow flex-col items-end gap-2 whitespace-nowrap text-sm leading-5">
        <p className="text-white/60">
          Next refresh in{' '}
          {countdown.toString().padStart(2, '0')}s
        </p>
      </div>
    </div>
  )
}
