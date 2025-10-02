import type { UserPosition } from '@coldbell/decidash-ts-sdk'

import {
  Table,
  TableCell,
  TableRow,
  type TableColumn,
} from '@/shared/components'
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

// 테이블 컬럼 정의
const columns: TableColumn[] = [
  { key: 'coin', label: 'Coin', align: 'left' },
  { key: 'size', label: 'Size', align: 'left' },
  {
    key: 'positionValue',
    label: 'Position Value',
    align: 'right',
  },
  {
    key: 'entryPrice',
    label: 'Entry Price',
    align: 'right',
  },
  { key: 'markPrice', label: 'Mark Price', align: 'right' },
  {
    key: 'pnl',
    label: 'PNL (ROE %)',
    align: 'right',
    underline: true,
  },
  { key: 'liqPrice', label: 'Liq. Price', align: 'right' },
  {
    key: 'margin',
    label: 'Margin',
    align: 'right',
    underline: true,
  },
  {
    key: 'funding',
    label: 'Funding',
    align: 'right',
    underline: true,
  },
]

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

  // 렌더 함수
  const renderRow = (
    position: UserPosition,
    index: number,
  ) => {
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
      <TableRow key={`${position.market}-${index}`}>
        <TableCell>
          <span>{coin}</span>
        </TableCell>

        <TableCell>
          <span
            className={
              isLong ? 'text-[#00c951]' : 'text-[#fb2c36]'
            }
          >
            {sizeDisplay}
          </span>
        </TableCell>

        <TableCell align="right">
          <span>
            $
            {(
              Math.abs(position.size) * position.entry_price
            ).toFixed(2)}
          </span>
        </TableCell>

        <TableCell align="right">
          <span>${position.entry_price.toFixed(2)}</span>
        </TableCell>

        <TableCell align="right">
          <span>-</span>
        </TableCell>

        <TableCell align="right">
          <span
            className={
              isProfitable
                ? 'text-[#00c951]'
                : 'text-[#fb2c36]'
            }
          >
            ${pnl.toFixed(2)} ({roe.toFixed(2)}%)
          </span>
        </TableCell>

        <TableCell align="right">
          <span>
            $
            {position.estimated_liquidation_price.toFixed(
              2,
            )}
          </span>
        </TableCell>

        <TableCell align="right">
          <span>
            {position.is_isolated ? 'Isolated' : 'Cross'}
          </span>
        </TableCell>

        <TableCell align="right">
          <span
            className={
              position.unrealized_funding >= 0
                ? 'text-[#00c951]'
                : 'text-[#fb2c36]'
            }
          >
            ${position.unrealized_funding.toFixed(4)}
          </span>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <Table
      columns={columns}
      data={positions || []}
      renderRow={renderRow}
      emptyMessage="No open positions yet"
      minWidth="1200px"
    />
  )
}
