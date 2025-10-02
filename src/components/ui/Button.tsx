import React, { forwardRef } from 'react'

import { cn } from '@/shared/utils/cn'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variantClasses = {
      primary:
        'bg-[#ede030] text-stone-950 hover:bg-[#f6eb61] active:bg-[#f6eb61] focus-visible:ring-[#ede030]',
      secondary:
        'bg-stone-900 text-white hover:bg-stone-800 active:bg-stone-800 focus-visible:ring-stone-800',
      outline:
        'border border-stone-800 bg-transparent text-white hover:bg-stone-900 active:bg-stone-900 focus-visible:ring-stone-800',
      ghost:
        'text-white hover:bg-stone-900 active:bg-stone-900',
      destructive:
        'bg-red-500 text-white hover:bg-red-600 active:bg-red-600 focus-visible:ring-red-500',
    }

    const sizeClasses = {
      sm: 'h-9 px-4 text-xs gap-2 rounded-lg',
      md: 'h-10 px-4 text-sm gap-2 rounded-lg',
      lg: 'h-12 px-6 text-base gap-2 rounded-lg',
    }

    const widthClass = fullWidth ? 'w-full' : ''

    const loadingSpinner = (
      <svg
        className="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClass,
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && loadingSpinner}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { Button }
