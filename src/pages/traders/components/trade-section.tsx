import { useState } from 'react'

import { Input } from '@/shared/components'
import { useTradingStore } from '../store/trading-store'
import { ClosePositionLimitModal } from './close-position-limit-modal'
import { ClosePositionMarketModal } from './close-position-market-modal'
import { LeverageModal } from './leverage-modal'
import { MarginModeModal } from './margin-mode-modal'

/**
 * Trade Section 컴포넌트
 *
 * Figma 디자인 기반으로 제작
 * - Isolated/Cross 마진 모드 선택
 * - 레버리지 표시
 * - Market/Limit 주문 타입
 * - Buy/Long vs Sell/Short 포지션 타입
 * - 증거금 입력 및 슬라이더
 */
export default function TradeSection() {
  const [marginMode, setMarginMode] = useState<
    'isolated' | 'cross'
  >('isolated')
  const [leverage, setLeverage] = useState(25)

  // 모달 상태
  const {
    isMarginModeModalOpen,
    setIsMarginModeModalOpen,
    isLeverageModalOpen,
    setIsLeverageModalOpen,
    isClosePositionLimitModalOpen,
    setIsClosePositionLimitModalOpen,
    isClosePositionMarketModalOpen,
    setIsClosePositionMarketModalOpen,
  } = useTradingStore()
  const [orderType, setOrderType] = useState<
    'market' | 'limit'
  >('market')
  const [positionType, setPositionType] = useState<
    'buy' | 'sell'
  >('buy')
  const [initialMargin, setInitialMargin] = useState('0.0')
  const [marginCurrency, setMarginCurrency] = useState<
    'USDC' | 'BTC'
  >('USDC')
  const [marginPercentage, setMarginPercentage] =
    useState(0)

  const availableBalance = 123.23 // USDC 기준
  const BTC_USD_PRICE = 65000 // 추후 실시간 가격 연동 가능

  const parseToNumber = (value: string) => {
    const n = Number(value)
    return isNaN(n) ? 0 : n
  }

  const toUsdc = (
    value: number,
    currency: 'USDC' | 'BTC',
  ) => (currency === 'USDC' ? value : value * BTC_USD_PRICE)

  const toBtc = (valueUsdc: number) =>
    BTC_USD_PRICE > 0 ? valueUsdc / BTC_USD_PRICE : 0

  const formatUsdc = (n: number) =>
    n.toLocaleString(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })
  const formatBtc = (n: number) =>
    n.toLocaleString(undefined, {
      maximumFractionDigits: 6,
      minimumFractionDigits: 0,
    })

  const handleMarginChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value
    setInitialMargin(value)
    const numeric = parseToNumber(value)
    const valueUsdc = toUsdc(numeric, marginCurrency)
    const percentage =
      availableBalance > 0
        ? (valueUsdc / availableBalance) * 100
        : 0
    setMarginPercentage(Math.min(percentage, 100))
  }

  const handlePercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const percentage = Number(e.target.value)
    setMarginPercentage(percentage)
    const marginUsdc = (availableBalance * percentage) / 100
    if (marginCurrency === 'USDC') {
      setInitialMargin(marginUsdc.toFixed(2))
    } else {
      const marginBtc = toBtc(marginUsdc)
      setInitialMargin(marginBtc.toString())
    }
  }

  return (
    <div
      className="flex size-full flex-col gap-2 overflow-clip rounded-[2px] bg-stone-950 p-2"
      data-name="orderbox"
      data-node-id="1620:661"
    >
      {/* Isolated/Cross + Leverage */}
      <div
        className="flex w-full shrink-0 items-center gap-2"
        data-name="selects"
        data-node-id="1620:662"
      >
        <button
          onClick={() => setIsMarginModeModalOpen(true)}
          className="flex h-8 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-stone-900 px-3 py-0 transition-colors hover:bg-stone-800"
          data-name="select"
          data-node-id="1651:1855"
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
          data-name="select"
          data-node-id="1651:1848"
        >
          <p className="text-xs font-medium leading-normal text-white">
            {leverage}x
          </p>
        </button>
      </div>

      {/* Market/Limit 탭 */}
      <div
        className="flex h-10 w-full shrink-0 items-center gap-2 border-b border-b-white/5"
        data-name="tab"
        data-node-id="1620:667"
      >
        <button
          onClick={() => setOrderType('market')}
          className={`flex h-10 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 border-b-[1.5px] px-4 pb-1 pt-0 ${
            orderType === 'market'
              ? 'border-b-[#ede030] text-white'
              : 'border-b-transparent text-white/60'
          }`}
          data-name="tab"
          data-node-id="1651:1546"
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
          data-name="tab"
          data-node-id="1651:1549"
        >
          <p className="text-xs font-normal leading-4">
            Limit
          </p>
        </button>
      </div>

      {/* 주문 영역 */}
      <div className="flex w-full shrink-0 flex-col items-start gap-3 px-0 py-1">
        {/* Buy/Sell 토글 */}
        <div
          className="flex h-8 w-full items-start gap-2 rounded-lg bg-stone-900"
          data-name="tab"
          data-node-id="1621:7959"
        >
          <button
            onClick={() => setPositionType('buy')}
            className={`flex h-8 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-4 py-0 ${
              positionType === 'buy'
                ? 'bg-[#ede030] text-stone-950'
                : 'bg-transparent text-white'
            }`}
            data-name="tab"
            data-node-id="1651:1916"
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
            data-name="tab"
            data-node-id="1651:1919"
          >
            <p className="text-xs font-medium leading-4">
              Sell / Short
            </p>
          </button>
        </div>

        {/* Available to trade */}
        <div
          className="flex w-full shrink-0 items-center justify-between text-xs font-normal leading-normal"
          data-name="available to trade"
          data-node-id="1621:7964"
        >
          <p className="text-white/60">
            Available to trade
          </p>
          <p className="text-right text-white">
            {availableBalance.toFixed(2)} USDC
          </p>
        </div>

        {/* Initial Margin */}
        <div
          className="flex w-full shrink-0 flex-col items-start gap-2"
          data-name="initial margin"
          data-node-id="1621:7967"
        >
          <p className="text-xs font-normal leading-normal text-white/60">
            Initial Margin
          </p>
          <div className="flex w-full flex-col gap-1">
            <div className="flex w-full items-center gap-2">
              <Input
                type="number"
                value={initialMargin}
                onChange={handleMarginChange}
                placeholder="0.0"
                className="flex-1"
                step="0.000001"
                min="0"
                rightIcon={
                  <div className="flex items-center gap-1">
                    <button
                      className={`rounded-md px-2 py-1 text-[10px] ${
                        marginCurrency === 'USDC'
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                      onClick={() =>
                        setMarginCurrency('USDC')
                      }
                      type="button"
                    >
                      USDC
                    </button>
                    <button
                      className={`rounded-md px-2 py-1 text-[10px] ${
                        marginCurrency === 'BTC'
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                      onClick={() =>
                        setMarginCurrency('BTC')
                      }
                      type="button"
                    >
                      BTC
                    </button>
                  </div>
                }
              />
            </div>

            {/* Secondary unit display */}
            <div className="flex items-center justify-end">
              {marginCurrency === 'USDC' ? (
                <p className="text-[11px] leading-4 text-white/60">
                  ≈{' '}
                  {formatBtc(
                    toBtc(
                      toUsdc(
                        parseToNumber(initialMargin),
                        'USDC',
                      ),
                    ),
                  )}{' '}
                  BTC
                </p>
              ) : (
                <p className="text-[11px] leading-4 text-white/60">
                  ≈{' '}
                  {formatUsdc(
                    toUsdc(
                      parseToNumber(initialMargin),
                      'BTC',
                    ),
                  )}{' '}
                  USDC
                </p>
              )}
            </div>
          </div>

          {/* Slider + Percentage */}
          <div className="flex w-full shrink-0 items-start gap-2">
            {/* Slider */}
            <div className="relative h-8 min-h-0 min-w-0 flex-1 shrink-0">
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-[3px] bg-stone-800" />
              <input
                type="range"
                min="0"
                max="100"
                value={marginPercentage}
                onChange={handlePercentageChange}
                className="absolute left-0 top-1/2 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent"
                style={{
                  height: '16px',
                }}
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

            {/* Percentage Display */}
            <div className="flex h-8 w-14 shrink-0 items-center justify-end gap-0.5 rounded-lg border border-white/10 px-3 py-0 text-xs font-normal leading-normal text-white">
              <p className="text-right">
                {marginPercentage}
              </p>
              <p>%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        className={`flex h-12 w-full shrink-0 items-center justify-center gap-1 rounded-xl px-4 py-0 transition-colors ${
          positionType === 'buy'
            ? 'bg-[#ede030] text-stone-950 hover:bg-[#ede030]/90'
            : 'bg-[#fb2c36] text-white hover:bg-[#fb2c36]/90'
        }`}
        data-node-id="1641:1925"
      >
        <p className="text-base font-medium leading-6">
          {positionType === 'buy'
            ? 'Buy / Long'
            : 'Sell / Short'}
        </p>
      </button>

      {/* Modals */}
      <MarginModeModal
        open={isMarginModeModalOpen}
        onOpenChange={setIsMarginModeModalOpen}
        currentMode={marginMode}
        onConfirm={(mode) => {
          setMarginMode(mode)
        }}
      />

      <LeverageModal
        open={isLeverageModalOpen}
        onOpenChange={setIsLeverageModalOpen}
        currentLeverage={leverage}
        minLeverage={1}
        maxLeverage={10}
        onConfirm={(newLeverage) => {
          setLeverage(newLeverage)
        }}
      />

      <ClosePositionLimitModal
        open={isClosePositionLimitModalOpen}
        onOpenChange={setIsClosePositionLimitModalOpen}
        currentPrice={4.7876}
        positionSize={100}
        onConfirm={(limitPrice, orderSize) => {
          console.log('Close Position (Limit):', {
            limitPrice,
            orderSize,
          })
        }}
      />

      <ClosePositionMarketModal
        open={isClosePositionMarketModalOpen}
        onOpenChange={setIsClosePositionMarketModalOpen}
        marketPrice={4.7876}
        positionSize={100}
        estimatedSlippage={-3.6001}
        onConfirm={(orderSize) => {
          console.log('Close Position (Market):', {
            orderSize,
          })
        }}
      />
    </div>
  )
}
