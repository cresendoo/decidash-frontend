 
import { useEffect, useRef, useState } from 'react';

import { useMarketDepth } from '../hooks';
import { useTradingStore } from '../store/trading-store';

export default function TradingOrder() {
  const market = useTradingStore(s => s.selectedMarket);
  // 컨테이너 높이에 따라 동적으로 표시할 행 수 계산
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rowsPerSide, setRowsPerSide] = useState<number>(12);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      const totalH = rect.height;
      // 절반 영역(asks/bids) 기준으로 행 수 산정
      // 행 높이(텍스트+패딩) 약 24px + 간격(space-y-1) 4px ≈ 28px
      const rowH = 28;
      const halfH = Math.max(0, totalH / 2);
      const next = Math.max(3, Math.floor(halfH / rowH));
      setRowsPerSide(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { bids, asks } = useMarketDepth(market, rowsPerSide);
  const maxAskTotal = asks.length ? asks[asks.length - 1].total : 1;
  const maxBidTotal = bids.length ? bids[bids.length - 1].total : 1;

  return (
    <div className="p-4 flex-1 min-h-0 flex flex-col">
      {/* 헤더 라벨 */}
      <div className="flex justify-between text-gray-400 text-xs">
        <span>Price</span>
        <span>Size</span>
        <span>Total</span>
      </div>
      {/* 리스트 영역 (상/하 1:1, 중앙 정렬) */}
      <div ref={containerRef} className="mt-2 flex-1 min-h-0 flex flex-col">
        {/* Asks (위) - 하단 정렬로 중앙 정렬 효과 */}
        <div className="flex-1 min-h-0 overflow-hidden pr-1 space-y-1 flex flex-col justify-end">
          {asks.map((l, i) => (
            <div key={`ask-${i}`} className="relative grid grid-cols-3 gap-2 text-sm items-center">
              <div className="absolute inset-y-0 left-0 bg-green-900/25" style={{ width: `${Math.min(100, (l.total / maxAskTotal) * 100)}%` }} />
              <span className="relative text-green-400">{l.price.toFixed(3)}</span>
              <span className="relative text-gray-200">{l.size.toLocaleString()}</span>
              <span className="relative text-gray-200">{l.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
        {/* Divider */}
        <div className="my-2 h-px bg-gray-700" />
        {/* Bids (아래) - 상단 정렬 */}
        <div className="flex-1 min-h-0 overflow-hidden pr-1 space-y-1 flex flex-col justify-start">
          {bids.map((l, i) => (
            <div key={`bid-${i}`} className="relative grid grid-cols-3 gap-2 text-sm items-center">
              <div className="absolute inset-y-0 left-0 bg-red-900/25" style={{ width: `${Math.min(100, (l.total / maxBidTotal) * 100)}%` }} />
              <span className="relative text-red-400">{l.price.toFixed(3)}</span>
              <span className="relative text-gray-200">{l.size.toLocaleString()}</span>
              <span className="relative text-gray-200">{l.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
