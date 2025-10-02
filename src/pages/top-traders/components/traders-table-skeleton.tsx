import { Card, CardContent } from '@/shared/components'
import {
  DataTable,
  DataTableCell,
  DataTableFooter,
  DataTableHeader,
  DataTableHeaderCell,
  DataTableRow,
} from '@/shared/components'

/**
 * TradersTable 스켈레톤 컴포넌트
 *
 * 첫 로딩 시에만 표시됩니다.
 */
export default function TradersTableSkeleton() {
  // 10개의 스켈레톤 행 생성
  const skeletonRows = Array.from(
    { length: 10 },
    (_, i) => i,
  )

  return (
    <Card className="p-6">
      <CardContent
        layout="custom"
        className="flex w-full flex-col gap-6"
      >
        {/* Header Section */}
        <div className="flex w-full shrink-0 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-20 animate-pulse rounded bg-white/10" />
            <div className="size-3.5 animate-pulse rounded bg-white/10" />
            <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-[220px] animate-pulse rounded-lg bg-white/10" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <DataTable>
            {/* Table Header */}
            <DataTableHeader>
              <DataTableHeaderCell
                width="grow"
                minWidth={220}
              >
                Trader
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="grow"
                minWidth={112}
              >
                Perp Equity
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="fixed"
                fixedWidth={220}
              >
                Main Position
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="fixed"
                fixedWidth={220}
              >
                Direction Bias
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="grow"
                minWidth={112}
              >
                Daily PnL
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="grow"
                minWidth={112}
              >
                Weekly PnL
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="grow"
                minWidth={112}
              >
                30D PnL
              </DataTableHeaderCell>
              <DataTableHeaderCell
                width="grow"
                minWidth={112}
              >
                All Time PnL
              </DataTableHeaderCell>
            </DataTableHeader>

            {/* Skeleton Rows */}
            {skeletonRows.map((i) => (
              <DataTableRow key={i} hoverable={false}>
                {/* Trader */}
                <DataTableCell width="grow" minWidth={220}>
                  <div className="size-6 animate-pulse rounded-full bg-white/10" />
                  <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
                  <div className="size-4 animate-pulse rounded bg-white/10" />
                </DataTableCell>

                {/* Perp Equity */}
                <DataTableCell width="grow" minWidth={112}>
                  <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
                </DataTableCell>

                {/* Main Position */}
                <DataTableCell
                  width="fixed"
                  fixedWidth={220}
                >
                  <div className="h-6 w-16 animate-pulse rounded-lg bg-white/10" />
                  <div className="h-5 w-12 animate-pulse rounded bg-white/10" />
                  <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
                </DataTableCell>

                {/* Direction Bias */}
                <DataTableCell
                  width="fixed"
                  fixedWidth={220}
                >
                  <div className="h-1.5 w-20 animate-pulse rounded-full bg-white/10" />
                  <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
                </DataTableCell>

                {/* Daily PnL */}
                <DataTableCell
                  width="grow"
                  minWidth={112}
                  className="flex-col items-start justify-center gap-0.5"
                >
                  <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-12 animate-pulse rounded bg-white/10" />
                </DataTableCell>

                {/* Weekly PnL */}
                <DataTableCell
                  width="grow"
                  minWidth={112}
                  className="flex-col items-start justify-center gap-0.5"
                >
                  <div className="h-5 w-16 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-12 animate-pulse rounded bg-white/10" />
                </DataTableCell>

                {/* 30D PnL */}
                <DataTableCell
                  width="grow"
                  minWidth={112}
                  className="flex-col items-start justify-center gap-0.5"
                >
                  <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-12 animate-pulse rounded bg-white/10" />
                </DataTableCell>

                {/* All Time PnL */}
                <DataTableCell
                  width="grow"
                  minWidth={112}
                  className="flex-col items-start justify-center gap-0.5"
                >
                  <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-12 animate-pulse rounded bg-white/10" />
                </DataTableCell>
              </DataTableRow>
            ))}

            {/* Footer */}
            <DataTableFooter>
              <div className="flex h-full items-center gap-2 px-4 pt-4">
                <div className="h-5 w-28 animate-pulse rounded bg-white/10" />
                <div className="h-9 w-16 animate-pulse rounded-lg bg-white/10" />
              </div>
              <div className="flex h-full items-center gap-2 pt-4">
                <div className="size-9 animate-pulse rounded-lg bg-white/10" />
                <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
                <div className="size-9 animate-pulse rounded-lg bg-white/10" />
              </div>
            </DataTableFooter>
          </DataTable>
        </div>
      </CardContent>
    </Card>
  )
}
