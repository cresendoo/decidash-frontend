/**
 * TradingSection 스켈레톤 컴포넌트
 * 첫 로딩 시 표시되는 스켈레톤 UI
 */
export default function TradingSectionSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-[2px]">
      {/* 헤더 스켈레톤 */}
      <div className="flex h-16 w-full animate-pulse items-center justify-between gap-2 rounded-[2px] bg-stone-950 px-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-stone-800" />
          <div className="h-6 w-24 rounded bg-stone-800" />
          <div className="h-5 w-5 rounded bg-stone-800" />
        </div>
        <div className="h-6 w-32 rounded bg-stone-800" />
      </div>

      {/* 차트 영역 스켈레톤 */}
      <div className="flex min-h-0 flex-1 animate-pulse rounded-[2px] bg-stone-950">
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
          {/* 컨트롤 바 */}
          <div className="flex h-8 items-center gap-2">
            <div className="h-6 w-12 rounded bg-stone-800" />
            <div className="h-6 w-12 rounded bg-stone-800" />
            <div className="h-6 w-12 rounded bg-stone-800" />
            <div className="h-6 w-12 rounded bg-stone-800" />
            <div className="mx-2 h-6 w-px bg-stone-800" />
            <div className="h-6 w-24 rounded bg-stone-800" />
          </div>
          {/* 차트 영역 */}
          <div className="flex-1 rounded bg-stone-900" />
        </div>

        {/* 주문 영역 스켈레톤 */}
        <div className="flex min-h-0 w-80 flex-col gap-2 border-l border-stone-800 p-4">
          <div className="h-8 w-full rounded bg-stone-800" />
          <div className="h-12 w-full rounded bg-stone-800" />
          <div className="h-12 w-full rounded bg-stone-800" />
          <div className="flex-1 rounded bg-stone-800" />
        </div>
      </div>
    </div>
  )
}

