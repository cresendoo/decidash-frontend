import type { MarketTradeHistory } from '@coldbell/decidash-ts-sdk'

import { useWallet } from '@/shared/hooks'

import { useUserTradeHistory } from '../api'

/**
 * 스켈레톤 컴포넌트
 */
function TradeHistorySkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-[2px] bg-stone-950 px-0 py-2">
      {/* 헤더 스켈레톤 */}
      <div className="flex h-4 items-center gap-2 px-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-3 flex-1 animate-pulse rounded bg-stone-800"
          />
        ))}
      </div>
      {/* 데이터 스켈레톤 */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="flex h-4 items-center gap-2 px-2"
        >
          {Array.from({ length: 8 }).map((_, j) => (
            <div
              key={j}
              className="h-3 flex-1 animate-pulse rounded bg-stone-800/50"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * 에러 상태 컴포넌트
 */
function TradeHistoryError({
  errorMessage,
}: {
  errorMessage?: string
}) {
  return (
    <div className="flex h-full items-center justify-center rounded-[2px] bg-stone-950 py-8">
      <p className="text-sm text-red-400">
        {errorMessage || 'Unable to load trade history'}
      </p>
    </div>
  )
}

/**
 * 빈 데이터 컴포넌트
 */
function TradeHistoryEmpty() {
  return (
    <div className="rounded-[2px] bg-stone-950 px-0 py-2">
      <div className="flex h-4 items-center gap-2 px-2">
        <p className="flex-1 text-xs text-white">
          No trades yet
        </p>
      </div>
    </div>
  )
}

/**
 * 거래 행 컴포넌트
 */
function TradeRow({
  trade,
}: {
  trade: MarketTradeHistory
}) {
  // 마켓 이름에서 코인 추출 (예: APT/USD -> APT)
  const coin = trade.market.split('/')[0] || trade.market

  // 시간 포맷팅
  const formattedTime = new Date(
    trade.transaction_unix_ms,
  ).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  // Direction 파싱 (OpenLong, OpenShort, CloseLong, CloseShort 등)
  const isLong = trade.action.toLowerCase().includes('long')
  const isOpen = trade.action.toLowerCase().includes('open')
  const directionColor = isLong
    ? 'text-[#00c951]'
    : 'text-[#fb2c36]'
  const directionText = isOpen
    ? isLong
      ? 'Open Long'
      : 'Open Short'
    : isLong
      ? 'Close Long'
      : 'Close Short'

  // Trade Value 계산
  const tradeValue = trade.size * trade.price

  // PNL 색상
  const pnlColor = trade.is_profit
    ? 'text-[#00c951]'
    : 'text-[#fb2c36]'

  return (
    <div className="flex h-4 items-center gap-2 px-2 text-xs text-white">
      {/* Time */}
      <div className="flex flex-1 items-center gap-1">
        <span className="text-white/60">
          {formattedTime}
        </span>
      </div>

      {/* Coin */}
      <div className="flex flex-1 items-center">
        <span>{coin}</span>
      </div>

      {/* Direction */}
      <div className="flex flex-1 items-center">
        <span className={directionColor}>
          {directionText}
        </span>
      </div>

      {/* Price */}
      <div className="flex flex-1 items-center justify-end">
        <span>${trade.price.toFixed(2)}</span>
      </div>

      {/* Size */}
      <div className="flex flex-1 items-center justify-end">
        <span>{trade.size.toFixed(4)}</span>
      </div>

      {/* Trade Value */}
      <div className="flex flex-1 items-center justify-end">
        <span>${tradeValue.toFixed(2)}</span>
      </div>

      {/* Fee */}
      <div className="flex flex-1 items-center justify-end">
        <span>${trade.fee_amount.toFixed(4)}</span>
      </div>

      {/* Closed PNL */}
      <div className="flex flex-1 items-center justify-end">
        <span className={pnlColor}>
          ${trade.realized_pnl_amount.toFixed(2)}
          {trade.realized_funding_amount !== 0 &&
            ` (${trade.is_funding_positive ? '+' : ''}${trade.realized_funding_amount.toFixed(4)})`}
        </span>
      </div>
    </div>
  )
}

export default function TradeHistorySection() {
  // Aptos 지갑에서 사용자 주소 가져오기
  const { account } = useWallet()

  const {
    data: trades,
    isLoading,
    isError,
    error,
  } = useUserTradeHistory(account, 50)

  // 첫 로딩
  if (isLoading) {
    return <TradeHistorySkeleton />
  }

  // 에러 상태
  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : undefined
    return <TradeHistoryError errorMessage={errorMessage} />
  }

  // 빈 데이터 또는 거래 없음
  if (!trades || trades.length === 0) {
    return (
      <div className="flex flex-col gap-2.5 rounded-[2px] bg-stone-950 px-0 py-2">
        {/* 테이블 헤더 */}
        <div className="flex h-4 items-center gap-2 px-2 text-xs text-white/60">
          <div className="flex flex-1 items-center gap-1">
            <span>Time</span>
          </div>
          <div className="flex flex-1 items-center gap-1">
            <span>Coin</span>
          </div>
          <div className="flex flex-1 items-center gap-1">
            <span>Direction</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span>Price</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span>Size</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span>Trade Value</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span>Fee</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span className="underline decoration-dotted">
              Closed PNL
            </span>
          </div>
        </div>
        <TradeHistoryEmpty />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[2px] bg-stone-950 px-0 py-2">
      {/* 테이블 헤더 */}
      <div className="flex h-4 items-center gap-2 px-2 text-xs text-white/60">
        <div className="flex flex-1 items-center gap-1">
          <span>Time</span>
        </div>
        <div className="flex flex-1 items-center gap-1">
          <span>Coin</span>
        </div>
        <div className="flex flex-1 items-center gap-1">
          <span>Direction</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span>Price</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span>Size</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span>Trade Value</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span>Fee</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span className="underline decoration-dotted">
            Closed PNL
          </span>
        </div>
      </div>

      {/* 거래 데이터 */}
      {trades.map((trade, index) => (
        <TradeRow
          key={`${trade.transaction_version}-${index}`}
          trade={trade}
        />
      ))}
    </div>
  )
}
