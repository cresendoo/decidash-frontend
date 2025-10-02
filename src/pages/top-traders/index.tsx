import MarketSummary from './components/market-summary'
// import { MarketSummaryComparison } from './components/market-summary' // 개발용: height 비교 시 주석 해제
import TitleDescription from './components/title-description'
import TradersTable from './components/traders-table'

export default function TopTraders() {
  return (
    <div className="flex size-full flex-col items-center gap-6 overflow-y-auto bg-stone-950 px-6 py-12">
      <div className="flex w-full max-w-[1312px] flex-col gap-5">
        <TitleDescription />
        <MarketSummary />
        <TradersTable />
      </div>
    </div>
  )
}
