import {
  DeciDashConfig,
  type WebsocketResponseMarketDepth,
  type WebsocketResponseMarketPrice,
  WSAPISession,
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
      } catch (error) {
        // ignore disconnect error
        console.warn('WebSocket disconnect error:', error)
      }
    },
    subscribeMarketPrice: (market: string): AsyncIterable<WebsocketResponseMarketPrice> =>
      session.subscribeMarketPrice(market),
    subscribeMarketDepth: (market: string): AsyncIterable<WebsocketResponseMarketDepth> =>
      session.subscribeMarketDepth(market),
  }
}

// 싱글톤 WS 세션
let singleton: WSAPISession | null = null
// 전역 connectPromise로 중복 connect 방지
let globalConnectPromise: Promise<void> | null = null
// StrictMode 마운트/언마운트 떨림을 흡수하기 위한 지연 disconnect 타이머
let disconnectTimer: ReturnType<typeof setTimeout> | null = null

export function getWsSession(config: DeciDashConfig = DeciDashConfig.DEVNET) {
  if (!singleton) {
    singleton = new WSAPISession({
      wsURL: config.tradingVM.WSURL,
      WebSocketCtor: config.WebSocketCtor,
    })
  }

  // StrictMode로 인한 mount/unmount 이중 호출을 견디도록 ref-count 도입
  // 전역 refCount를 모듈 스코프에서 유지
  ;(getWsSession as any)._refCount = (getWsSession as any)._refCount ?? 0

  async function connect(): Promise<void> {
    ;(getWsSession as any)._refCount++
    // 빠르게 재마운트될 때 즉시 disconnect 되지 않도록 대기 중 타이머가 있으면 취소
    if (disconnectTimer) {
      clearTimeout(disconnectTimer)
      disconnectTimer = null
    }
    if (!globalConnectPromise) {
      globalConnectPromise = singleton!.connect().catch((e: unknown) => {
        globalConnectPromise = null
        throw e
      })
    }
    return globalConnectPromise
  }

  function disconnect(): void {
    const next = Math.max(0, ((getWsSession as any)._refCount as number) - 1)
    ;(getWsSession as any)._refCount = next
    if (next === 0) {
      // StrictMode에서 즉시 닫으면 CLOSING 상태에 걸릴 수 있어 약간 지연 후 닫기
      if (disconnectTimer) {
        clearTimeout(disconnectTimer)
      }
      disconnectTimer = setTimeout(() => {
        try {
          singleton!.disconnect()
        } catch (error) {
          console.warn('WebSocket disconnect error:', error)
        } finally {
          globalConnectPromise = null
          disconnectTimer = null
        }
      }, 500)
    }
  }

  return {
    session: singleton,
    connect,
    disconnect,
    subscribeMarketPrice: (market: string): AsyncIterable<WebsocketResponseMarketPrice> =>
      singleton!.subscribeMarketPrice(market),
    subscribeMarketDepth: (market: string): AsyncIterable<WebsocketResponseMarketDepth> =>
      singleton!.subscribeMarketDepth(market),
  }
}
