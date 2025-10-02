import {
  Card,
  CardContent,
  CardTitle,
  Tabs,
} from '@/shared/components'

export default function PositionsSection() {
  return (
    <Card>
      <CardContent className="flex w-full flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <CardTitle>Positions</CardTitle>
              <p className="text-xs text-white/60">
                17 (15win)
              </p>
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <Stat label="Total" value="$155.6M" />
              <Stat label="Long" value="$155.6M (100%)" />
              <Stat label="Short" value="$0.0 (0%)" />
              <Stat label="Δ" value="+$142.3M" />
              <Stat label="Long PnL" value="+$15.4M" />
              <Stat label="Short PnL" value="$0.0" />
              <Stat
                label="UPnL"
                value="+$15.4M (88% win)"
              />
            </div>
          </div>
        </div>

        <Tabs
          tabs={[
            { id: 'asset', label: 'Asset Positions' },
            { id: 'orders', label: 'Open Orders' },
            { id: 'fills', label: 'Recent Fills' },
            { id: 'completed', label: 'Completed Trades' },
          ]}
          activeTab={'asset'}
          onChange={() => {}}
          className="-mx-2"
        />

        <div className="w-full overflow-x-auto">
          <div className="min-w-[1000px] rounded-2xl border border-white/5 p-4 text-white/60">
            테이블이 여기에 들어갑니다.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-1 text-white/60">
      <p className="text-xs">{label}</p>
      <p className="text-xs">{value}</p>
    </div>
  )
}
