import { ChevronDown, Filter, Search } from 'lucide-react'
import { useState } from 'react'

// 칩 컴포넌트
interface ChipDirectionProps {
  type: 'long' | 'short' | 'none'
}

function ChipDirection({ type }: ChipDirectionProps) {
  if (type === 'short') {
    return (
      <div className="flex items-center justify-center gap-2.5 rounded-lg border border-[#9f0712] bg-[rgba(70,8,9,0.5)] px-2 py-1">
        <span className="text-xs leading-4 text-[#fb2c36]">
          SHORT
        </span>
      </div>
    )
  }
  if (type === 'none') {
    return (
      <div className="h-1.5 w-5 rounded-lg border border-[#9f0712] bg-[rgba(70,8,9,0.5)]" />
    )
  }
  return (
    <div className="flex items-center justify-center gap-2.5 rounded-lg border border-[#016630] bg-[rgba(5,46,22,0.5)] px-2 py-1">
      <span className="text-xs leading-4 text-[#00c951]">
        LONG
      </span>
    </div>
  )
}

// 테이블 데이터 타입
interface TraderData {
  id: string
  address: string
  perpEquity: string
  mainPosition: {
    type: 'long' | 'short' | 'none'
    symbol: string
    value: string
  }
  directionBias: {
    longPercent: number
    label: string
  }
  dailyPnL: {
    value: string
    percent: string
    isProfit: boolean
  }
  weeklyPnL: {
    value: string
    percent: string
    isProfit: boolean
  }
  thirtyDayPnL: {
    value: string
    percent: string
    isProfit: boolean
  }
  allTimePnL: {
    value: string
    percent: string
    isProfit: boolean
  }
  isHighlighted?: boolean
}

// 더미 데이터
const dummyTraders: TraderData[] = [
  {
    id: '1',
    address: '0x8af7...fa05',
    perpEquity: '$17.78M',
    mainPosition: {
      type: 'short',
      symbol: 'XRP',
      value: '$17.35M',
    },
    directionBias: { longPercent: 22, label: '22% Long' },
    dailyPnL: {
      value: '-$972.9K',
      percent: '-5.44%',
      isProfit: false,
    },
    weeklyPnL: {
      value: '$2.50M',
      percent: '14.0%',
      isProfit: true,
    },
    thirtyDayPnL: {
      value: '-$972.9K',
      percent: '-26.1%',
      isProfit: false,
    },
    allTimePnL: {
      value: '$972.9M',
      percent: '250%',
      isProfit: true,
    },
  },
  {
    id: '2',
    address: '0x8af7...fa05',
    perpEquity: '$17.78M',
    mainPosition: {
      type: 'long',
      symbol: 'XRP',
      value: '$17.35M',
    },
    directionBias: { longPercent: 100, label: '100% Long' },
    dailyPnL: {
      value: '-$972.9K',
      percent: '-5.44%',
      isProfit: false,
    },
    weeklyPnL: {
      value: '$2.50M',
      percent: '14.0%',
      isProfit: true,
    },
    thirtyDayPnL: {
      value: '-$972.9K',
      percent: '-26.1%',
      isProfit: false,
    },
    allTimePnL: {
      value: '$972.9M',
      percent: '173%',
      isProfit: true,
    },
  },
  {
    id: '3',
    address: '0x8af7...fa05',
    perpEquity: '$17.78M',
    mainPosition: {
      type: 'long',
      symbol: 'XRP',
      value: '$17.35M',
    },
    directionBias: { longPercent: 22, label: '22% Long' },
    dailyPnL: {
      value: '$972.9K',
      percent: '-5.44%',
      isProfit: true,
    },
    weeklyPnL: {
      value: '$2.50M',
      percent: '14.0%',
      isProfit: true,
    },
    thirtyDayPnL: {
      value: '$972.9K',
      percent: '-26.1%',
      isProfit: true,
    },
    allTimePnL: {
      value: '$972.9M',
      percent: '113%',
      isProfit: true,
    },
    isHighlighted: true,
  },
]

