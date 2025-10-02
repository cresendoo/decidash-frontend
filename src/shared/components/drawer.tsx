import { type ReactNode, useEffect } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  position?: 'left' | 'right' | 'bottom'
}

export function Drawer({
  isOpen,
  onClose,
  children,
  position = 'left',
}: DrawerProps) {
  // Escape 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // position에 따른 스타일 결정
  const getDrawerStyles = () => {
    switch (position) {
      case 'left':
        return `inset-y-0 left-0 w-[280px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
      case 'right':
        return `inset-y-0 right-0 w-[280px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
      case 'bottom':
        return `inset-x-0 bottom-0 h-[70vh] rounded-t-3xl ${isOpen ? 'translate-y-0' : 'translate-y-full'}`
      default:
        return `inset-y-0 left-0 w-[280px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed z-50 bg-stone-950 transition-transform duration-300 ease-in-out ${getDrawerStyles()}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>
  )
}
