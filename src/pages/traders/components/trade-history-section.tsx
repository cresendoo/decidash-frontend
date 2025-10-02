import type { MarketTradeHistory } from '@coldbell/decidash-ts-sdk'

import {
  Table,
  TableCell,
  type TableColumn,
  TableRow,
} from '@/shared/components'
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

// 테이블 컬럼 정의
const columns: TableColumn[] = [
  { key: 'time', label: 'Time', align: 'left' },
  { key: 'coin', label: 'Coin', align: 'left' },
  { key: 'direction', label: 'Direction', align: 'left' },
  { key: 'price', label: 'Price', align: 'right' },
  { key: 'size', label: 'Size', align: 'right' },
  {
    key: 'tradeValue',
    label: 'Trade Value',
    align: 'right',
  },
  { key: 'fee', label: 'Fee', align: 'right' },
  {
    key: 'closedPnl',
    label: 'Closed PNL',
    align: 'right',
    underline: true,
  },
]

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

  // 렌더 함수
  const renderRow = (
    trade: MarketTradeHistory,
    index: number,
  ) => {
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
    const isLong = trade.action
      .toLowerCase()
      .includes('long')
    const isOpen = trade.action
      .toLowerCase()
      .includes('open')
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
      <TableRow
        key={`${trade.transaction_version}-${index}`}
      >
        <TableCell>
          <span className="text-white/60">
            {formattedTime}
          </span>
        </TableCell>

        <TableCell>
          <span>{coin}</span>
        </TableCell>

        <TableCell>
          <span className={directionColor}>
            {directionText}
          </span>
        </TableCell>

        <TableCell align="right">
          <span>${trade.price.toFixed(2)}</span>
        </TableCell>

        <TableCell align="right">
          <span>{trade.size.toFixed(4)}</span>
        </TableCell>

        <TableCell align="right">
          <span>${tradeValue.toFixed(2)}</span>
        </TableCell>

        <TableCell align="right">
          <span>${trade.fee_amount.toFixed(4)}</span>
        </TableCell>

        <TableCell align="right">
          <span className={pnlColor}>
            ${trade.realized_pnl_amount.toFixed(2)}
            {trade.realized_funding_amount !== 0 &&
              ` (${trade.is_funding_positive ? '+' : ''}${trade.realized_funding_amount.toFixed(4)})`}
          </span>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <Table
      columns={columns}
      data={trades || []}
      renderRow={renderRow}
      emptyMessage="No trades yet"
      minWidth="1200px"
    />
  )
}
