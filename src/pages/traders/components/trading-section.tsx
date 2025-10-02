import { useState } from 'react'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels'

import {
  type MarketCandlesticksInterval,
  useMarketNames,
  useMarketPrice,
} from '../api'
import { useTradingStore } from '../store/trading-store'
import ChartControls from './chart-controls'
import MarketCandleChart from './market-candle-chart'
import TradingHeader from './trading-header'
import TradingOrder from './trading-order'

type TimeInterval = '1m' | '15m' | '1h' | 'D'

// 인터벌을 차트에서 사용하는 형식으로 변환
const intervalToChartFormat = (
  interval: TimeInterval,
): MarketCandlesticksInterval => {
  const mapping: Record<
    TimeInterval,
    MarketCandlesticksInterval
  > = {
    '1m': '1m',
    '15m': '15m',
    '1h': '1h',
    D: '1d',
  }
  return mapping[interval]
}

/**
 * 에러 상태 컴포넌트
 */
function TradingSectionError({
  errorMessage,
}: {
  errorMessage?: string
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-[2px]">
      <div className="flex h-16 w-full items-center justify-center rounded-[2px] bg-stone-950">
        <p className="text-sm text-red-400">
          Unable to load trading section
          {errorMessage && `: ${errorMessage}`}
        </p>
      </div>
    </div>
  )
}

/**
 * 빈 데이터 상태 컴포넌트
 */
function TradingSectionEmpty() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-[2px]">
      <div className="flex h-16 w-full items-center justify-center rounded-[2px] bg-stone-950">
        <p className="text-sm text-white/40">
          No trading data available
        </p>
      </div>
    </div>
  )
}

export default function TradingSection() {
  const selectedMarket = useTradingStore(
    (s) => s.selectedMarket,
  )
  const [selectedInterval, setSelectedInterval] =
    useState<TimeInterval>('15m')

  // 마켓 정보 및 가격 데이터 가져오기 (헤더용)
  const {
    data: markets,
    isLoading: isMarketsLoading,
    isError: isMarketsError,
    error: marketsError,
  } = useMarketNames()

  const {
    data: priceData,
    isLoading: isPriceLoading,
    isError: isPriceError,
    error: priceError,
    isFetching: isPriceFetching,
  } = useMarketPrice(selectedMarket)

  // 백그라운드 로딩 여부
  const isRefetching = isPriceFetching && !isPriceLoading

  // 헤더 데이터 에러 상태
  if (isMarketsError || isPriceError) {
    const errorMessage =
      marketsError instanceof Error
        ? marketsError.message
        : priceError instanceof Error
          ? priceError.message
          : '알 수 없는 오류'
    return (
      <TradingSectionError errorMessage={errorMessage} />
    )
  }

  // 헤더 데이터 빈 상태
  if (
    !isMarketsLoading &&
    (!markets ||
      markets.length === 0 ||
      priceData === undefined)
  ) {
    return <TradingSectionEmpty />
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col gap-[2px]">
      {/* 백그라운드 로딩 인디케이터 */}
      {isRefetching && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          <span className="text-xs text-white/80">
            Updating...
          </span>
        </div>
      )}

      {/* 상단 헤더 */}
      <TradingHeader />

      {/* 차트와 주문 영역 */}
      <div className="flex min-h-0 flex-1 rounded-[2px] bg-stone-950">
        <PanelGroup direction="horizontal">
          {/* 차트 영역 */}
          <Panel defaultSize={70} minSize={30}>
            <div className="flex h-full min-h-0 flex-col">
              {/* 차트 컨트롤 */}
              <ChartControls
                selectedInterval={selectedInterval}
                onIntervalChange={setSelectedInterval}
              />

              {/* 차트 */}
              <div className="min-h-0 flex-1 p-4">
                <MarketCandleChart
                  symbol={selectedMarket}
                  interval={intervalToChartFormat(
                    selectedInterval,
                  )}
                  minutes={180}
                  height="parent"
                  theme="dark"
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-[2px] bg-stone-800 transition-colors hover:bg-stone-600" />

          {/* 주문 영역 - 독립적으로 로딩 상태 관리 */}
          <Panel defaultSize={30} minSize={20}>
            <div className="flex h-full min-h-0 flex-col">
              <TradingOrder />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
