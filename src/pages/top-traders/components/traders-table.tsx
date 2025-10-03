import { DeciDashConfig } from '@coldbell/decidash-ts-sdk'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Card,
  CardContent,
  CardTitle,
  DataTable,
  DataTableCell,
  DataTableFooter,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableRow,
  Dropdown,
  Input,
} from '@/shared/components'
import { generateAvatar } from '@/shared/utils/avatar'

import { useTraders } from '../api'
import TradersTableSkeleton from './traders-table-skeleton'

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 화폐 포맷 (간소화)
 */
const formatCurrency = (
  value: number | undefined,
): string => {
  if (value === undefined || value === null) return '$0.00'

  const isNegative = value < 0
  const absValue = Math.abs(value)

  let formatted = ''
  if (absValue >= 1_000_000_000) {
    formatted = `$${(absValue / 1_000_000_000).toFixed(2)}B`
  } else if (absValue >= 1_000_000) {
    formatted = `$${(absValue / 1_000_000).toFixed(2)}M`
  } else if (absValue >= 1_000) {
    formatted = `$${(absValue / 1_000).toFixed(2)}K`
  } else {
    formatted = `$${absValue.toFixed(2)}`
  }

  return isNegative ? `-${formatted}` : formatted
}

// ============================================
// 로컬 SearchInput 컴포넌트
// ============================================

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
}: SearchInputProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-[240px]"
      leftIcon={
        <svg
          className="size-4 shrink-0 text-white/60"
          fill="none"
          viewBox="0 0 16 16"
        >
          <circle
            cx="7.5"
            cy="7.5"
            r="5.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.5"
            d="m11.5 11.5 3 3"
          />
        </svg>
      }
    />
  )
}

/**
 * 퍼센트 포맷
 */
const formatPercentage = (
  value: number | undefined,
): string => {
  if (value === undefined || value === null) return '0.00%'
  return `${value >= 0 ? '' : ''}${value.toFixed(2)}%`
}

/**
 * 주소 축약
 */
const shortenAddress = (address: string): string => {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// ============================================
// Direction Bias Bar 컴포넌트
// ============================================

interface DirectionBiasBarProps {
  longPercentage: number
}

function DirectionBiasBar({
  longPercentage,
}: DirectionBiasBarProps) {
  // 항상 Long 기준으로 표시 (Short 비율이면 100 - longPercentage로 계산)
  const displayPercentage =
    longPercentage < 50
      ? Math.round(100 - longPercentage)
      : Math.round(longPercentage)

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-20 overflow-hidden rounded-full border border-white/5">
        <div
          className="h-full bg-green-500"
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      <p className="text-sm leading-5 text-white/60">
        {displayPercentage}% Long
      </p>
    </div>
  )
}

// ============================================
// Position Chip 컴포넌트
// ============================================

interface PositionChipProps {
  type: 'LONG' | 'SHORT'
}

