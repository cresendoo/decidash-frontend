import { ChevronDown } from 'lucide-react';
import { useEffect,useState } from 'react';


import { useMarketPrice } from '../hooks';
import { useQuery } from '@tanstack/react-query';
import { DeciDashConfig, getMarket } from '@coldbell/decidash-ts-sdk';
import { useTradingStore } from '../store/trading-store';

export default function TradingHeader() {
  const selectedMarket = useTradingStore(s => s.selectedMarket);
  const setSelectedMarket = useTradingStore(s => s.setSelectedMarket);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);

  // 사용 가능한 마켓 목록: react-query 사용
  const { data: markets } = useQuery({
    queryKey: ['markets', DeciDashConfig.DEVNET.tradingVM.APIURL],
    queryFn: async () => {
      const list = await getMarket({ decidashConfig: DeciDashConfig.DEVNET });
      return list.map(m => m.market_name);
    },
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (markets && markets.length > 0) {
      setAvailableMarkets(markets);
    }
  }, [markets]);

  // React Query로 가격 가져오기
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