export default function TradersTable() {
  const [page] = useState(1)
  const [rowsPerPage] = useState(50)

  return (
    <div className="w-full rounded-3xl border border-stone-800 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl leading-7 text-white">
            Traders
          </h2>
          <ChevronDown className="size-3.5 text-white/40" />
          <span className="text-xs leading-4 text-white/60">
            Showing 1-50 of 1000
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Search Input */}
          <div className="flex h-9 items-center gap-2 rounded-lg border border-stone-800 px-3">
            <Search className="size-4 text-white" />
            <input
              type="text"
              placeholder="Search by address..."
              className="w-[180px] bg-transparent text-xs leading-4 text-white outline-none placeholder:text-white"
            />
          </div>
          {/* Filters Button */}
          <button className="flex h-9 items-center justify-center gap-1 rounded-lg bg-stone-900 px-3">
            <Filter className="size-4 text-white" />
            <span className="text-xs font-medium text-white">
              Filters
            </span>
            <ChevronDown className="size-4 text-white" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col">
        {/* Table Header */}
        <div className="flex h-12 items-center border-b border-white/5">
          <div className="flex min-w-[220px] flex-1 items-center gap-0.5 px-4">
            <span className="text-sm leading-5 text-white/60">
              Trader
            </span>
          </div>
          <div className="flex min-w-[112px] flex-1 items-center gap-0.5 px-4">
            <span className="text-sm leading-5 text-white/60">
              Perp Equity
            </span>
          </div>
          <div className="flex w-[220px] items-center gap-0.5 px-4">
            <span className="text-sm leading-5 text-white/60">
              Main Position
            </span>
          </div>
          <div className="flex w-[220px] items-center gap-0.5 px-4">
            <span className="text-sm leading-5 text-white/60">
              Direction Bias
            </span>
          </div>
          <div className="flex min-w-[112px] flex-1 items-center gap-0.5 px-4">
            <span className="text-sm leading-5 text-white/60">
              Daily PnL
            </span>
          </div>
          <div className="flex min-w-[112px] flex-1 items-center gap-0.5 px-4">
            <span className="text-sm leading-5 text-white/60">
              Weekly PnL
            </span>
          </div>
          <div className="flex min-w-[112px] flex-1 items-center gap-0.5 px-4">
            <span className="text-sm leading-5 text-white/60">
              30D PnL
            </span>
          </div>
          <div className="flex min-w-[112px] flex-1 items-center gap-0.5 px-4">
            <span className="text-sm leading-5 text-white/60">
              All Time PnL
            </span>
            <ChevronDown className="size-4 text-white/60" />
          </div>
        </div>

        {/* Table Rows */}
        {dummyTraders.map((trader) => (
          <div
            key={trader.id}
            className={`flex h-16 items-center ${trader.isHighlighted ? 'bg-stone-900' : ''}`}
          >
            {/* Trader */}
            <div className="flex min-w-[220px] flex-1 items-center gap-2 px-4">
              <div className="size-6 overflow-hidden rounded-full bg-gradient-to-br from-purple-400 to-pink-600" />
              <span
                className={`text-sm leading-5 ${trader.isHighlighted ? 'text-[#ede030] underline' : 'text-white'}`}
              >
                {trader.address}
              </span>
              <svg
                className="size-4 text-white/20"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 2a.5.5 0 01.5.5v5h5a.5.5 0 010 1h-5v5a.5.5 0 01-1 0v-5h-5a.5.5 0 010-1h5v-5A.5.5 0 018 2z" />
              </svg>
            </div>

            {/* Perp Equity */}
            <div className="flex min-w-[112px] flex-1 items-center gap-2 px-4">
              <span className="text-sm font-medium leading-5 text-white">
                {trader.perpEquity}
              </span>
            </div>

            {/* Main Position */}
            <div className="flex w-[220px] items-center gap-2 px-4">
              <ChipDirection
                type={trader.mainPosition.type}
              />
              <span className="text-sm leading-5 text-white/60">
                {trader.mainPosition.symbol}
              </span>
              <span className="text-sm font-medium leading-5 text-white">
                {trader.mainPosition.value}
              </span>
            </div>

            {/* Direction Bias */}
            <div className="flex w-[220px] items-center gap-2 px-4">
              <div className="h-1.5 w-20 overflow-hidden rounded-full border border-white/5">
                <div
                  className="h-full bg-[#00c951]"
                  style={{
                    width: `${trader.directionBias.longPercent}%`,
                  }}
                />
              </div>
              <span className="text-sm leading-5 text-white/60">
                {trader.directionBias.label}
              </span>
            </div>

            {/* Daily PnL */}
            <div className="flex min-w-[112px] flex-1 flex-col justify-center gap-0.5 px-4">
              <span
                className={`text-sm leading-5 ${trader.dailyPnL.isProfit ? 'text-[#00c951]' : 'text-[#fb2c36]'}`}
              >
                {trader.dailyPnL.value}
              </span>
              <span className="text-xs leading-4 text-white/60">
                {trader.dailyPnL.percent}
              </span>
            </div>

            {/* Weekly PnL */}
            <div className="flex min-w-[112px] flex-1 flex-col justify-center gap-0.5 px-4">
              <span
                className={`text-sm leading-5 ${trader.weeklyPnL.isProfit ? 'text-[#00c951]' : 'text-[#fb2c36]'}`}
              >
                {trader.weeklyPnL.value}
              </span>
              <span className="text-xs leading-4 text-white/60">
                {trader.weeklyPnL.percent}
              </span>
            </div>

            {/* 30D PnL */}
            <div className="flex min-w-[112px] flex-1 flex-col justify-center gap-0.5 px-4">
              <span
                className={`text-sm leading-5 ${trader.thirtyDayPnL.isProfit ? 'text-[#00c951]' : 'text-[#fb2c36]'}`}
              >
                {trader.thirtyDayPnL.value}
              </span>
              <span className="text-xs leading-4 text-white/60">
                {trader.thirtyDayPnL.percent}
              </span>
            </div>

            {/* All Time PnL */}
            <div className="flex min-w-[112px] flex-1 flex-col justify-center gap-0.5 px-4">
              <span
                className={`text-sm leading-5 ${trader.allTimePnL.isProfit ? 'text-[#00c951]' : 'text-[#fb2c36]'}`}
              >
                {trader.allTimePnL.value}
              </span>
              <span className="text-xs leading-4 text-white/60">
                {trader.allTimePnL.percent}
              </span>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="flex h-14 items-end justify-between border-t border-white/5 pb-0 pt-4">
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm leading-5 text-white">
              Rows per page:
            </span>
            <button className="flex h-9 items-center gap-1 rounded-lg border border-stone-800 px-3">
              <span className="text-xs leading-4 text-white">
                {rowsPerPage}
              </span>
              <ChevronDown className="size-4 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex size-9 rotate-180 items-center justify-center rounded-lg opacity-20">
              <ChevronDown className="size-5 -rotate-90 text-white" />
            </button>
            <span className="text-sm leading-5 text-white">
              Page {page} of 20
            </span>
            <button className="flex size-9 items-center justify-center rounded-lg">
              <ChevronDown className="size-5 -rotate-90 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
