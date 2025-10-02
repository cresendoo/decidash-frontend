import { ReactNode } from 'react'

/**
 * Card 컴포넌트
 *
 * 프로젝트 전역에서 사용되는 공통 카드 컨테이너입니다.
 * - rounded-3xl (24px)
 * - border border-stone-800
 * - padding p-6 (24px)
 */

interface CardProps {
  children: ReactNode
  className?: string
  minHeight?: string
}

export function Card({
  children,
  className = '',
  minHeight,
}: CardProps) {
  const baseClasses =
    'flex min-w-0 flex-1 rounded-3xl border border-stone-800 p-6'
  const heightClass = minHeight ? minHeight : 'min-h-0'

  return (
    <div
      className={`${baseClasses} ${heightClass} ${className}`}
    >
      {children}
    </div>
  )
}

/**
 * CardContent 컴포넌트
 *
 * Card 내부 콘텐츠를 위한 기본 레이아웃입니다.
 */

interface CardContentProps {
  children: ReactNode
  className?: string
  layout?: 'vertical' | 'custom'
}

export function CardContent({
  children,
  className = '',
  layout = 'vertical',
}: CardContentProps) {
  const layoutClasses =
    layout === 'vertical'
      ? 'flex flex-col items-start justify-between'
      : ''

  return (
    <div className={`${layoutClasses} ${className}`}>
      {children}
    </div>
  )
}

/**
 * CardTitle 컴포넌트
 *
 * Card의 제목을 표시합니다.
 */

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({
  children,
  className = '',
}: CardTitleProps) {
  return (
    <p
      className={`text-xs leading-4 text-white/60 ${className}`}
    >
      {children}
    </p>
  )
}
