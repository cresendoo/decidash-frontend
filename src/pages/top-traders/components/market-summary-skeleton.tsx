/**
 * MarketSummary 컴포넌트의 로딩 스켈레톤
 *
 * 첫 로딩 시 표시되는 스켈레톤 UI입니다.
 */
export default function MarketSummarySkeleton() {
  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {/* Market Sentiment Skeleton */}
      <div className="flex min-h-[140px] rounded-3xl border border-stone-800 p-6">
        <div className="flex flex-col items-start justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-28 animate-pulse rounded bg-white/10" />
          <div className="flex flex-col gap-1">
            <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>

      {/* Top Performer Main Position Skeleton */}
      <div className="flex min-h-[140px] rounded-3xl border border-stone-800 p-6">
        <div className="flex flex-col items-start justify-between">
          <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-20 animate-pulse rounded bg-white/10" />
          <div className="flex flex-col gap-1">
            <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>

      {/* Asset Concentration Skeleton */}
      <div className="flex min-h-[140px] rounded-3xl border border-stone-800 p-6">
        <div className="flex w-full flex-col items-start gap-6">
          <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
          <div className="flex w-full items-start gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-4 w-20 animate-pulse rounded bg-white/10" />
              <div className="h-7 w-16 animate-pulse rounded bg-white/10" />
              <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
            </div>
            <div className="h-full w-px bg-white/5" />
            <div className="flex flex-1 flex-col gap-1">
              <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
              <div className="h-7 w-16 animate-pulse rounded bg-white/10" />
              <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
            </div>
          </div>
          <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
        </div>
      </div>

      {/* Trader Profitability Skeleton */}
      <div className="flex min-h-[140px] rounded-3xl border border-stone-800 p-6">
        <div className="flex flex-col items-start justify-between">
          <div className="h-4 w-36 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-16 animate-pulse rounded bg-white/10" />
          <div className="flex flex-col gap-1">
            <div className="h-5 w-36 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  )
}
