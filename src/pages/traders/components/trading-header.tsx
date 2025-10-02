import { useMarketPrice } from '../api'
import { useTradingStore } from '../store/trading-store'

interface TradingHeaderProps {
  onOpenMarketList: () => void
}

export default function TradingHeader({
  onOpenMarketList,
}: TradingHeaderProps) {
  const selectedMarket = useTradingStore(
    (s) => s.selectedMarket,
  )
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

        {/* 마켓 리스트 열기 버튼 */}
        <button
          onClick={onOpenMarketList}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/10"
          aria-label="Open market list"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white/60"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
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