function PositionChip({ type }: PositionChipProps) {
  if (type === 'SHORT') {
    return (
      <div className="rounded-lg border border-red-800 bg-[rgba(70,8,9,0.5)] px-2 py-1">
        <p className="text-xs leading-4 text-[#fb2c36]">
          SHORT
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-green-800 bg-[rgba(5,46,22,0.5)] px-2 py-1">
      <p className="text-xs leading-4 text-[#00c951]">
        LONG
      </p>
    </div>
  )
}

// ============================================
// PnL Cell 컴포넌트
// ============================================

interface PnLCellProps {
  amount: number
  percentage: number
}

function PnLCell({ amount, percentage }: PnLCellProps) {
  const isPositive = amount >= 0
  const textColor = isPositive
    ? 'text-[#00c951]'
    : 'text-[#fb2c36]'

  return (
    <div className="flex flex-col items-start justify-center gap-0.5">
      <p className={`text-sm leading-5 ${textColor}`}>
        {isPositive && '+'}
        {formatCurrency(amount)}
      </p>
      <p className="text-xs leading-4 text-white/60">
        {formatPercentage(percentage)}
      </p>
    </div>
  )
}

// ============================================
// 에러 상태 컴포넌트
// ============================================

interface TradersTableErrorProps {
  errorMessage?: string
}

function TradersTableError({
  errorMessage,
}: TradersTableErrorProps) {
  return (
    <Card className="p-6">
      <CardContent>
        <CardTitle>TRADERS</CardTitle>
        <p className="text-sm text-white/40">
          데이터를 불러올 수 없습니다
        </p>
        {errorMessage && (
          <p className="text-xs text-white/20">
            {errorMessage}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// 빈 데이터 상태 컴포넌트
// ============================================

function TradersTableEmpty() {
  return (
    <Card className="p-6">
      <CardContent>
        <CardTitle>TRADERS</CardTitle>
        <p className="text-sm text-white/40">
          트레이더 데이터가 없습니다
        </p>
        <div />
      </CardContent>
    </Card>
  )
}

// ============================================
// 메인 TradersTable 컴포넌트
// ============================================

export default function TradersTable() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('all_time_pnl')
  const sortDesc = true // 항상 내림차순 (높은 값부터)

  // Search debounce (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // 검색 시 첫 페이지로 이동
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  // perPage 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setPage(1)
  }, [perPage])

  const { data, isLoading, isError, error, isFetching } =
    useTraders(DeciDashConfig.DEVNET, {
      page,
      perPage,
      search: debouncedSearch,
      sortBy,
      sortDesc,
    })

  console.log('data', data)

  // 첫 로딩
  if (isLoading && !data) {
    return <TradersTableSkeleton />
  }

  // 에러 상태
  if (isError) {
    return (
      <TradersTableError errorMessage={error?.message} />
    )
  }

  // 빈 데이터
  if (!data || !data.traders || data.traders.length === 0) {
    return <TradersTableEmpty />
  }

  const { traders, total, total_pages } = data

  return (
    <Card className="p-6">
      <CardContent
        layout="custom"
        className="flex w-full flex-col gap-6"
      >
        {/* Header Section */}
        <div className="flex w-full shrink-0 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <p className="text-xl font-normal leading-7 text-white">
              Traders
            </p>
            <div className="flex size-3.5 items-center justify-center">
              <svg
                className="size-full text-white/60"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 13A6 6 0 1 0 7 1a6 6 0 0 0 0 12Z"
                />
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 9.5V7m0-2.5h.005"
                />
              </svg>
            </div>
            <p className="text-xs leading-4 text-white/60">
              Showing {(page - 1) * perPage + 1}-
              {Math.min(page * perPage, total)} of {total}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by address..."
            />
            {/* Sort Filter */}
            <Dropdown
              value={sortBy}
              onChange={(value) => {
                setSortBy(value as string)
                setPage(1)
              }}
              options={[
                {
                  label: 'All Time PnL',
                  value: 'all_time_pnl',
                },
                { label: 'Daily PnL', value: 'daily_pnl' },
                {
                  label: 'Weekly PnL',
                  value: 'weekly_pnl',
                },
                { label: '30D PnL', value: 'monthly_pnl' },
                {
                  label: 'Perp Equity',
                  value: 'perp_equity',
                },
              ]}
              className="min-w-[140px]"
            />
          </div>
        </div>

        {/* Refetching Indicator */}
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2">
            <div className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            <p className="text-xs text-white/40">
              업데이트 중...
            </p>
          </div>
        )}

        {/* Table - overflow-x-auto 추가로 가로 스크롤 가능하게 */}
        <div className="w-full overflow-x-auto">
          <DataTable>
            {/* Table Header */}
            <DataTableHeader>
              <DataTableHeaderCell
                width="grow"
                minWidth={220}
              >
                Trader
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="grow"
                minWidth={112}
              >
                Perp Equity
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="fixed"
                fixedWidth={220}
              >
                Main Position
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="fixed"
                fixedWidth={220}
              >
                Direction Bias
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="grow"
                minWidth={112}
              >
                Daily PnL
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="grow"
                minWidth={112}
              >
                Weekly PnL
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="grow"
                minWidth={112}
              >
                30D PnL
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="grow"
                minWidth={112}
              >
                All Time PnL
              </DataTableHeaderCell>
            </DataTableHeader>

            {/* Table Rows */}
            {traders.map((trader, index) => (
              <DataTableRow
                key={`${trader.address}-${page}-${index}`}
                onClick={() =>
                  navigate(`/top-traders/${trader.address}`)
                }
                className="cursor-pointer"
              >
                {/* Trader */}
                <DataTableCell width="grow" minWidth={220}>
                  <img
                    src={generateAvatar(trader.address, 24)}
                    alt="Trader avatar"
                    className="size-6 rounded-full"
                  />
                  <p className="text-sm leading-5 text-white">
                    {shortenAddress(trader.address)}
                  </p>
                  <svg
                    className="size-4 text-white/40"
                    fill="none"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill="currentColor"
                      d="M8 1.45 10.09 5.7l4.66.68-3.37 3.29.8 4.63L8 12.09l-4.18 2.2.8-4.63L1.25 6.38l4.66-.68L8 1.45Z"
                    />
                  </svg>
                </DataTableCell>

                {/* Perp Equity */}
                <DataTableCell width="grow" minWidth={112}>
                  <p className="text-sm font-medium leading-5 text-white">
                    {formatCurrency(trader.perp_equity)}
                  </p>
                </DataTableCell>

                {/* Main Position */}
                <DataTableCell
                  width="fixed"
                  fixedWidth={220}
                >
                  {trader.main_position ? (
                    <>
                      <PositionChip
                        type={trader.main_position.type}
                      />
                      <p className="text-sm leading-5 text-white/60">
                        {trader.main_position.asset}
                      </p>
                      <p className="text-sm font-medium leading-5 text-white">
                        {formatCurrency(
                          trader.main_position.amount,
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-medium leading-5 text-white">
                      $0.00
                    </p>
                  )}
                </DataTableCell>

                {/* Direction Bias */}
                <DataTableCell
                  width="fixed"
                  fixedWidth={220}
                >
                  <DirectionBiasBar
                    longPercentage={
                      trader.direction_bias.long_percentage
                    }
                  />
                </DataTableCell>

                {/* Daily PnL */}
                <DataTableCell width="grow" minWidth={112}>
                  <PnLCell
                    amount={trader.daily_pnl.amount}
                    percentage={trader.daily_pnl.percentage}
                  />
                </DataTableCell>

                {/* Weekly PnL */}
                <DataTableCell width="grow" minWidth={112}>
                  <PnLCell
                    amount={trader.weekly_pnl.amount}
                    percentage={
                      trader.weekly_pnl.percentage
                    }
                  />
                </DataTableCell>

                {/* 30D PnL */}
                <DataTableCell width="grow" minWidth={112}>
                  <PnLCell
                    amount={trader.monthly_pnl.amount}
                    percentage={
                      trader.monthly_pnl.percentage
                    }
                  />
                </DataTableCell>

                {/* All Time PnL */}
                <DataTableCell width="grow" minWidth={112}>
                  <PnLCell
                    amount={trader.all_time_pnl.amount}
                    percentage={
                      trader.all_time_pnl.percentage
                    }
                  />
                </DataTableCell>
              </DataTableRow>
            ))}

            {/* Footer */}
            <DataTableFooter>
              <div className="relative flex h-full items-center gap-2 px-4 pt-4">
                <p className="text-sm leading-5 text-white">
                  Rows per page:
                </p>
                <Dropdown
                  value={perPage}
                  onChange={(value) => {
                    const numValue = Number(value)
                    setPerPage(numValue)
                  }}
                  options={[
                    { label: '10', value: 10 },
                    { label: '25', value: 25 },
                    { label: '50', value: 50 },
                    { label: '100', value: 100 },
                  ]}
                  direction="up"
                />
              </div>
              <div className="flex h-full items-center gap-2 pt-4">
                <button
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  disabled={page === 1}
                  className="flex size-9 items-center justify-center rounded-lg transition-opacity disabled:opacity-20"
                >
                  <svg
                    className="size-5 rotate-90 text-white"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="m5 7.5 5 5 5-5"
                    />
                  </svg>
                </button>
                <p className="text-sm leading-5 text-white">
                  Page {page} of {total_pages}
                </p>
                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(total_pages, p + 1),
                    )
                  }
                  disabled={page >= total_pages}
                  className="flex size-9 items-center justify-center rounded-lg transition-opacity disabled:opacity-100"
                >
                  <svg
                    className="size-5 -rotate-90 text-white"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="m5 7.5 5 5 5-5"
                    />
                  </svg>
                </button>
              </div>
            </DataTableFooter>
          </DataTable>
        </div>
      </CardContent>
    </Card>
  )
}
