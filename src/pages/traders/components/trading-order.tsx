import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import {
  type DepthLevel,
  useMarketDepthStream as useMarketDepth,
} from '../api'
import { useTradingStore } from '../store/trading-store'
import TradingOrderSkeleton from './trading-order-skeleton'

type Tab = 'orderbook' | 'trades'

/**
 * 에러 상태 컴포넌트
 */
function TradingOrderError({
  errorMessage,
}: {
  errorMessage?: string
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-stone-950">
      <div className="text-sm text-red-400">
        {errorMessage || 'Unable to load order book'}
      </div>
    </div>
  )
}

/**
 * 빈 데이터 상태 컴포넌트
 */
function TradingOrderEmpty() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-stone-950">
      <div className="text-sm text-white/40">
        No order book data available
      </div>
    </div>
  )
}

export default function TradingOrder() {
  const market = useTradingStore((s) => s.selectedMarket)
  const [activeTab, setActiveTab] =
    useState<Tab>('orderbook')
  const [depthLevel] = useState<number>(1)

  // 컨테이너 높이에 따라 동적으로 표시할 행 수 계산
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [rowsPerSide, setRowsPerSide] = useState<number>(11)

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      const totalH = rect.height
      // 행 높이 약 22px
      const rowH = 22
      const halfH = Math.max(0, totalH / 2)
      const next = Math.max(3, Math.floor(halfH / rowH))
      setRowsPerSide(next)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const {
    data: marketDepth,
    isLoading,
    isError,
    error,
    isFetching,
  } = useMarketDepth(market, rowsPerSide)

  // 첫 로딩 (스켈레톤) - 데이터가 없을 때
  if (isLoading && !marketDepth) {
    return <TradingOrderSkeleton />
  }

  // 에러 상태
  if (isError) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류'
    return <TradingOrderError errorMessage={errorMessage} />
  }

  // 빈 데이터 처리
  if (
    !marketDepth ||
    (!marketDepth.bids.length && !marketDepth.asks.length)
  ) {
    return <TradingOrderEmpty />
  }

  const { bids = [], asks = [] } = marketDepth

  // 백그라운드 로딩 여부
  const isRefetching = isFetching && !isLoading

  const maxAskTotal = asks.length
    ? asks[asks.length - 1].total
    : 1
  const maxBidTotal = bids.length
    ? bids[bids.length - 1].total
    : 1

  // Spread 계산
  const spread =
    asks.length > 0 && bids.length > 0
      ? asks[0].price - bids[0].price
      : 0
  const spreadPercent =
    asks.length > 0 && asks[0].price > 0
      ? (spread / asks[0].price) * 100
      : 0

  // 심볼에서 base asset 추출 (예: APT/USD -> APT)
  const baseAsset = market.split('/')[0] || 'BTC'

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2px]">
      {/* 백그라운드 로딩 인디케이터 */}
      {isRefetching && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full border border-stone-700 bg-stone-900/90 px-2 py-1 shadow-lg backdrop-blur-sm">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
        </div>
      )}

      {/* 탭 영역 */}
      <div className="flex h-10 items-center gap-0 border-b border-white/5 bg-stone-950">
        <button
          onClick={() => setActiveTab('orderbook')}
          className={`flex h-full items-center justify-center border-b-[1.5px] px-4 pb-1 ${
            activeTab === 'orderbook'
              ? 'border-[#ede030] text-white'
              : 'border-transparent text-white/60 hover:text-white/80'
          }`}
        >
          <span className="text-xs font-normal leading-4">
            Orderbook
          </span>
        </button>
        <button
          onClick={() => setActiveTab('trades')}
          className={`flex h-full items-center justify-center border-b-[1.5px] px-4 pb-1 ${
            activeTab === 'trades'
              ? 'border-[#ede030] text-white'
              : 'border-transparent text-white/60 hover:text-white/80'
          }`}
        >
          <span className="text-xs font-normal leading-4">
            Trades
          </span>
        </button>
      </div>

      {/* 오더북 컨텐츠 */}
      {activeTab === 'orderbook' && (
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 bg-stone-950">
          {/* 드롭다운 영역 */}
          <div className="flex h-6 items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-1">
              <span className="text-xs text-white">
                {depthLevel}
              </span>
              <button className="flex items-center">
                <ChevronDown
                  size={12}
                  className="text-white"
                />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-white">
                {baseAsset}
              </span>
              <button className="flex items-center">
                <ChevronDown
                  size={12}
                  className="text-white"
                />
              </button>
            </div>
          </div>

          {/* 테이블 헤더 */}
          <div className="flex h-4 gap-2 px-2 text-xs text-white/60">
            <span className="flex-1">Price</span>
            <span className="flex-1 text-right">
              Size ({baseAsset})
            </span>
            <span className="flex-1 text-right">
              Total ({baseAsset})
            </span>
          </div>

          {/* 오더북 데이터 */}
          <div
            ref={containerRef}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            {/* Asks (매도 주문) */}
            <div className="flex min-h-0 flex-1 flex-col justify-end gap-0.5">
              {asks.map((level: DepthLevel, i: number) => (
                <div
                  key={`ask-${i}`}
                  className="relative flex h-[22px] gap-2 px-2"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-[rgba(70,8,9,0.5)]"
                    style={{
                      width: `${Math.min(100, (level.total / maxAskTotal) * 100)}%`,
                    }}
                  />
                  <span className="relative flex-1 text-xs leading-[normal] text-[#fb2c36]">
                    {level.price.toLocaleString()}
                  </span>
                  <span className="relative flex-1 text-right text-xs leading-[normal] text-white">
                    {level.size.toFixed(5)}
                  </span>
                  <span className="relative flex-1 text-right text-xs leading-[normal] text-white">
                    {level.total.toFixed(5)}
                  </span>
                </div>
              ))}
            </div>

            {/* Spread */}
            <div className="flex h-[22px] items-center justify-center gap-3 bg-white/5 px-2 text-xs text-white">
              <span>Spread</span>
              <span className="text-right">
                {spread.toFixed(2)}
              </span>
              <span className="text-right">
                {spreadPercent.toFixed(3)}%
              </span>
            </div>

            {/* Bids (매수 주문) */}
            <div className="flex min-h-0 flex-1 flex-col justify-start gap-0.5">
              {bids.map((level: DepthLevel, i: number) => (
                <div
                  key={`bid-${i}`}
                  className="relative flex h-[22px] gap-2 px-2"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-[rgba(5,46,22,0.5)]"
                    style={{
                      width: `${Math.min(100, (level.total / maxBidTotal) * 100)}%`,
                    }}
                  />
                  <span className="relative flex-1 text-xs leading-[normal] text-[#00c951]">
                    {level.price.toLocaleString()}
                  </span>
                  <span className="relative flex-1 text-right text-xs leading-[normal] text-white">
                    {level.size.toFixed(5)}
                  </span>
                  <span className="relative flex-1 text-right text-xs leading-[normal] text-white">
                    {level.total.toFixed(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trades 탭 (추후 구현) */}
      {activeTab === 'trades' && (
        <div className="flex min-h-0 flex-1 items-center justify-center bg-stone-950">
          <span className="text-sm text-white/40">
            Trades coming soon...
          </span>
        </div>
      )}
    </div>
  )
}
