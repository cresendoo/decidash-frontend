import { create } from 'zustand'

type TradingState = {
  selectedMarket: string
  setSelectedMarket: (m: string) => void
}

export const useTradingStore = create<TradingState>((set) => ({
  selectedMarket: 'APT/USD',
  setSelectedMarket: (selectedMarket) => set({ selectedMarket }),
}))


