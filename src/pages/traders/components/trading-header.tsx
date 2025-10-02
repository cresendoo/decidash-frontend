import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { useTradingStore } from '../store/trading-store';
// 새로운 API 사용
import { useMarketNames, useMarketPrice } from '../api';

export default function TradingHeader() {
  const selectedMarket = useTradingStore(s => s.selectedMarket);
  const setSelectedMarket = useTradingStore(s => s.setSelectedMarket);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // 새로운 API: 마켓 이름 목록 가져오기
  const { data: availableMarkets = [] } = useMarketNames();

  // 새로운 API: 가격 가져오기
  const { data: priceData } = useMarketPrice(selectedMarket);
  const price = priceData ? priceData.toLocaleString() : 'Loading...';

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      {/* 좌측: 마켓 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-white font-bold hover:text-yellow-400"
          >
            <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
            {selectedMarket}
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded shadow-lg z-10">
              {availableMarkets.map((marketName) => (
                <button
                  key={marketName}
                  onClick={() => {
                    setSelectedMarket(marketName);
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700"
                >
                  {marketName}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="text-white text-2xl font-bold">{price}</div>
    </div>
  );
}
