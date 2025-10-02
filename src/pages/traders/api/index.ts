// HTTP 방식 쿼리
export {
  createDeciDashConfig,
  getMarketDepth,
  getMarketIdBySymbol,
  getUserTradeHistory,
  // Utility functions
  http,
  type HttpMethod,
  type MarketCandlesticks,
  type MarketCandlesticksInterval,
  type MarketDepthResponse,
  type MarketPrice,
  type RequestOptions,
  useMarketCandlesticks,
  useMarketId,
  useMarketNames,
  useMarketPrice,
  useMarketPriceDetail,
  useMarkets,
  useUserPositions,
  useUserTradeHistory,
} from './queries'

// WebSocket 방식 쿼리
export {
  // WebSocket session management
  createWsSession,
  type DepthLevel,
  getWsSession,
  type MarketDepth,
  useCandlestickRealtimeUpdater,
  useMarketDepthStream,
  useMarketPriceStream,
} from './websocket-hooks'
