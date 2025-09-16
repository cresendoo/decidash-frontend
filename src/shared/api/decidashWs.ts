import {
  DeciDashConfig,
  WSAPISession,
  type WebsocketResponseMarketDepth,
  type WebsocketResponseMarketPrice,
} from '@coldbell/decidash-ts-sdk'

export function createWsSession(config: DeciDashConfig = DeciDashConfig.DEVNET) {
  const session = new WSAPISession({
    wsURL: config.tradingVM.WSURL,
    WebSocketCtor: config.WebSocketCtor,
  })
  return {
    session,
    connect: () => session.connect(),
    disconnect: () => {
      try {
        session.disconnect()
      } catch {}
    },
    subscribeMarketPrice: (market: string): AsyncIterable<WebsocketResponseMarketPrice> =>
      session.subscribeMarketPrice(market),
    subscribeMarketDepth: (market: string): AsyncIterable<WebsocketResponseMarketDepth> =>
      session.subscribeMarketDepth(market),
  }
}
