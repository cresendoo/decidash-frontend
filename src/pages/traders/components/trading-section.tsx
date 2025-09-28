import MarketCandleChart from './market-candle-chart';
import TradingHeader from './trading-header';
import TradingOrder from './trading-order';

export default function TradingSection() {
  return (
    <div className="h-full flex flex-col min-h-0">
      {/* 상단 헤더 */}
      <TradingHeader />

      {/* 차트와 주문 영역 */}
      <div className="flex flex-1 min-h-0">
        {/* 차트 영역 */}
        <div className="flex-1 min-h-0 p-4">
          <div className="h-full min-h-0">
            <MarketCandleChart symbol="APT/USD" interval="1m" minutes={180} height="parent" theme="dark" />
          </div>
        </div>

        {/* 주문 영역 */}
        <div className="w-80 min-h-0 flex flex-col">
          <TradingOrder />
        </div>
      </div>
    </div>
  );
}
