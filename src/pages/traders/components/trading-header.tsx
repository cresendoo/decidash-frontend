import { Dropdown } from '@/shared/components'

import { useMarketNames, useMarketPrice } from '../api'
import { useTradingStore } from '../store/trading-store'

export default function TradingHeader() {
  const selectedMarket = useTradingStore(
    (s) => s.selectedMarket,
  )
  const setSelectedMarket = useTradingStore(
    (s) => s.setSelectedMarket,
  )

  // 마켓 이름 목록 가져오기
  const { data: availableMarkets = [] } = useMarketNames()

  // 가격 가져오기
  const { data: priceData, isFetching: isPriceFetching } =
    useMarketPrice(selectedMarket)

  // 가격 포맷팅
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const displayPrice =
    priceData !== undefined
      ? formatPrice(priceData)
      : 'Loading...'

  // 마켓 아이콘 가져오기 (첫 글자 기반 색상)
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

  // Dropdown options 생성
  const marketOptions = availableMarkets.map((market) => ({
    label: market,
    value: market,
  }))

  return (
    <div className="flex h-16 w-full items-center justify-between gap-2 rounded-[2px] bg-stone-950 px-3 py-0">
      {/* 좌측: 마켓 선택 */}
      <div className="flex flex-1 items-center gap-2">
        {/* 마켓 아이콘 */}
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${getMarketColor(selectedMarket)} text-[10px] font-bold text-white`}
        >
          {selectedMarket.charAt(0)}
        </div>

        {/* 마켓 이름 */}
        <span className="text-[20px] font-normal leading-7 text-white">
          {selectedMarket}
        </span>

        {/* Dropdown 컴포넌트 사용 */}
        <Dropdown
          value={selectedMarket}
          options={marketOptions}
          onChange={(value) =>
            setSelectedMarket(value as string)
          }
          className="h-auto border-0 bg-transparent p-0 hover:bg-transparent"
        />
      </div>

      {/* 우측: 가격 표시 */}
      <div className="flex items-center gap-2">
        {isPriceFetching && priceData !== undefined && (
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
        )}
        <span className="text-[20px] font-normal leading-7 text-white">
          {displayPrice}
        </span>
      </div>
    </div>
  )
}
