import { useMemo } from 'react'

import {
  type MarketWithPrice,
  useMarketsWithPrices,
} from '../api/queries'
import { useTradingStore } from '../store/trading-store'

interface MarketListPanelProps {
  isOpen: boolean
  onClose: () => void
  variant?: 'side' | 'bottom' // 좌측 패널 또는 하단 drawer
}

export default function MarketListPanel({
  isOpen,
  onClose,
  variant = 'bottom',
}: MarketListPanelProps) {
  const selectedMarket = useTradingStore(
    (s) => s.selectedMarket,
  )
  const setSelectedMarket = useTradingStore(
    (s) => s.setSelectedMarket,
  )

  const { data: markets = [], isLoading } =
    useMarketsWithPrices()

  console.log(markets)

  const sortedMarkets = useMemo(() => {
    const prioritySymbols = [
      'BTC',
      'SOL',
      'ETH',
      'APT',
      'APTOS',
    ]

    const getBaseSymbol = (name: string): string => {
      const base = name.split('/')[0] ?? name
      const parts = base.split('.')
      const symbol = parts[parts.length - 1] ?? base
      return symbol.toUpperCase()
    }

    const getPriorityScore = (name: string): number => {
      const symbol = getBaseSymbol(name)
      const normalized = symbol === 'APTOS' ? 'APT' : symbol
      const idx = prioritySymbols.indexOf(normalized)
      return idx === -1 ? Number.POSITIVE_INFINITY : idx
    }

    return [...markets].sort((a, b) => {
      const pa = getPriorityScore(a.market_name)
      const pb = getPriorityScore(b.market_name)
      if (pa !== pb) return pa - pb
      const volumeCompare =
        (b.volume24h ?? 0) - (a.volume24h ?? 0)
      if (volumeCompare !== 0) return volumeCompare
      const oiCompare =
        (b.openInterest ?? 0) - (a.openInterest ?? 0)
      if (oiCompare !== 0) return oiCompare
      return a.market_name.localeCompare(b.market_name)
    })
  }, [markets])

  const handleMarketSelect = (marketName: string) => {
    setSelectedMarket(marketName)
    onClose()
  }

  // 가격 포맷팅
  const formatPrice = (price?: number): string => {
    if (price === undefined) return '-'
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  // 24h 변동률 포맷팅
  const formatChangePercent = (
    percent?: number,
  ): string => {
    if (percent === undefined || percent === null)
      return 'N/A'
    const sign = percent >= 0 ? '+' : ''
    return `${sign}${percent.toFixed(2)}%`
  }

  // 마켓 아이콘 색상
  const getMarketColor = (market: string) => {
    const colors = [
      'bg-orange-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
    ]
    const index = market.charCodeAt(0) % colors.length
    return colors[index]
  }

  if (!isOpen) return null

  // 하단 drawer 스타일
  if (variant === 'bottom') {
    return (
      <div className="flex h-full w-full flex-col gap-[2px] overflow-hidden bg-stone-950 p-4">
        {/* 헤더 */}
        <div className="flex items-center gap-4 pb-3">
          <p className="text-[14px] font-semibold text-white">
            Pair List
          </p>
          <button
            onClick={onClose}
            className="ml-auto text-white/60 hover:text-white"
            aria-label="Close panel"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4L4 12M4 4L12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 마켓 리스트 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3">
              {sortedMarkets.map(
                (market: MarketWithPrice) => {
                  const isSelected =
                    market.market_name === selectedMarket
                  const priceChange =
                    market.priceChangePercent24h || 0
                  const priceColor =
                    priceChange >= 0
                      ? 'text-[#00c951]'
                      : 'text-[#fb2c36]'

                  return (
                    <button
                      key={market.market_name}
                      onClick={() =>
                        handleMarketSelect(
                          market.market_name,
                        )
                      }
                      className={`flex h-12 w-full items-center justify-between rounded-xl px-3 transition-colors hover:bg-white/5 ${
                        isSelected
                          ? 'bg-white/10'
                          : 'bg-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {/* 마켓 아이콘 */}
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${getMarketColor(market.market_name)} text-[10px] font-bold text-white`}
                        >
                          {market.market_name.charAt(0)}
                        </div>
                        <p className="text-[14px] font-medium text-white">
                          {market.market_name}
                        </p>
                      </div>

                      {/* 가격 및 변동률 */}
                      <div className="flex flex-col items-end gap-0.5">
                        <p
                          className={`text-[13px] font-medium ${
                            market.currentPrice !==
                            undefined
                              ? priceColor
                              : 'text-white/40'
                          }`}
                        >
                          {formatPrice(market.currentPrice)}
                        </p>
                        {/* 24h 변동률이 있을 때만 표시 */}
                        {market.priceChangePercent24h !==
                          undefined && (
                          <p
                            className={`text-[11px] font-medium ${priceColor}`}
                          >
                            {formatChangePercent(
                              market.priceChangePercent24h,
                            )}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                },
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 좌측 패널 스타일 (데스크톱)
  return (
    <div className="flex h-full w-[280px] flex-col gap-[2px] overflow-hidden rounded-[2px] bg-stone-950 p-[2px]">
      {/* 헤더 */}
      <div className="flex items-center gap-4 px-2 pb-1 pt-2">
        <p className="text-[12px] font-normal text-white/60">
          Pair List
        </p>
        <button
          onClick={onClose}
          className="ml-auto text-white/60 hover:text-white"
          aria-label="Close panel"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* 마켓 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          </div>
        ) : (
          sortedMarkets.map((market: MarketWithPrice) => {
            const isSelected =
              market.market_name === selectedMarket
            const priceChange =
              market.priceChangePercent24h || 0
            const priceColor =
              priceChange >= 0
                ? 'text-[#00c951]'
                : 'text-[#fb2c36]'

            return (
              <button
                key={market.market_name}
                onClick={() =>
                  handleMarketSelect(market.market_name)
                }
                className={`flex min-h-[48px] w-full flex-col gap-1 rounded-lg px-2 py-2 transition-colors hover:bg-white/5 ${
                  isSelected
                    ? 'bg-white/10'
                    : 'bg-transparent'
                }`}
              >
                {/* 상단: 마켓 이름 */}
                <div className="flex items-center gap-2">
                  {/* 마켓 아이콘 */}
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${getMarketColor(market.market_name)} text-[8px] font-bold text-white`}
                  >
                    {market.market_name.charAt(0)}
                  </div>
                  <p className="text-[13px] font-medium text-white">
                    {market.market_name}
                  </p>
                </div>

                {/* 하단: 가격과 변동률 */}
                <div className="flex items-baseline justify-between pl-6">
                  {/* 가격 - 크고 눈에 띄게 */}
                  <p
                    className={`text-[15px] font-semibold ${
                      market.currentPrice !== undefined
                        ? priceColor
                        : 'text-white/40'
                    }`}
                  >
                    {formatPrice(market.currentPrice)}
                  </p>

                  {/* 24h 변동률 - 작고 명확하게 */}
                  {market.priceChangePercent24h !==
                    undefined && (
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-[11px] font-medium ${priceColor}`}
                      >
                        {formatChangePercent(
                          market.priceChangePercent24h,
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
