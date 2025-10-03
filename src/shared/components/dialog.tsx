import React, { useEffect } from 'react'
import { X } from 'lucide-react'

import { cn } from '@/shared/utils/cn'

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export interface DialogContentProps {
  className?: string
  children: React.ReactNode
  onClose?: () => void
}

export interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

export interface DialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export const DialogContent: React.FC<
  DialogContentProps
> = ({ className, children, onClose }) => {
  return (
    <div
      className={cn(
        'relative flex w-[420px] flex-col gap-5 rounded-3xl bg-stone-900 p-9',
        className,
      )}
    >
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/5"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      )}

      {children}
    </div>
  )
}

export const DialogTitle: React.FC<DialogTitleProps> = ({
  className,
  children,
}) => {
  return (
    <h2
      className={cn(
        'text-xl font-medium leading-7 text-white',
        className,
      )}
    >
      {children}
    </h2>
  )
}

export const DialogDescription: React.FC<
  DialogDescriptionProps
> = ({ className, children }) => {
  return (
    <p
      className={cn(
        'text-sm font-normal leading-5 text-white/60',
        className,
      )}
    >
      {children}
    </p>
  )
}
