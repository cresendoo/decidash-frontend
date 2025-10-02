import { useState } from 'react'
import { Settings2 } from 'lucide-react'

type TimeInterval = '1m' | '15m' | '1h' | 'D'

interface ChartControlsProps {
  selectedInterval: TimeInterval
  onIntervalChange: (interval: TimeInterval) => void
}

export default function ChartControls({
  selectedInterval,
  onIntervalChange,
}: ChartControlsProps) {
  const [showIndicators, setShowIndicators] =
    useState(false)

  const intervals: TimeInterval[] = ['1m', '15m', '1h', 'D']

  return (
    <div className="flex w-full items-center gap-2 bg-stone-950 px-3 py-2">
      {/* 시간 인터벌 선택 */}
      <div className="flex items-center gap-1">
        {intervals.map((interval) => (
          <button
            key={interval}
            onClick={() => onIntervalChange(interval)}
            className={`h-8 px-2 text-[12px] font-normal leading-[normal] transition-colors ${
              selectedInterval === interval
                ? 'text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            {interval}
          </button>
        ))}
      </div>

      {/* 구분선 */}
      <div className="h-8 w-px bg-white/10" />

      {/* Indicators 버튼 */}
      <button
        onClick={() => setShowIndicators(!showIndicators)}
        className="flex h-8 items-center gap-1.5 px-2 text-white/60 transition-colors hover:text-white/80"
      >
        <Settings2 size={16} />
        <span className="text-[12px] font-normal leading-[normal]">
          Indicators
        </span>
      </button>

      {/* Indicators 패널 (추후 구현 가능) */}
      {showIndicators && (
        <div className="absolute left-0 top-full z-50 mt-1 rounded-md border border-stone-800 bg-stone-950 p-4 shadow-lg">
          <p className="text-sm text-white/60">
            Indicators coming soon...
          </p>
        </div>
      )}
    </div>
  )
}
