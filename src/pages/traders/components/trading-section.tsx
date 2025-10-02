import MarketCandleChart from './market-candle-chart'
import TradingHeader from './trading-header'
import TradingOrder from './trading-order'

export default function TradingSection() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 상단 헤더 */}
      <TradingHeader />

      {/* 차트와 주문 영역 */}
      <div className="flex min-h-0 flex-1">
        {/* 차트 영역 */}
        <div className="min-h-0 flex-1 p-4">
          <div className="h-full min-h-0">
            <MarketCandleChart
              symbol="APT/USD"
              interval="1m"
              minutes={180}
              height="parent"
              theme="dark"
            />
          </div>
        </div>

        {/* 주문 영역 */}
        <div className="flex min-h-0 w-80 flex-col">
          <TradingOrder />
        </div>
      </div>
    </div>
  )
}
