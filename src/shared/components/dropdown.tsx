import { useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

// ============================================
// Dropdown 컴포넌트
// ============================================

interface DropdownOption {
  label: string
  value: string | number
}

interface DropdownProps {
  value: string | number
  options: DropdownOption[]
  onChange: (value: string | number) => void
  className?: string
  placeholder?: string
  /**
   * 드롭다운 메뉴 방향
   * - 'down': 아래로 열림 (기본값)
   * - 'up': 위로 열림
   */
  direction?: 'down' | 'up'
}

export function Dropdown({
  value,
  options,
  onChange,
  className,
  placeholder = 'Select...',
  direction = 'down',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener(
        'mousedown',
        handleClickOutside,
      )
      return () => {
        document.removeEventListener(
          'mousedown',
          handleClickOutside,
        )
      }
    }
  }, [isOpen])

  const selectedOption = options.find(
    (opt) => opt.value === value,
  )

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(
          'flex h-9 items-center gap-1 rounded-lg border border-stone-800 bg-transparent px-3 transition-colors hover:bg-stone-900/50',
          className,
        )}
      >
        <p className="text-xs leading-4 text-white">
          {selectedOption?.label || placeholder}
        </p>
        <svg
          className={twMerge(
            'size-4 text-white transition-transform',
            isOpen && 'rotate-180',
          )}
          fill="none"
          viewBox="0 0 16 16"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="m4 6 4 4 4-4"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={twMerge(
            'absolute right-0 z-50 min-w-[120px] overflow-hidden rounded-lg border border-stone-800 bg-stone-900 shadow-xl',
            direction === 'down'
              ? 'top-full mt-1'
              : 'bottom-full mb-1',
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={twMerge(
                'w-full px-3 py-2 text-left text-xs text-white transition-colors hover:bg-stone-800',
                option.value === value && 'bg-stone-800',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// SearchInput 컴포넌트
// ============================================

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: SearchInputProps) {
  return (
    <div
      className={twMerge(
        'flex h-9 w-[220px] items-center gap-2 rounded-lg border border-stone-800 px-3',
        className,
      )}
    >
      <svg
        className="size-4 shrink-0 text-white"
        fill="none"
        viewBox="0 0 16 16"
      >
        <circle
          cx="7.5"
          cy="7.5"
          r="5.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
          d="m11.5 11.5 3 3"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-xs leading-4 text-white placeholder:text-white/40 focus:outline-none"
      />
    </div>
  )
}
