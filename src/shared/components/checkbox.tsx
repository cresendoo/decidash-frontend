import { Check } from 'lucide-react'

interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  label?: string
}

export function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  className = '',
  label,
}: CheckboxProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <div
      className={`flex items-center gap-2 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
      onClick={handleClick}
    >
      <div
        className={`flex size-5 items-center justify-center rounded-md border transition-colors ${
          checked
            ? 'border-stone-800 bg-stone-800'
            : 'border-stone-800 bg-transparent'
        }`}
      >
        {checked && (
          <Check
            className="size-3 text-[#ede030]"
            strokeWidth={3}
          />
        )}
      </div>
      {label && (
        <span className="select-none text-xs font-normal text-white">
          {label}
        </span>
      )}
    </div>
  )
}
