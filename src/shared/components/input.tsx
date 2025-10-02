import React, { forwardRef } from 'react'

import { cn } from '@/shared/utils/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-transparent px-3 transition-colors',
          'focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 hover:bg-white/5',
          className,
        )}
      >
        {leftIcon}
        <input
          ref={ref}
          className={cn(
            'flex-1 bg-transparent text-xs leading-4 text-white placeholder:text-white/40',
            // remove default borders/outlines/shadows on input element itself
            'border-0 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:ring-0',
            'appearance-none shadow-none focus:shadow-none',
          )}
          {...props}
        />
        {rightIcon}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
