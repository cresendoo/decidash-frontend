import React, { useState } from 'react'

import { Checkbox, Input } from '@/shared/components'
import { useWallet } from '@/shared/hooks'

import {
  useConfigureUserSettings,
  useMarketUserSettings,
} from '../api/account-management'
import { useMarketId } from '../api/queries'
import type { PlaceOrderArgs } from '../api/trading'
import {
  useGetSubAccountBalance,
  usePlaceOrder,
} from '../api/trading'
import { useTradingStore } from '../store/trading-store'
import { LeverageModal } from './leverage-modal'
import { MarginModeModal } from './margin-mode-modal'

/**
 * Trade Section 컴포넌트
 *
 * Market Order: TimeInForce = 2 (IOC - Immediate Or Cancel)
 * Limit Order: TimeInForce = 0 (GTC - Good Till Canceled)
 */
export default function TradeSection() {
  // ============================================
  // State
  // ============================================

  const [marginMode, setMarginMode] = useState<
    'isolated' | 'cross'
  >('isolated')
  const [leverage, setLeverage] = useState(10)
  const [orderType, setOrderType] = useState<
    'market' | 'limit'
  >('market')
  const [positionType, setPositionType] = useState<
    'buy' | 'sell'
  >('buy')

  // Order inputs
  const [orderSize, setOrderSize] = useState('0.0')
  const [sizeCurrency, setSizeCurrency] = useState<
    'USD' | 'BTC'
  >('USD')
  const [orderPercentage, setOrderPercentage] = useState(0)
  const [limitPrice, setLimitPrice] = useState('0.0')

  // Advanced options
  const [isReduceOnly, setIsReduceOnly] = useState(false)
  const [isTpSlEnabled, setIsTpSlEnabled] = useState(false)
  const [tpPrice, setTpPrice] = useState('')
  const [tpPriceType, setTpPriceType] = useState<'$' | '%'>(
    '$',
  )
  const [slPrice, setSlPrice] = useState('')
  const [slPriceType, setSlPriceType] = useState<'$' | '%'>(
    '%',
  )

  // Time in Force (for limit orders)
  const [timeInForce, setTimeInForce] = useState<
    'GTC' | 'POST_ONLY' | 'IOC'
  >('GTC')
  const [
    showTimeInForceDropdown,
    setShowTimeInForceDropdown,
  ] = useState(false)

  // UI state
  const [isEnabling, setIsEnabling] = useState(false)
  const [showWalletModal, setShowWalletModal] =
    useState(false)

  // ============================================
  // Hooks
  // ============================================

  const {
    createMainAccount,
    connected,
    connect,
    wallets,
    hasDelegateAccount,
    createDelegateAccount,
    registerDelegation,
    initializingAccounts,
  } = useWallet()

  const placeOrder = usePlaceOrder()
  const configureSettings = useConfigureUserSettings(
    createMainAccount,
  )

  // 잔액 조회
  const { data: availableBalance = 0 } =
    useGetSubAccountBalance(
      connected && hasDelegateAccount
        ? undefined
        : { enabled: false },
    )

  const {
    selectedMarket,
    isMarginModeModalOpen,
    setIsMarginModeModalOpen,
    isLeverageModalOpen,
    setIsLeverageModalOpen,
  } = useTradingStore()

  // 선택된 마켓의 주소 조회
  const {
    data: marketAddress,
    isLoading: isMarketAddressLoading,
  } = useMarketId(selectedMarket)

  // 마켓별 사용자 설정 조회
  const { data: marketSettings } =
    useMarketUserSettings(marketAddress)

  // 서버에서 가져온 설정값으로 초기화
  React.useEffect(() => {
    if (marketSettings) {
      setMarginMode(
        marketSettings.isIsolated ? 'isolated' : 'cross',
      )
      setLeverage(marketSettings.userLeverage)
    }
  }, [marketSettings])

  console.log(
    '[TradeSection] Selected market:',
    selectedMarket,
  )
  console.log(
    '[TradeSection] Market address:',
    marketAddress,
  )
  console.log(
    '[TradeSection] Market settings:',
    marketSettings,
  )

  // ============================================
  // Helper Functions
  // ============================================

  const parseToNumber = (value: string) => {
    const n = Number(value)
    return isNaN(n) ? 0 : n
  }

  const BTC_USD_PRICE = 65000 // TODO: 실시간 가격

  const toUsdc = (
    value: number,
    currency: 'USD' | 'BTC',
  ) => (currency === 'USD' ? value : value * BTC_USD_PRICE)

  const toBtc = (valueUsdc: number) =>
    BTC_USD_PRICE > 0 ? valueUsdc / BTC_USD_PRICE : 0

  // ============================================
  // Handlers
  // ============================================

  const handleOrderSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value
    setOrderSize(value)
    const numeric = parseToNumber(value)
    const valueUsdc = toUsdc(numeric, sizeCurrency)
    const percentage =
      availableBalance > 0
        ? (valueUsdc / availableBalance) * 100
        : 0
    setOrderPercentage(Math.min(percentage, 100))
  }

  const handlePercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const percentage = Number(e.target.value)
    setOrderPercentage(percentage)
    const sizeUsdc = (availableBalance * percentage) / 100
    if (sizeCurrency === 'USD') {
      setOrderSize(sizeUsdc.toFixed(2))
    } else {
      const sizeBtc = toBtc(sizeUsdc)
      setOrderSize(sizeBtc.toString())
    }
  }

  const handleConnect = (walletName: string) => {
    connect(walletName)
    setShowWalletModal(false)
  }

  const handleEnableTrading = async () => {
    try {
      setIsEnabling(true)
      await createDelegateAccount()
      await registerDelegation()
      alert('Trading enabled successfully!')
    } catch (error) {
      console.error(
        '[TradeSection] Failed to enable trading:',
        error,
      )
      alert('Failed to enable trading. Please try again.')
    } finally {
      setIsEnabling(false)
    }
  }

  const handleSubmitOrder = async () => {
    if (!marketAddress) {
      alert('Market address not found')
      return
    }

    try {
      // TimeInForce 값 설정
      // Market Order: 2 (IOC - Immediate Or Cancel)
      // Limit Order: 0 (GTC), 1 (POST_ONLY), 2 (IOC)
      let timeInForceValue: 0 | 1 | 2 = 0
      if (orderType === 'market') {
        timeInForceValue = 2 // IOC
      } else {
        timeInForceValue =
          timeInForce === 'GTC'
            ? 0
            : timeInForce === 'POST_ONLY'
              ? 1
              : 2
      }

      const orderArgs: PlaceOrderArgs = {
        marketAddress,
        price:
          orderType === 'market'
            ? 0
            : parseToNumber(limitPrice),
        size: parseToNumber(orderSize),
        isLong: positionType === 'buy',
        timeInForce: timeInForceValue,
        isReduceOnly,
        // TP/SL은 추후 구현
        tpTriggerPrice:
          isTpSlEnabled && tpPrice
            ? parseToNumber(tpPrice)
            : undefined,
        slTriggerPrice:
          isTpSlEnabled && slPrice
            ? parseToNumber(slPrice)
            : undefined,
      }

      await placeOrder.mutateAsync(orderArgs)
      alert('Order placed successfully!')
    } catch (error) {
      console.error(
        '[TradeSection] Failed to place order:',
        error,
      )
      alert('Failed to place order. Please try again.')
    }
  }

  const getTimeInForceLabel = () => {
    switch (timeInForce) {
      case 'GTC':
        return 'Good Till Canceled'
      case 'POST_ONLY':
        return 'Post Only'
      case 'IOC':
        return 'Immediate Or Cancel'
    }
  }

  // Margin Mode 변경 핸들러
  const handleMarginModeConfirm = async (
    mode: 'cross' | 'isolated',
  ) => {
    if (!marketAddress) {
      console.error(
        '[TradeSection] Market address is undefined',
      )
      alert(
        `Market address not found for ${selectedMarket}. Please try again.`,
      )
      return
    }

    console.log('[TradeSection] Configuring margin mode:', {
      marketAddress,
      selectedMarket,
      mode,
      leverage,
    })

    try {
      await configureSettings.mutateAsync({
        marketAddress,
        isCross: mode === 'cross',
        userLeverage: leverage,
      })

      // 로컬 상태는 react-query로 자동 업데이트됨
      alert('Margin mode updated successfully!')
    } catch (error) {
      console.error(
        '[TradeSection] Failed to update margin mode:',
        error,
      )
      alert(
        'Failed to update margin mode. Please try again.',
      )
    }
  }

  // Leverage 변경 핸들러
  const handleLeverageConfirm = async (
    newLeverage: number,
  ) => {
    if (!marketAddress) {
      console.error(
        '[TradeSection] Market address is undefined',
      )
      alert(
        `Market address not found for ${selectedMarket}. Please try again.`,
      )
      return
    }

    console.log('[TradeSection] Configuring leverage:', {
      marketAddress,
      selectedMarket,
      marginMode,
      newLeverage,
    })

    try {
      await configureSettings.mutateAsync({
        marketAddress,
        isCross: marginMode === 'cross',
        userLeverage: newLeverage,
      })

      // 로컬 상태는 react-query로 자동 업데이트됨
      alert('Leverage updated successfully!')
    } catch (error) {
      console.error(
        '[TradeSection] Failed to update leverage:',
        error,
      )
      console.error('Error details:', {
        error,
        message:
          error instanceof Error
            ? error.message
            : String(error),
        stack:
          error instanceof Error ? error.stack : undefined,
      })
      alert(
        `Failed to update leverage: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div
      className="flex size-full flex-col gap-2 overflow-clip rounded-[2px] bg-stone-950 p-2"
      data-name="orderbox"
    >
      {/* Isolated/Cross + Leverage */}
      <div className="flex w-full shrink-0 items-center gap-2">
        <button
          onClick={() => setIsMarginModeModalOpen(true)}
          className="flex h-8 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-stone-900 px-3 py-0 transition-colors hover:bg-stone-800"
        >
          <p className="text-xs font-medium leading-normal text-white">
            {marginMode === 'isolated'
              ? 'Isolated'
              : 'Cross'}
          </p>
        </button>
        <button
          onClick={() => setIsLeverageModalOpen(true)}
          className="flex h-8 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-stone-900 px-3 py-0 transition-colors hover:bg-stone-800"
        >
          <p className="text-xs font-medium leading-normal text-white">
            {leverage}x
          </p>
        </button>
      </div>

      {/* Market/Limit 탭 */}
      <div className="flex h-10 w-full shrink-0 items-center gap-2 border-b border-b-white/5">
        <button
          onClick={() => setOrderType('market')}
          className={`flex h-10 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 border-b-[1.5px] px-4 pb-1 pt-0 ${
            orderType === 'market'
              ? 'border-b-[#ede030] text-white'
              : 'border-b-transparent text-white/60'
          }`}
        >
          <p className="text-xs font-normal leading-4">
            Market
          </p>
        </button>
        <button
          onClick={() => setOrderType('limit')}
          className={`flex h-10 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 border-b-[1.5px] px-4 pb-1 pt-0 ${
            orderType === 'limit'
              ? 'border-b-[#ede030] text-white'
              : 'border-b-transparent text-white/60'
          }`}
        >
          <p className="text-xs font-normal leading-4">
            Limit
          </p>
        </button>
      </div>

      {/* 주문 영역 */}
      <div className="flex w-full shrink-0 flex-col items-start gap-3 px-0 py-1">
        {/* Buy/Sell 토글 */}
        <div className="flex h-8 w-full items-start gap-2 rounded-lg bg-stone-900">
          <button
            onClick={() => setPositionType('buy')}
            className={`flex h-8 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-4 py-0 ${
              positionType === 'buy'
                ? 'bg-[#ede030] text-stone-950'
                : 'bg-transparent text-white'
            }`}
          >
            <p className="text-xs font-medium leading-4">
              Buy / Long
            </p>
          </button>
          <button
            onClick={() => setPositionType('sell')}
            className={`flex h-8 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-4 py-0 ${
              positionType === 'sell'
                ? 'bg-[#ede030] text-stone-950'
                : 'bg-transparent text-white'
            }`}
          >
            <p className="text-xs font-medium leading-4">
              Sell / Short
            </p>
          </button>
        </div>

        {/* Available to trade */}
        <div className="flex w-full shrink-0 items-center justify-between text-xs font-normal leading-normal">
          <p className="text-white/60">
            Available to trade
          </p>
          <p className="text-right text-white">
            {availableBalance.toFixed(2)} USDC
          </p>
        </div>

        {/* Order Size */}
        <div className="flex w-full shrink-0 flex-col items-start gap-2">
          <div className="flex w-full items-center justify-between text-xs font-normal leading-normal text-white/60">
            <p>Order Size</p>
            <p>
              ≈{' '}
              {toBtc(
                toUsdc(
                  parseToNumber(orderSize),
                  sizeCurrency,
                ),
              ).toFixed(6)}{' '}
              BTC
            </p>
          </div>
          <div className="flex w-full flex-col gap-1">
            <Input
              type="number"
              value={orderSize}
              onChange={handleOrderSizeChange}
              placeholder="0.0"
              className="h-9 w-full"
              step="0.000001"
              min="0"
              rightIcon={
                <div className="flex items-center gap-1">
                  <button
                    className={`rounded-md px-2 py-1 text-[10px] ${
                      sizeCurrency === 'USD'
                        ? 'bg-stone-900 text-white'
                        : 'text-white/60'
                    }`}
                    onClick={() => setSizeCurrency('USD')}
                    type="button"
                  >
                    USD
                  </button>
                  <button
                    className={`rounded-md px-2 py-1 text-[10px] ${
                      sizeCurrency === 'BTC'
                        ? 'bg-stone-900 text-white'
                        : 'text-white/60'
                    }`}
                    onClick={() => setSizeCurrency('BTC')}
                    type="button"
                  >
                    BTC
                  </button>
                </div>
              }
            />
          </div>

          {/* Slider */}
          <div className="flex w-full shrink-0 items-start gap-2">
            <div className="relative h-8 min-h-0 min-w-0 flex-1 shrink-0">
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-[3px] bg-stone-800" />
              <input
                type="range"
                min="0"
                max="100"
                value={orderPercentage}
                onChange={handlePercentageChange}
                className="absolute left-0 top-1/2 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent"
                style={{ height: '16px' }}
              />
              <style>{`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #ede030;
                  cursor: pointer;
                }
                input[type="range"]::-moz-range-thumb {
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #ede030;
                  cursor: pointer;
                  border: none;
                }
              `}</style>
            </div>
            <div className="flex h-8 w-14 shrink-0 items-center justify-end gap-0.5 rounded-lg border border-white/10 px-3 py-0 text-xs font-normal leading-normal text-white">
              <p className="text-right">
                {Math.round(orderPercentage)}
              </p>
              <p>%</p>
            </div>
          </div>
        </div>

        {/* Limit Price (Limit Order만 표시) */}
        {orderType === 'limit' && (
          <div className="flex w-full shrink-0 flex-col items-start gap-2">
            <p className="text-xs font-normal leading-normal text-white/60">
              Limit Price (USD)
            </p>
            <Input
              type="number"
              value={limitPrice}
              onChange={(e) =>
                setLimitPrice(e.target.value)
              }
              placeholder="0.0"
              className="h-9 w-full"
              step="0.01"
              min="0"
              rightIcon={
                <button
                  className="text-xs text-white/60 underline"
                  type="button"
                >
                  Mid
                </button>
              }
            />
          </div>
        )}

        {/* Reduce Only */}
        <Checkbox
          checked={isReduceOnly}
          onChange={setIsReduceOnly}
          label="Reduce Only"
        />

        {/* TP/SL */}
        <div className="flex w-full flex-col gap-3">
          <Checkbox
            checked={isTpSlEnabled}
            onChange={setIsTpSlEnabled}
            label="Take Profit / Stop Loss"
          />

          {isTpSlEnabled && (
            <>
              {/* TP */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <p className="text-xs text-white/60">
                    TP
                  </p>
                  <Input
                    type="number"
                    value={tpPrice}
                    onChange={(e) =>
                      setTpPrice(e.target.value)
                    }
                    placeholder=""
                    className="h-9 flex-1"
                    rightIcon={
                      <div className="flex items-center gap-0">
                        <button
                          className={`flex h-7 items-center justify-center rounded-lg px-3 text-xs transition-colors ${
                            tpPriceType === '$'
                              ? 'bg-stone-900 text-white'
                              : 'text-white/60 hover:text-white'
                          }`}
                          onClick={() =>
                            setTpPriceType('$')
                          }
                          type="button"
                        >
                          $
                        </button>
                        <button
                          className={`flex h-7 items-center justify-center rounded-lg px-3 text-xs transition-colors ${
                            tpPriceType === '%'
                              ? 'bg-stone-900 text-white'
                              : 'text-white/60 hover:text-white'
                          }`}
                          onClick={() =>
                            setTpPriceType('%')
                          }
                          type="button"
                        >
                          %
                        </button>
                      </div>
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <p className="text-xs text-white/60">
                    $0.00 Gain / Price $0.00
                  </p>
                </div>
              </div>

              {/* SL */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <p className="w-4 text-xs text-white/60">
                    SL
                  </p>
                  <Input
                    type="number"
                    value={slPrice}
                    onChange={(e) =>
                      setSlPrice(e.target.value)
                    }
                    placeholder="10"
                    className="h-9 flex-1"
                    rightIcon={
                      <div className="flex items-center gap-0">
                        <button
                          className={`flex h-7 items-center justify-center rounded-lg px-3 text-xs transition-colors ${
                            slPriceType === '$'
                              ? 'bg-stone-900 text-white'
                              : 'text-white/60 hover:text-white'
                          }`}
                          onClick={() =>
                            setSlPriceType('$')
                          }
                          type="button"
                        >
                          $
                        </button>
                        <button
                          className={`flex h-7 items-center justify-center rounded-lg px-3 text-xs transition-colors ${
                            slPriceType === '%'
                              ? 'bg-stone-900 text-white'
                              : 'text-white/60 hover:text-white'
                          }`}
                          onClick={() =>
                            setSlPriceType('%')
                          }
                          type="button"
                        >
                          %
                        </button>
                      </div>
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <p className="text-xs text-white/60">
                    $0.00 Gain / Price $105,231
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Time in Force (Limit Order만 표시) */}
      {orderType === 'limit' && (
        <div className="relative flex w-full items-center justify-between">
          <p className="text-xs text-white/60">
            Time in Force
          </p>
          <button
            onClick={() =>
              setShowTimeInForceDropdown(
                !showTimeInForceDropdown,
              )
            }
            className="flex items-center gap-1 text-xs text-white"
          >
            <span>{getTimeInForceLabel()}</span>
            <svg
              className="size-4"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Time in Force Dropdown */}
          {showTimeInForceDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() =>
                  setShowTimeInForceDropdown(false)
                }
              />
              <div className="absolute right-0 top-full z-50 mt-1 overflow-hidden rounded-lg bg-stone-900">
                {(['GTC', 'POST_ONLY', 'IOC'] as const).map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setTimeInForce(option)
                        setShowTimeInForceDropdown(false)
                      }}
                      className={`flex h-8 w-full items-center px-3 text-xs text-white transition-colors hover:bg-white/5 ${
                        timeInForce === option
                          ? 'bg-white/5'
                          : ''
                      }`}
                    >
                      {option === 'GTC'
                        ? 'Good Till Canceled'
                        : option === 'POST_ONLY'
                          ? 'Post Only'
                          : 'Immediate Or Cancel'}
                    </button>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Submit Button */}
      {!connected ? (
        <div className="relative">
          <button
            onClick={() =>
              setShowWalletModal(!showWalletModal)
            }
            className="flex h-12 w-full shrink-0 items-center justify-center gap-1 rounded-xl bg-[#ede030] px-4 py-0 text-stone-950 transition-colors hover:bg-[#ede030]/90"
          >
            <p className="text-base font-medium leading-6">
              Connect Wallet
            </p>
          </button>

          {showWalletModal && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowWalletModal(false)}
              />
              <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-lg border border-stone-800 bg-stone-950 p-4 shadow-xl">
                <h3 className="mb-3 text-sm font-semibold text-white">
                  Connect a Wallet
                </h3>
                <div className="flex flex-col gap-2">
                  {wallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() =>
                        handleConnect(wallet.name)
                      }
                      className="flex items-center gap-3 rounded-lg border border-stone-800 bg-stone-900/50 px-4 py-3 text-left transition-colors hover:bg-stone-800"
                    >
                      {wallet.icon && (
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="h-6 w-6 rounded"
                        />
                      )}
                      <span className="text-sm text-white">
                        {wallet.name}
                      </span>
                    </button>
                  ))}
                  {wallets.length === 0 && (
                    <p className="text-xs text-white/60">
                      No wallets detected. Please install a
                      wallet extension.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : !hasDelegateAccount ? (
        <button
          onClick={handleEnableTrading}
          disabled={isEnabling || initializingAccounts}
          className="flex h-12 w-full shrink-0 items-center justify-center gap-1 rounded-xl bg-[#ede030] px-4 py-0 text-stone-950 transition-colors hover:bg-[#ede030]/90 disabled:opacity-50"
        >
          <p className="text-base font-medium leading-6">
            {isEnabling || initializingAccounts
              ? 'Enabling...'
              : 'Enable Trading'}
          </p>
        </button>
      ) : (
        <button
          onClick={handleSubmitOrder}
          disabled={placeOrder.isPending}
          className={`flex h-12 w-full shrink-0 items-center justify-center gap-1 rounded-xl px-4 py-0 transition-colors disabled:opacity-50 ${
            positionType === 'buy'
              ? 'bg-[#ede030] text-stone-950 hover:bg-[#ede030]/90'
              : 'bg-[#fb2c36] text-white hover:bg-[#fb2c36]/90'
          }`}
        >
          <p className="text-base font-medium leading-6">
            {placeOrder.isPending
              ? 'Placing Order...'
              : positionType === 'buy'
                ? 'Buy / Long'
                : 'Sell / Short'}
          </p>
        </button>
      )}

      {/* Modals */}
      <MarginModeModal
        open={isMarginModeModalOpen}
        onOpenChange={setIsMarginModeModalOpen}
        currentMode={marginMode}
        onConfirm={handleMarginModeConfirm}
      />

      <LeverageModal
        open={isLeverageModalOpen}
        onOpenChange={setIsLeverageModalOpen}
        currentLeverage={leverage}
        minLeverage={1}
        maxLeverage={10}
        onConfirm={handleLeverageConfirm}
      />

      {/* Debug info - 개발 중에만 표시 */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-stone-900 p-3 text-xs text-white/60">
          <p>Market: {selectedMarket}</p>
          <p>
            Address:{' '}
            {isMarketAddressLoading
              ? 'Loading...'
              : marketAddress || 'Not found'}
          </p>
        </div>
      )}
    </div>
  )
}
