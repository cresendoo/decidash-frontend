import * as React from 'react'
import { createPortal } from 'react-dom'

import { cn } from '../utils/cn'

export interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
}

/**
 * 툴팁 컴포넌트
 * - Figma 디자인 기반 스타일
 * - hover/focus 시 표시
 * - 화살표 포함
 * - Portal을 사용해 overflow 문제 해결
 */
export function Tooltip({
  children,
  content,
  side = 'top',
  className,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState({
    top: 0,
    left: 0,
  })
  const triggerRef = React.useRef<HTMLSpanElement>(null)

  // 위치 계산
  React.useEffect(() => {
    if (!open || !triggerRef.current) return

    const updatePosition = () => {
      const rect =
        triggerRef.current!.getBoundingClientRect()
      const offset = 8 // 화살표 높이 + 여백

      let top = 0
      let left = 0

      // side에 따른 기본 위치
      switch (side) {
        case 'top':
          top = rect.top - offset
          left = rect.left + rect.width / 2
          break
        case 'bottom':
          top = rect.bottom + offset
          left = rect.left + rect.width / 2
          break
        case 'left':
          top = rect.top + rect.height / 2
          left = rect.left - offset
          break
        case 'right':
          top = rect.top + rect.height / 2
          left = rect.right + offset
          break
      }

      setPosition({ top, left })
    }

    updatePosition()

    // 스크롤 이벤트에도 대응
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener(
        'scroll',
        updatePosition,
        true,
      )
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, side])

  const getTransformClasses = () => {
    switch (side) {
      case 'top':
        return '-translate-x-1/2 -translate-y-full'
      case 'bottom':
        return '-translate-x-1/2'
      case 'left':
        return '-translate-x-full -translate-y-1/2'
      case 'right':
        return '-translate-y-1/2'
      default:
        return ''
    }
  }

  const arrowClasses: Record<typeof side, string> = {
    top: 'top-full left-1/2 -translate-x-1/2',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 rotate-180',
    left: 'left-full top-1/2 -translate-y-1/2 rotate-90',
    right: 'right-full top-1/2 -translate-y-1/2 -rotate-90',
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-flex cursor-help"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </span>
      {open &&
        createPortal(
          <div
            className={cn(
              'pointer-events-none fixed z-[9999] w-max max-w-[280px] rounded-[8px] bg-stone-900 px-2.5 py-2.5 text-xs leading-normal text-white shadow-lg',
              getTransformClasses(),
              className,
            )}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
            role="tooltip"
          >
            {content}
            {/* 화살표 */}
            <span
              className={cn(
                'absolute h-0 w-0',
                'border-l-[6px] border-r-[6px] border-t-[8px]',
                'border-l-transparent border-r-transparent border-t-stone-900',
                arrowClasses[side],
              )}
            />
          </div>,
          document.body,
        )}
    </>
  )
}
