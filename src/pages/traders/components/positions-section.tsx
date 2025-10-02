import type { UserPosition } from '@coldbell/decidash-ts-sdk'

import { useWallet } from '@/shared/hooks'

import { useUserPositions } from '../api'

/**
 * 스켈레톤 컴포넌트
 */
function PositionsSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-[2px] bg-stone-950 px-0 py-2">
      {/* 헤더 스켈레톤 */}
      <div className="flex h-4 items-center gap-2 px-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-3 flex-1 animate-pulse rounded bg-stone-800"
          />
        ))}
      </div>
      {/* 데이터 스켈레톤 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex h-4 items-center gap-2 px-2"
        >
          {Array.from({ length: 9 }).map((_, j) => (
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
function PositionsError({
  errorMessage,
}: {
  errorMessage?: string
}) {
  return (
    <div className="flex h-full items-center justify-center rounded-[2px] bg-stone-950 py-8">
      <p className="text-sm text-red-400">
        {errorMessage || 'Unable to load positions'}
      </p>
    </div>
  )
}

/**
 * 빈 데이터 컴포넌트
 */
function PositionsEmpty() {
  return (
    <div className="rounded-[2px] bg-stone-950 px-0 py-2">
      <div className="flex h-4 items-center gap-2 px-2">
        <p className="flex-1 text-xs text-white">
          No open positions yet
        </p>
      </div>
    </div>
  )
}

/**
 * 포지션 행 컴포넌트
 */
function PositionRow({
  position,
}: {
  position: UserPosition
}) {
  // 마켓 이름에서 코인 추출 (예: APT/USD -> APT)
  const coin =
    position.market.split('/')[0] || position.market

  // PNL과 ROE 계산 (간단한 예시)
  const pnl = 0 // TODO: 실제 계산 로직 필요
  const roe = 0 // TODO: 실제 계산 로직 필요
  const isProfitable = pnl >= 0

  // Size 방향 (Long/Short)
  const isLong = position.size > 0
  const sizeDisplay = `${isLong ? '' : '-'}${Math.abs(position.size).toFixed(4)}`

  return (
    <div className="flex h-4 items-center gap-2 px-2 text-xs text-white">
      {/* Coin */}
      <div className="flex flex-1 items-center gap-1">
        <span>{coin}</span>
      </div>

      {/* Size */}
      <div className="flex flex-1 items-center">
        <span
          className={
            isLong ? 'text-[#00c951]' : 'text-[#fb2c36]'
          }
        >
          {sizeDisplay}
        </span>
      </div>

      {/* Position Value */}
      <div className="flex flex-1 items-center justify-end">
        <span>
          $
          {(
            Math.abs(position.size) * position.entry_price
          ).toFixed(2)}
        </span>
      </div>

      {/* Entry Price */}
      <div className="flex flex-1 items-center justify-end">
        <span>${position.entry_price.toFixed(2)}</span>
      </div>

      {/* Mark Price */}
      <div className="flex flex-1 items-center justify-end">
        <span>-</span>
      </div>

      {/* PNL (ROE %) */}
      <div className="flex flex-1 items-center justify-end">
        <span
          className={
            isProfitable
              ? 'text-[#00c951]'
              : 'text-[#fb2c36]'
          }
        >
          ${pnl.toFixed(2)} ({roe.toFixed(2)}%)
        </span>
      </div>

      {/* Liq. Price */}
      <div className="flex flex-1 items-center justify-end">
        <span>
          ${position.estimated_liquidation_price.toFixed(2)}
        </span>
      </div>

      {/* Margin */}
      <div className="flex flex-1 items-center justify-end">
        <span>
          {position.is_isolated ? 'Isolated' : 'Cross'}
        </span>
      </div>

      {/* Funding */}
      <div className="flex flex-1 items-center justify-end">
        <span
          className={
            position.unrealized_funding >= 0
              ? 'text-[#00c951]'
              : 'text-[#fb2c36]'
          }
        >
          ${position.unrealized_funding.toFixed(4)}
        </span>
      </div>
    </div>
  )
}

export default function PositionsSection() {
  // Aptos 지갑에서 사용자 주소 가져오기
  const { account } = useWallet()

  const {
    data: positions,
    isLoading,
    isError,
    error,
  } = useUserPositions(account)

  // 첫 로딩
  if (isLoading) {
    return <PositionsSkeleton />
  }

  // 에러 상태
  if (isError) {
    const errorMessage =
      error instanceof Error ? error.message : undefined
    return <PositionsError errorMessage={errorMessage} />
  }

  // 빈 데이터 또는 포지션 없음
  if (!positions || positions.length === 0) {
    return (
      <div className="flex flex-col gap-2.5 rounded-[2px] bg-stone-950 px-0 py-2">
        {/* 테이블 헤더 */}
        <div className="flex h-4 items-center gap-2 px-2 text-xs text-white/60">
          <div className="flex flex-1 items-center gap-1">
            <span>Coin</span>
          </div>
          <div className="flex flex-1 items-center gap-1">
            <span>Size</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span>Position Value</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span>Entry Price</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span>Mark Price</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span className="underline decoration-dotted">
              PNL (ROE %)
            </span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span>Liq. Price</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span className="underline decoration-dotted">
              Margin
            </span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-1">
            <span className="underline decoration-dotted">
              Funding
            </span>
          </div>
        </div>
        <PositionsEmpty />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[2px] bg-stone-950 px-0 py-2">
      {/* 테이블 헤더 */}
      <div className="flex h-4 items-center gap-2 px-2 text-xs text-white/60">
        <div className="flex flex-1 items-center gap-1">
          <span>Coin</span>
        </div>
        <div className="flex flex-1 items-center gap-1">
          <span>Size</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span>Position Value</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span>Entry Price</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span>Mark Price</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span className="underline decoration-dotted">
            PNL (ROE %)
          </span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span>Liq. Price</span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span className="underline decoration-dotted">
            Margin
          </span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">
          <span className="underline decoration-dotted">
            Funding
          </span>
        </div>
      </div>

      {/* 포지션 데이터 */}
      {positions.map((position, index) => (
        <PositionRow
          key={`${position.market}-${index}`}
          position={position}
        />
      ))}
    </div>
  )
}
