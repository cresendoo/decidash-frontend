import {
  DeciDashConfig,
  getMarketCandlesticks,
  getMarketPrice,
  getMarketTradeHistory,
  type MarketCandlesticks,
  type MarketCandlesticksInterval,
  type MarketPrice,
  type MarketTradeHistory,
} from '@coldbell/decidash-ts-sdk'
import { useQuery } from '@tanstack/react-query'

type CreateArgs = { config?: DeciDashConfig }

export function createDecidashQueries({ config = DeciDashConfig.DEVNET }: CreateArgs = {}) {
  return {
    useMarketPrice(market: string) {
      return useQuery({
        queryKey: ['decidash', 'prices', market, config.tradingVM.APIURL],
        queryFn: () => getMarketPrice({ decidashConfig: config, market }),
        staleTime: 5_000,
      }) as ReturnType<typeof useQuery<MarketPrice[]>>
    },

    useMarketCandlesticks(args: {
      market: string
      interval: MarketCandlesticksInterval
      startTime: number
      endTime: number
    }) {
      const { market, interval, startTime, endTime } = args
      return useQuery({
        queryKey: [
          'decidash',
          'candles',
          market,
          interval,
          startTime,
          endTime,
          config.tradingVM.APIURL,
        ],
        queryFn: () =>
          getMarketCandlesticks({ decidashConfig: config, market, interval, startTime, endTime }),
        staleTime: 10_000,
      }) as ReturnType<typeof useQuery<MarketCandlesticks[]>>
    },

    useMarketTradeHistory(market: string, limit = 24) {
      return useQuery({
        queryKey: ['decidash', 'trades', market, limit, config.tradingVM.APIURL],
        queryFn: () => getMarketTradeHistory({ decidashConfig: config, market, limit }),
        staleTime: 5_000,
      }) as ReturnType<typeof useQuery<MarketTradeHistory[]>>
    },
  }
}
