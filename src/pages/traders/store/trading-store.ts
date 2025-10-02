import { create } from 'zustand'

type TradingState = {
  selectedMarket: string
  setSelectedMarket: (m: string) => void
  // 모바일 레이아웃 상태
  mobileMainTab: 'chart' | 'orderbook' | 'trade'
  setMobileMainTab: (
    tab: 'chart' | 'orderbook' | 'trade',
  ) => void
  mobileBottomNav: 'markets' | 'trade'
  setMobileBottomNav: (nav: 'markets' | 'trade') => void
}

export const useTradingStore = create<TradingState>(
  (set) => ({
    selectedMarket: 'APT/USD',
    setSelectedMarket: (selectedMarket) =>
      set({ selectedMarket }),
    // 모바일 기본값
    mobileMainTab: 'chart',
    setMobileMainTab: (mobileMainTab) =>
      set({ mobileMainTab }),
    mobileBottomNav: 'markets',
    setMobileBottomNav: (mobileBottomNav) =>
      set({ mobileBottomNav }),
  }),
)
