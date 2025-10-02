import { useParams } from 'react-router-dom'

import {
  EquityOverviewSection,
  PositionsSection,
  TraderHeader,
  TraderSummarySection,
} from './components'

export default function TopTraderDetailPage() {
  const { address } = useParams()

  return (
    <div className="flex size-full flex-col items-center gap-6 overflow-y-auto bg-stone-950 px-6 py-12">
      <div className="flex w-full max-w-[1312px] flex-col gap-5">
        <TraderHeader address={address} />
        <TraderSummarySection address={address} />
        <EquityOverviewSection address={address} />
        <PositionsSection />
      </div>
    </div>
  )
}
