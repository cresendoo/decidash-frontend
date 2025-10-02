import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { useTradingStore } from '../store/trading-store'
// 새로운 API 사용
import { useMarketNames, useMarketPrice } from '../api'

export default function TradingHeader() {
  const selectedMarket = useTradingStore(
    (s) => s.selectedMarket,
  )
  const setSelectedMarket = useTradingStore(
    (s) => s.setSelectedMarket,
  )
  const [dropdownOpen, setDropdownOpen] =
    useState<boolean>(false)

  // 새로운 API: 마켓 이름 목록 가져오기
  const { data: availableMarkets = [] } = useMarketNames()

  // 새로운 API: 가격 가져오기
  const { data: priceData } = useMarketPrice(selectedMarket)
  const price = priceData
    ? priceData.toLocaleString()
    : 'Loading...'

  return (
    <div className="flex items-center justify-between border-b border-gray-700 p-4">
      {/* 좌측: 마켓 드롭다운 */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 font-bold text-white hover:text-yellow-400"
        >
          <div className="h-6 w-6 rounded-full bg-yellow-500"></div>
          {selectedMarket}
          <ChevronDown
            size={16}
            className="text-gray-400"
          />
        </button>
        {dropdownOpen && (
          <div className="absolute top-full z-10 mt-2 w-48 rounded border border-gray-600 bg-gray-800 shadow-lg">
            {availableMarkets.map((marketName) => (
              <button
                key={marketName}
                onClick={() => {
                  setSelectedMarket(marketName)
                  setDropdownOpen(false)
                }}
                className="block w-full px-4 py-2 text-left text-white hover:bg-gray-700"
              >
                {marketName}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white">
        {price}
      </div>
    </div>
  )
}
