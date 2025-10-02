import React from 'react'
import { twMerge } from 'tailwind-merge'

// ============================================
// DataTable 컴포넌트
// ============================================

type DataTableProps = React.ComponentPropsWithoutRef<'div'>
export function DataTable({
  children,
  className,
  ...props
}: DataTableProps) {
  return (
    <div
      className={twMerge(
        'flex min-w-max flex-col items-start',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================
// DataTableHeader 컴포넌트
// ============================================

type DataTableHeaderProps =
  React.ComponentPropsWithoutRef<'div'>

export function DataTableHeader({
  children,
  className,
  ...props
}: DataTableHeaderProps) {
  return (
    <div
      className={twMerge(
        'flex h-12 w-full items-center border-b border-white/5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================
// DataTableHeaderCell 컴포넌트
// ============================================

interface DataTableHeaderCellProps
  extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * 셀 너비 지정 (flex 기반)
   * - grow: flex-1 (균등 분배)
   * - fixed: 고정 너비 (width 직접 지정)
   */
  width?: 'grow' | 'fixed'
  /**
   * 최소 너비 (px)
   */
  minWidth?: number
  /**
   * 고정 너비 (px) - width="fixed"일 때 사용
   */
  fixedWidth?: number
}

export function DataTableHeaderCell({
  children,
  className,
  width = 'grow',
  minWidth,
  fixedWidth,
  style,
  ...props
}: DataTableHeaderCellProps) {
  const widthClass = width === 'grow' ? 'flex-1' : ''
  const minWidthStyle = minWidth
    ? { minWidth: `${minWidth}px` }
    : {}
  const fixedWidthStyle = fixedWidth
    ? { width: `${fixedWidth}px` }
    : {}

  return (
    <div
      className={twMerge(
        'flex h-full items-center gap-0.5 px-4',
        widthClass,
        className,
      )}
      style={{
        ...minWidthStyle,
        ...fixedWidthStyle,
        ...style,
      }}
      {...props}
    >
      <p className="text-sm leading-5 text-white/60">
        {children}
      </p>
    </div>
  )
}

// ============================================
// DataTableRow 컴포넌트
// ============================================

interface DataTableRowProps
  extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * 호버 효과 활성화 여부
   */
  hoverable?: boolean
}

export function DataTableRow({
  children,
  className,
  hoverable = true,
  ...props
}: DataTableRowProps) {
  const hoverClass = hoverable ? 'hover:bg-stone-900' : ''

  return (
    <div
      className={twMerge(
        'flex h-16 w-full items-center transition-colors',
        hoverClass,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================
// DataTableCell 컴포넌트
// ============================================

interface DataTableCellProps
  extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * 셀 너비 지정 (flex 기반)
   * - grow: flex-1 (균등 분배)
   * - fixed: 고정 너비 (width 직접 지정)
   */
  width?: 'grow' | 'fixed'
  /**
   * 최소 너비 (px)
   */
  minWidth?: number
  /**
   * 고정 너비 (px) - width="fixed"일 때 사용
   */
  fixedWidth?: number
}

export function DataTableCell({
  children,
  className,
  width = 'grow',
  minWidth,
  fixedWidth,
  style,
  ...props
}: DataTableCellProps) {
  const widthClass = width === 'grow' ? 'flex-1' : ''
  const minWidthStyle = minWidth
    ? { minWidth: `${minWidth}px` }
    : {}
  const fixedWidthStyle = fixedWidth
    ? { width: `${fixedWidth}px` }
    : {}

  return (
    <div
      className={twMerge(
        'flex h-full items-center gap-2 px-4',
        widthClass,
        className,
      )}
      style={{
        ...minWidthStyle,
        ...fixedWidthStyle,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================
// DataTableFooter 컴포넌트
// ============================================

type DataTableFooterProps =
  React.ComponentPropsWithoutRef<'div'>

export function DataTableFooter({
  children,
  className,
  ...props
}: DataTableFooterProps) {
  return (
    <div
      className={twMerge(
        'flex h-14 w-full items-end justify-between border-t border-white/5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
