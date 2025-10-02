import { cn } from '../utils/cn'

export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  className?: string
  width?: string // 예: "100px", "150px"
  underline?: boolean
}

export interface TableProps<T> {
  columns: TableColumn[]
  data: T[]
  renderRow: (item: T, index: number) => React.ReactNode
  emptyMessage?: string
  minWidth?: string // 테이블 최소 너비
  className?: string
}

/**
 * 공통 테이블 컴포넌트
 * - 가로 스크롤 지원
 * - 최소 너비 설정 가능
 * - 유연한 컬럼 구성
 */
export function Table<T>({
  columns,
  data,
  renderRow,
  emptyMessage = 'No data available',
  minWidth = '800px',
  className,
}: TableProps<T>) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-[2px] bg-stone-950',
        className,
      )}
    >
      <div
        className="flex flex-col gap-2.5 px-0 py-2"
        style={{ minWidth }}
      >
        {/* 테이블 헤더 */}
        <div className="flex h-4 items-center gap-2 px-2 text-xs text-white/60">
          {columns.map((column) => (
            <div
              key={column.key}
              className={cn(
                'flex items-center gap-1',
                column.align === 'right' && 'justify-end',
                column.align === 'center' &&
                  'justify-center',
                column.width ? '' : 'flex-1',
                column.className,
              )}
              style={
                column.width
                  ? { width: column.width }
                  : undefined
              }
            >
              <span
                className={cn(
                  column.underline &&
                    'underline decoration-dotted',
                )}
              >
                {column.label}
              </span>
            </div>
          ))}
        </div>

        {/* 테이블 데이터 */}
        {data.length === 0 ? (
          <div className="flex h-4 items-center px-2">
            <p className="flex-1 text-xs text-white">
              {emptyMessage}
            </p>
          </div>
        ) : (
          data.map((item, index) => renderRow(item, index))
        )}
      </div>
    </div>
  )
}

/**
 * 테이블 셀 컴포넌트
 */
export interface TableCellProps {
  children: React.ReactNode
  align?: 'left' | 'center' | 'right'
  width?: string
  className?: string
}

export function TableCell({
  children,
  align = 'left',
  width,
  className,
}: TableCellProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1',
        align === 'right' && 'justify-end',
        align === 'center' && 'justify-center',
        width ? '' : 'flex-1',
        className,
      )}
      style={width ? { width } : undefined}
    >
      {children}
    </div>
  )
}

/**
 * 테이블 행 컴포넌트
 */
export interface TableRowProps {
  children: React.ReactNode
  className?: string
}

export function TableRow({
  children,
  className,
}: TableRowProps) {
  return (
    <div
      className={cn(
        'flex h-4 items-center gap-2 px-2 text-xs text-white',
        className,
      )}
    >
      {children}
    </div>
  )
}
