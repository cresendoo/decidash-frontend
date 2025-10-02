import { useState } from 'react'
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from 'react-resizable-panels'

import { Drawer, Tabs } from '@/shared/components'

import { type MarketCandlesticksInterval } from './api'
import {
  ChartControls,
  MarketCandleChart,
  MarketListPanel,
  PositionsSection,
  TradeHistorySection,
  TradeSection,
  TradingHeader,
  TradingOrderContent,
  TradingSection,
} from './components'
import { useTradingStore } from './store/trading-store'

// 아이콘 컴포넌트들
function ChartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  )
}

function TradeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-4 w-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      />
    </svg>
  )
}

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

// 모바일 레이아웃 컴포넌트
function MobileLayout() {
  const selectedMarket = useTradingStore(
    (s) => s.selectedMarket,
  )
  const mobileMainTab = useTradingStore(
    (s) => s.mobileMainTab,
  )
  const setMobileMainTab = useTradingStore(
    (s) => s.setMobileMainTab,
  )
  const mobileBottomNav = useTradingStore(
    (s) => s.mobileBottomNav,
  )
  const setMobileBottomNav = useTradingStore(
    (s) => s.setMobileBottomNav,
  )

  const [activePositionsTab, setActivePositionsTab] =
    useState<'positions' | 'history'>('positions')
  const [interval, setInterval] =
    useState<TimeInterval>('1m')
  const [isMarketListOpen, setIsMarketListOpen] =
    useState(false)

  // 상단 메인 탭 설정
  const mainTabs = [
    { id: 'chart' as const, label: 'Chart' },
    { id: 'orderbook' as const, label: 'Orderbook' },
    { id: 'trade' as const, label: 'Trade' },
  ]

  // Positions/History 탭 설정
  const positionsTabs = [
    { id: 'positions' as const, label: 'Positions' },
    { id: 'history' as const, label: 'Trade History' },
  ]

  // 하단 네비게이션 탭 설정
  const bottomNavTabs = [
    {
      id: 'markets' as const,
      label: 'Markets',
      icon: <ChartIcon />,
    },
    {
      id: 'trade' as const,
      label: 'Trade',
      icon: <TradeIcon />,
    },
  ]

  return (
    <div className="relative flex h-full flex-col bg-stone-950">
      {/* 헤더 - 항상 최상단 고정 */}
      <div className="fixed left-0 right-0 top-0 z-50">
        <TradingHeader
          onOpenMarketList={() =>
            setIsMarketListOpen(!isMarketListOpen)
          }
        />
      </div>

      {/* 마켓 리스트 패널 - 하단 Drawer */}
      <Drawer
        isOpen={isMarketListOpen}
        onClose={() => setIsMarketListOpen(false)}
        position="bottom"
      >
        <MarketListPanel
          isOpen={isMarketListOpen}
          onClose={() => setIsMarketListOpen(false)}
          variant="bottom"
        />
      </Drawer>

      {/* 컨텐츠 영역 (헤더 아래) */}
      <div className="flex flex-1 flex-row pt-16">
        {/* 메인 컨텐츠 영역 */}
        <div className="flex min-h-0 w-full flex-1 flex-col pb-12">
          {/* 스크롤 가능한 컨텐츠 */}
          <div className="flex min-h-0 w-full flex-1 flex-col gap-[2px]">
            {/* Markets 탭이 선택된 경우 */}
            {mobileBottomNav === 'markets' && (
              <>
                {/* 상단 메인 탭 */}
                <Tabs
                  tabs={mainTabs}
                  activeTab={mobileMainTab}
                  onChange={(tab) =>
                    setMobileMainTab(
                      tab as
                        | 'chart'
                        | 'orderbook'
                        | 'trade',
                    )
                  }
                />

                {/* 탭 컨텐츠 영역 */}
                <div className="flex min-h-[400px] w-full flex-1 flex-col gap-[2px] overflow-hidden bg-stone-950">
                  {/* Chart 탭 */}
                  {mobileMainTab === 'chart' && (
                    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
                      {/* 차트 컨트롤 */}
                      <ChartControls
                        selectedInterval={interval}
                        onIntervalChange={setInterval}
                      />
                      {/* 차트 */}
                      <div className="min-h-0 w-full flex-1 overflow-hidden">
                        <MarketCandleChart
                          symbol={selectedMarket}
                          interval={intervalToChartFormat(
                            interval,
                          )}
                          height="parent"
                          theme="dark"
                        />
                      </div>
                    </div>
                  )}

                  {/* Orderbook 탭 */}
                  {mobileMainTab === 'orderbook' && (
                    <TradingOrderContent activeTab="orderbook" />
                  )}

                  {/* Trade 탭 */}
                  {mobileMainTab === 'trade' && (
                    <TradingOrderContent activeTab="trades" />
                  )}
                </div>

                {/* Positions/History 섹션 */}
                <div className="flex min-h-[300px] w-full flex-col gap-[2px]">
                  <Tabs
                    tabs={positionsTabs}
                    activeTab={activePositionsTab}
                    onChange={(tab) =>
                      setActivePositionsTab(
                        tab as 'positions' | 'history',
                      )
                    }
                  />
                  <div className="min-h-0 w-full flex-1 overflow-auto bg-stone-950">
                    {activePositionsTab === 'positions' ? (
                      <PositionsSection />
                    ) : (
                      <TradeHistorySection />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Trade 탭이 선택된 경우 */}
            {mobileBottomNav === 'trade' && (
              <div className="flex h-full flex-col bg-stone-950">
                <TradeSection />
              </div>
            )}
          </div>
        </div>

        {/* 하단 네비게이션 - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Tabs
            tabs={bottomNavTabs}
            activeTab={mobileBottomNav}
            onChange={(tab) =>
              setMobileBottomNav(tab as 'markets' | 'trade')
            }
            variant="bottom-nav"
          />
        </div>
      </div>
    </div>
  )
}

// 데스크톱 레이아웃 컴포넌트
function DesktopLayout() {
  const [activeTab, setActiveTab] = useState<
    'positions' | 'history'
  >('positions')
  const [isMarketListOpen, setIsMarketListOpen] =
    useState(false)

  return (
    <div className="flex h-full flex-col bg-stone-950">
      {/* 마켓 리스트 패널 - 좌측 고정 (헤더 아래) */}
      <div
        className={`fixed bottom-0 left-0 top-14 z-40 transition-transform duration-300 ${
          isMarketListOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        <MarketListPanel
          isOpen={isMarketListOpen}
          onClose={() => setIsMarketListOpen(false)}
          variant="side"
        />
      </div>

      {/* 메인 컨텐츠 */}
      <div
        className={`flex h-full flex-col transition-all duration-300 ${
          isMarketListOpen ? 'ml-[280px]' : 'ml-0'
        }`}
      >
        <PanelGroup
          direction="horizontal"
          className="h-full"
        >
          {/* 왼쪽 메인 영역 - 세로로 리사이징 가능 */}
          <Panel defaultSize={70} minSize={50}>
            <PanelGroup
              direction="vertical"
              className="h-full min-h-0"
            >
              {/* 상단: Trading section */}
              <Panel defaultSize={80} minSize={20}>
                <TradingSection
                  onOpenMarketList={() =>
                    setIsMarketListOpen(!isMarketListOpen)
                  }
                />
              </Panel>
              <PanelResizeHandle className="h-[2px] bg-stone-800 transition-colors hover:bg-stone-600" />
              {/* 하단 통합 섹션: Tabs (Positions / Trade History) */}
              <Panel defaultSize={20} minSize={20}>
                <div className="flex h-full min-h-0 flex-col">
                  <div className="border-b border-gray-700 px-4 pt-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() =>
                          setActiveTab('positions')
                        }
                        className={
                          activeTab === 'positions'
                            ? 'border-b-2 border-yellow-300 pb-2 font-semibold text-yellow-300'
                            : 'pb-2 text-gray-400 hover:text-gray-200'
                        }
                      >
                        Positions
                      </button>
                      <button
                        onClick={() =>
                          setActiveTab('history')
                        }
                        className={
                          activeTab === 'history'
                            ? 'border-b-2 border-yellow-300 pb-2 font-semibold text-yellow-300'
                            : 'pb-2 text-gray-400 hover:text-gray-200'
                        }
                      >
                        Trade History
                      </button>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-auto">
                    {activeTab === 'positions' ? (
                      <PositionsSection />
                    ) : (
                      <TradeHistorySection />
                    )}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-[2px] bg-stone-800 transition-colors hover:bg-stone-600" />

          {/* 오른쪽 사이드바: Trade section */}
          <Panel defaultSize={30} minSize={20}>
            <TradeSection />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export default function Traders() {
  return (
    <div className="h-screen bg-stone-950">
      {/* 데스크톱 (lg 이상) */}
      <div className="hidden h-full lg:block">
        <DesktopLayout />
      </div>

      {/* 모바일 (lg 미만) */}
      <div className="block h-full lg:hidden">
        <MobileLayout />
      </div>
    </div>
  )
}
