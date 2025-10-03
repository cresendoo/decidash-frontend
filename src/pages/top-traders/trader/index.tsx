// import { useParams } from 'react-router-dom'

import {
  EquityOverviewSection,
  PositionsSection,
  TraderHeader,
  TraderSummarySection,
} from './components'

export default function TopTraderDetailPage() {
  // const { address } = useParams()

  // 테스트용 주소 (실제 데이터가 있는 주소)
  const address =
    '0x955b081079c839f2d765105e226efe6f2db3c35c6355a619c946c9ad1c1a003d'

  return (
    <div className="flex size-full flex-col items-center gap-6 overflow-y-auto bg-stone-950 px-6 py-12">
      <div className="flex w-full max-w-[1312px] flex-col gap-5">
        <TraderHeader address={address} />
        <TraderSummarySection address={address} />
        <EquityOverviewSection address={address} />
        <PositionsSection address={address || ''} />
      </div>
    </div>
  )
}
