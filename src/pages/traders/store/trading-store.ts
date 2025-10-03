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
  // 모달 상태
  isMarginModeModalOpen: boolean
  setIsMarginModeModalOpen: (open: boolean) => void
  isLeverageModalOpen: boolean
  setIsLeverageModalOpen: (open: boolean) => void
  isClosePositionLimitModalOpen: boolean
  setIsClosePositionLimitModalOpen: (open: boolean) => void
  isClosePositionMarketModalOpen: boolean
  setIsClosePositionMarketModalOpen: (open: boolean) => void
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
    // 모달 기본값
    isMarginModeModalOpen: false,
    setIsMarginModeModalOpen: (isMarginModeModalOpen) =>
      set({ isMarginModeModalOpen }),
    isLeverageModalOpen: false,
    setIsLeverageModalOpen: (isLeverageModalOpen) =>
      set({ isLeverageModalOpen }),
    isClosePositionLimitModalOpen: false,
    setIsClosePositionLimitModalOpen: (
      isClosePositionLimitModalOpen,
    ) => set({ isClosePositionLimitModalOpen }),
    isClosePositionMarketModalOpen: false,
    setIsClosePositionMarketModalOpen: (
      isClosePositionMarketModalOpen,
    ) => set({ isClosePositionMarketModalOpen }),
  }),
)
