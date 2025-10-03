import { DeciDashConfig } from '@coldbell/decidash-ts-sdk'
import { useState } from 'react'

import { Card, CardContent } from '@/shared/components'

import {
  useAccountOverviews,
  usePortfolioChart,
} from '../api/queries'

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

// ============================================
// Skeleton Components
// ============================================

function EquityOverviewSkeleton() {
  return (
    <Card className="w-full flex-none">
      <CardContent
        layout="custom"
        className="flex w-full items-start gap-10 overflow-clip p-6"
      >
        {/* Left Panel Skeleton */}
        <div className="flex max-w-[288px] shrink-0 grow-0 basis-auto flex-col gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-6 w-32 animate-pulse rounded bg-white/10" />
              <div className="h-3 w-full animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>

        {/* Right Panel Skeleton */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="h-8 w-40 animate-pulse rounded-xl bg-white/10" />
            <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
          </div>
          <div className="min-h-[300px] w-full flex-1 animate-pulse rounded-xl bg-white/10" />
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Error Component
// ============================================

function EquityOverviewError({
  errorMessage,
}: {
  errorMessage?: string
}) {
  return (
    <Card className="w-full flex-none">
      <CardContent
        layout="custom"
        className="flex w-full items-start gap-10 overflow-clip p-6"
      >
        <div className="flex max-w-[288px] shrink-0 grow-0 basis-auto flex-col gap-2">
          <p className="text-sm leading-5 text-white/60">
            Perp Equity
          </p>
          <p className="text-lg text-red-400">
            Unable to load data
          </p>
          {errorMessage && (
            <p className="mt-1 text-xs text-white/40">
              {errorMessage}
            </p>
          )}
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          <p className="text-sm leading-5 text-white/60">
            24H PnL (Combined)
          </p>
          <p className="text-sm text-white/40">
            Chart unavailable
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Chart Component
// ============================================

interface PortfolioChartProps {
  address?: string
  range: '1d' | '7d' | '30d' | '90d' | '180d'
}

function PortfolioChart({
  address,
  range,
}: PortfolioChartProps) {
  const mockAddress =
    '0x955b081079c839f2d765105e226efe6f2db3c35c6355a619c946c9ad1c1a003d'
  const userAddress = address ?? mockAddress

  const { data, isLoading, isError } = usePortfolioChart(
    userAddress,
    range,
    'pnl',
    DeciDashConfig.DEVNET,
  )

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-xl border border-white/5 bg-stone-900">
        <p className="text-xs text-white/40">
          Loading chart...
        </p>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-xl border border-white/5 bg-stone-900">
        <p className="text-xs text-white/40">
          Chart data unavailable
        </p>
      </div>
    )
  }

  // TODO: 실제 차트 라이브러리 (예: recharts, lightweight-charts) 연동
  return (
    <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-xl border border-white/5 bg-stone-900">
      <p className="text-xs text-white/60">
        Chart: {data.length} data points
      </p>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

interface EquityOverviewSectionProps {
  address?: string
}

export default function EquityOverviewSection({
  address,
}: EquityOverviewSectionProps) {
  const mockAddress =
    '0x955b081079c839f2d765105e226efe6f2db3c35c6355a619c946c9ad1c1a003d'
  const userAddress = address ?? mockAddress

  const [chartRange, setChartRange] = useState<
    '1d' | '7d' | '30d' | '90d' | '180d'
  >('1d')

  const { data, isLoading, isError, error } =
    useAccountOverviews(userAddress, DeciDashConfig.DEVNET)

  // First Loading (Skeleton)
  if (isLoading && !data) {
    return <EquityOverviewSkeleton />
  }

  // Error State
  if (isError) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Unknown error'
    return (
      <EquityOverviewError errorMessage={errorMessage} />
    )
  }

  // Empty Data
  if (!data) {
    return (
      <EquityOverviewError errorMessage="No data available" />
    )
  }

  // Debug: 전체 데이터 구조 확인
  console.log('[EquityOverviewSection] Full data:', data)

  // Extract data (SDK 타입 사용)
  const perpEquity = data.perp_equity_balance ?? 0
  const unrealizedPnL = data.unrealized_pnl ?? 0
  const marginRatio = data.cross_margin_ratio ?? 0

  // Direction Bias (임시: 100% LONG)
  const longExposure = 100
  const isLong = longExposure >= 50

  // Position Distribution (임시: perpEquity)
  const positionValue = perpEquity

  // Unrealized PnL ROE (임시: 계산)
  const roe =
    perpEquity > 0
      ? (unrealizedPnL / perpEquity) * 100
      : undefined

  return (
    <Card className="w-full flex-none">
      <CardContent
        layout="custom"
        className="flex w-full items-start gap-10 overflow-clip p-6"
      >
        {/* Left Panel */}
        <div className="flex max-w-[288px] shrink-0 grow-0 basis-auto flex-col gap-5">
          {/* Perp Equity */}
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-5 text-white/60">
              Perp Equity
            </p>
            <p className="text-2xl font-medium leading-8 text-white">
              {formatCurrency(perpEquity)}
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs leading-4">
                <p className="text-white/60">
                  Margin Usage
                </p>
                <p className="text-white">
                  {formatPercentage(marginRatio * 100)}
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[#00c951]"
                  style={{
                    width: `${Math.min(marginRatio * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          {/* Direction Bias */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm leading-5 text-white/60">
                Direction Bias
              </p>
              <div className="flex items-center gap-1">
                <svg
                  className={`h-4 w-4 ${
                    isLong
                      ? 'text-[#00c951]'
                      : 'text-red-500'
                  }`}
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M8 2v12M2 8h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <p
                  className={`text-sm leading-5 ${
                    isLong
                      ? 'text-[#00c951]'
                      : 'text-red-500'
                  }`}
                >
                  {isLong ? 'LONG' : 'SHORT'}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs leading-4">
                <p className="text-white/60">
                  Long Exposure
                </p>
                <p className="text-[#00c951]">
                  {formatPercentage(longExposure)}
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[#00c951]"
                  style={{ width: `${longExposure}%` }}
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          {/* Position Distribution */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm leading-5 text-white/60">
                Position Distribution
              </p>
              <div className="flex items-center gap-1">
                <div className="h-2.5 w-2.5 rounded-full bg-[#00c951]" />
                <p className="text-sm leading-5 text-[#00c951]">
                  100.00%
                </p>
              </div>
            </div>
            <div className="flex h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-lg bg-[rgba(5,46,22,0.5)]">
              <p className="text-sm leading-5 text-[#00c951]">
                {formatCurrency(positionValue)}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          {/* Unrealized PnL */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm leading-5 text-white/60">
                Unrealized PnL
              </p>
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4 text-[#00c951]"
                  fill="none"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M3 9l3 3 7-7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-sm leading-5 text-[#00c951]">
                  {formatPercentage(roe)} ROE
                </p>
              </div>
            </div>
            <p className="text-lg font-medium leading-7 text-[#00c951]">
              {formatCurrency(unrealizedPnL)}
            </p>
          </div>
        </div>

        {/* Right Panel - Chart */}
        <div className="flex min-h-[400px] min-w-0 flex-1 flex-col gap-5">
          {/* Header: Range Tabs + PnL Value */}
          <div className="flex w-full shrink-0 items-center justify-between gap-6">
            {/* Range Tabs */}
            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-stone-800 p-1">
              {(
                [
                  { label: '24H', range: '1d' },
                  { label: '1W', range: '7d' },
                  { label: '1M', range: '30d' },
                  { label: 'All', range: '180d' },
                ] as const
              ).map(({ label, range }, idx) => {
                const isActive = chartRange === range
                return (
                  <button
                    key={idx}
                    onClick={() => setChartRange(range)}
                    className={`flex h-8 items-center justify-center gap-1 rounded-lg px-3 text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#ede030] text-stone-950'
                        : 'text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {/* 24H PnL Value */}
            <div className="flex min-w-0 flex-1 flex-col items-end gap-1">
              <p className="text-sm leading-5 text-white/60">
                24H PnL (Combined)
              </p>
              <p className="text-xl font-medium leading-7 text-[#00c951]">
                {formatCurrency(unrealizedPnL)}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="flex h-[320px] min-w-0 flex-1">
            <PortfolioChart
              address={address}
              range={chartRange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
