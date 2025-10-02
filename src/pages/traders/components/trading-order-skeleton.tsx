/**
 * TradingOrder 스켈레톤 컴포넌트
 * 실제 TradingOrder 컴포넌트의 레이아웃을 정확히 따릅니다
 */
export default function TradingOrderSkeleton() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2px] bg-stone-950">
      {/* 탭 영역 - 실제와 동일 */}
      <div className="flex h-10 items-center gap-0 border-b border-white/5 bg-stone-950">
        <div className="flex h-full items-center justify-center px-4 pb-1">
          <div className="h-4 w-16 animate-pulse rounded bg-stone-800" />
        </div>
        <div className="flex h-full items-center justify-center px-4 pb-1">
          <div className="h-4 w-16 animate-pulse rounded bg-stone-800" />
        </div>
      </div>

      {/* 오더북 컨텐츠 - 실제와 동일한 구조 */}
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 bg-stone-950">
        {/* 드롭다운 영역 */}
        <div className="flex h-6 items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-1">
            <div className="h-3 w-8 animate-pulse rounded bg-stone-800" />
            <div className="h-3 w-3 animate-pulse rounded bg-stone-800" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-12 animate-pulse rounded bg-stone-800" />
            <div className="h-3 w-3 animate-pulse rounded bg-stone-800" />
          </div>
        </div>

        {/* 테이블 헤더 */}
        <div className="flex h-4 gap-2 px-2 text-xs">
          <div className="h-3 flex-1 animate-pulse rounded bg-stone-800" />
          <div className="h-3 flex-1 animate-pulse rounded bg-stone-800" />
          <div className="h-3 flex-1 animate-pulse rounded bg-stone-800" />
        </div>

        {/* 오더북 데이터 영역 */}
        <div className="flex min-h-0 flex-1 flex-col gap-0">
          {/* Asks (매도 주문) - 아래쪽 정렬 */}
          <div className="flex min-h-0 flex-1 flex-col justify-end gap-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`ask-${i}`}
                className="flex h-[22px] gap-2 px-2"
              >
                <div className="h-4 flex-1 animate-pulse rounded bg-stone-800/50" />
                <div className="h-4 flex-1 animate-pulse rounded bg-stone-800/50" />
                <div className="h-4 flex-1 animate-pulse rounded bg-stone-800/50" />
              </div>
            ))}
          </div>

          {/* Spread - 중앙 */}
          <div className="flex h-[22px] items-center justify-center gap-3 bg-white/5 px-2">
            <div className="h-3 w-12 animate-pulse rounded bg-stone-800" />
            <div className="h-3 w-16 animate-pulse rounded bg-stone-800" />
            <div className="h-3 w-16 animate-pulse rounded bg-stone-800" />
          </div>

          {/* Bids (매수 주문) - 위쪽 정렬 */}
          <div className="flex min-h-0 flex-1 flex-col justify-start gap-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`bid-${i}`}
                className="flex h-[22px] gap-2 px-2"
              >
                <div className="h-4 flex-1 animate-pulse rounded bg-stone-800/50" />
                <div className="h-4 flex-1 animate-pulse rounded bg-stone-800/50" />
                <div className="h-4 flex-1 animate-pulse rounded bg-stone-800/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
