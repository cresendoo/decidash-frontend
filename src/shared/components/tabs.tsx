import { cn } from '../utils/cn'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
  variant?: 'default' | 'bottom-nav'
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'default',
}: TabsProps) {
  if (variant === 'bottom-nav') {
    return (
      <div
        className={cn(
          'flex h-12 w-full border-t border-white/5 bg-stone-950',
          className,
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 pb-1 pt-0 transition-colors',
              activeTab === tab.id
                ? 'text-yellow-300'
                : 'text-white hover:text-gray-200',
            )}
          >
            {tab.icon && (
              <span className="h-4 w-4">{tab.icon}</span>
            )}
            <span className="text-xs font-medium">
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-10 w-full items-center gap-2 bg-stone-950',
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex h-full items-center justify-center gap-1 px-4 pb-1 pt-0 transition-colors',
            activeTab === tab.id
              ? 'border-b-[1.5px] border-yellow-300 text-white'
              : 'text-white/60 hover:text-gray-200',
          )}
        >
          <span className="text-xs font-normal">
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}
