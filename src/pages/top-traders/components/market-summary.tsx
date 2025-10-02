import { useTradersDashboard } from '../api'
import MarketSummarySkeleton from './market-summary-skeleton'

// ============================================
// 상태별 컴포넌트들
// ============================================

/**
 * 에러 상태 컴포넌트
 */
function MarketSummaryError({
  errorMessage,
}: {
  errorMessage?: string
}) {
  return (
    <section className="flex gap-5">
      {[
        'Market Sentiment',
        'Top Performer',
        'Asset Concentration',
        'Trader Profitability',
      ].map((title, index) => (
        <div
          key={index}
          className="flex min-h-[140px] min-w-0 flex-1 rounded-3xl border border-stone-800 p-6"
        >
          <div className="flex flex-col items-start justify-between">
            <p className="text-xs leading-4 text-white/60">
              {title.toUpperCase()}
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-white/40">
                데이터를 불러올 수 없습니다
              </p>
              {index === 0 && errorMessage && (
                <p className="text-xs text-white/30">
                  {errorMessage}
                </p>
              )}
            </div>
            <div />
          </div>
        </div>
      ))}
    </section>
  )
}

/**
 * 빈 데이터 상태 컴포넌트
 */
function MarketSummaryEmpty() {
  return (
    <section className="flex gap-5">
      {[
        'Market Sentiment',
        'Top Performer',
        'Asset Concentration',
        'Trader Profitability',
      ].map((title, index) => (
        <div
          key={index}
          className="flex min-h-[140px] min-w-0 flex-1 rounded-3xl border border-stone-800 p-6"
        >
          <div className="flex flex-col items-start justify-between">
            <p className="text-xs leading-4 text-white/60">
              {title.toUpperCase()}
            </p>
            <p className="text-sm text-white/40">
              데이터 없음
            </p>
            <div />
          </div>
        </div>
      ))}
    </section>
  )
}

/**
 * MarketSummary 컴포넌트
 *
 * 트레이더 대시보드의 주요 메트릭을 표시합니다:
 * - Market Sentiment: 시장 심리 (Long/Short 비율)
 * - Top Performer Main Position: 최고 수익률 트레이더의 주요 포지션
 * - Asset Concentration: 자산 집중도 (최고 OI, 가장 많이 거래된 자산)
 * - Trader Profitability: 트레이더 수익성
 */
export default function MarketSummary() {
  const { data, isLoading, isError, error, isFetching } =
    useTradersDashboard()

  // 첫 로딩 (스켈레톤) - 데이터가 없을 때만
  if (isLoading && !data) {
    return <MarketSummarySkeleton />
  }

  // 백그라운드 로딩 여부 (첫 로딩 이후 refetch)
  const isRefetching = isFetching && !isLoading

  // 에러 상태
  if (isError) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : '알 수 없는 오류'
    return (
      <MarketSummaryError errorMessage={errorMessage} />
    )
  }

  // 빈 데이터 처리
  if (!data) {
    return <MarketSummaryEmpty />
  }

  // 정상 상태 - 실제 데이터 표시
  const {
    market_sentiment,
    top_performer_main_position,
    asset_concentration,
    trader_profitability,
  } = data

  // 숫자 포맷팅 헬퍼
  const formatCurrency = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`
  }

  return (
    <section className="relative flex gap-5">
      {/* 백그라운드 로딩 인디케이터 */}
      {isRefetching && (
        <div className="absolute right-0 top-0 flex items-center gap-2 rounded-full border border-stone-700 bg-stone-900/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          <span className="text-xs text-white/80">
            업데이트 중...
          </span>
        </div>
      )}

      {/* Market Sentiment */}
      <div className="flex min-h-[140px] min-w-0 flex-1 rounded-3xl border border-stone-800 p-6">
        <div className="flex flex-col items-start justify-between">
          <p className="text-xs leading-4 text-white/60">
            MARKET SENTIMENT
          </p>
          <p className="text-2xl font-medium leading-8 text-[#00c951]">
            {formatPercentage(
              market_sentiment.long_percentage,
            )}{' '}
            LONG
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-sm leading-5 text-white">
              {formatPercentage(
                market_sentiment.short_percentage,
              )}{' '}
              SHORT
            </p>
            <p className="text-xs leading-4 text-white/40">
              Based on total position value
            </p>
          </div>
        </div>
      </div>

      {/* Top Performer Main Position */}
      <div className="flex min-h-[140px] min-w-0 flex-1 rounded-3xl border border-stone-800 p-6">
        <div className="flex flex-col items-start justify-between">
          <p className="text-xs leading-4 text-white/60">
            TOP PERFORMER MAIN POSITION
          </p>
          <p className="text-2xl font-medium leading-8 text-white">
            {top_performer_main_position.asset || 'N/A'}
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-sm leading-5 text-white">
              · {top_performer_main_position.roi} ROI
            </p>
            <p className="text-xs leading-4 text-white/40">
              Highest 24h return on investment
            </p>
          </div>
        </div>
      </div>

      {/* Asset Concentration */}
      <div className="flex min-h-[140px] min-w-0 flex-1 rounded-3xl border border-stone-800 p-6">
        <div className="flex w-full flex-col items-start gap-6">
          <p className="text-xs leading-4 text-white/60">
            ASSET CONCENTRATION
          </p>
          <div className="flex w-full items-start gap-4">
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-xs leading-4 text-white/40">
                HIGHEST OI
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium leading-7 text-white">
                  {asset_concentration.highest_oi.asset ||
                    'N/A'}
                </span>
              </div>
              <p className="text-sm leading-5 text-white/60">
                {formatCurrency(
                  asset_concentration.highest_oi.amount,
                )}
              </p>
            </div>
            <div className="h-full w-px bg-white/5" />
            <div className="flex flex-1 flex-col gap-1">
              <p className="text-xs leading-4 text-white/40">
                MOST TRADED
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium leading-7 text-white">
                  {asset_concentration.most_traded.asset ||
                    'N/A'}
                </span>
              </div>
              <p className="text-sm leading-5 text-white/60">
                {asset_concentration.most_traded.traders}{' '}
                traders
              </p>
            </div>
          </div>
          <p className="text-xs leading-4 text-white/40">
            Total monitored:{' '}
            {formatCurrency(
              asset_concentration.total_monitored,
            )}
          </p>
        </div>
      </div>

      {/* Trader Profitability */}
      <div className="flex min-h-[140px] min-w-0 flex-1 rounded-3xl border border-stone-800 p-6">
        <div className="flex flex-col items-start justify-between">
          <p className="text-xs leading-4 text-white/60">
            TRADER PROFITABILITY
          </p>
          <p className="text-2xl font-medium leading-8 text-white">
            {formatPercentage(
              trader_profitability.profitable_percentage,
            )}
          </p>
          <div className="flex flex-col gap-1">
            <p className="text-sm leading-5 text-white">
              {trader_profitability.profitable_count} of{' '}
              {trader_profitability.total_traders}{' '}
              profitable
            </p>
            <p className="text-xs leading-4 text-white/40">
              Avg Daily PnL:{' '}
              {formatCurrency(
                trader_profitability.avg_daily_pnl,
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
