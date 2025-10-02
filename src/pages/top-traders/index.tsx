import MarketSummary from './components/market-summary'
// import { MarketSummaryComparison } from './components/market-summary' // 개발용: height 비교 시 주석 해제
import TitleDescription from './components/title-description'

export default function TopTraders() {
  // 개발용: height 비교를 보려면 아래 주석을 해제하세요
  // return <MarketSummaryComparison />

  return (
    <div className="flex size-full flex-col items-center gap-6 bg-stone-950 px-6 py-12">
      <div className="flex w-full max-w-[1312px] flex-col gap-5">
        <TitleDescription />
        <MarketSummary />
        {/* <TradersTable /> */}
      </div>
    </div>
  )
}
