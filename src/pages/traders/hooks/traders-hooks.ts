// 이 파일은 더 이상 사용되지 않습니다.
// 모든 기능이 ../api 폴더로 이동되었습니다.
// 하위 호환성을 위해 re-export만 유지합니다.

export {
  useMarketPrice,
  useMarketCandlesticks,
  type DepthLevel,
  type MarketDepth,
} from '../api/queries'

export { useMarketDepthStream as useMarketDepth } from '../api/websocket-hooks'
