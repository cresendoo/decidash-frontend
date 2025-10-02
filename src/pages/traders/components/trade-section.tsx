import { useState } from 'react'

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
  const [leverage] = useState(25)
  const [orderType, setOrderType] = useState<
    'market' | 'limit'
  >('market')
  const [positionType, setPositionType] = useState<
    'buy' | 'sell'
  >('buy')
  const [initialMargin, setInitialMargin] = useState('0.0')
  const [marginPercentage, setMarginPercentage] =
    useState(0)

  const availableBalance = 123.23

  const handleMarginChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value
    setInitialMargin(value)
    if (value && !isNaN(Number(value))) {
      const percentage =
        (Number(value) / availableBalance) * 100
      setMarginPercentage(Math.min(percentage, 100))
    }
  }

  const handlePercentageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const percentage = Number(e.target.value)
    setMarginPercentage(percentage)
    const margin = (availableBalance * percentage) / 100
    setInitialMargin(margin.toFixed(2))
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
        <div
          className="flex h-8 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-stone-900 px-3 py-0"
          data-name="select"
          data-node-id="1651:1855"
        >
          <button
            onClick={() => setMarginMode('isolated')}
            className={`text-xs font-medium leading-normal ${
              marginMode === 'isolated'
                ? 'text-white'
                : 'text-white/60'
            }`}
          >
            Isolated
          </button>
        </div>
        <div
          className="flex h-8 min-h-0 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-stone-900 px-3 py-0"
          data-name="select"
          data-node-id="1651:1848"
        >
          <p className="text-xs font-medium leading-normal text-white">
            {leverage}x
          </p>
        </div>
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
          <div
            className="flex h-9 w-full shrink-0 items-center gap-2 rounded-lg border border-stone-800 px-3 py-0 text-xs font-normal leading-4 text-white"
            data-name="search, input"
            data-node-id="1651:2008"
          >
            <input
              type="number"
              value={initialMargin}
              onChange={handleMarginChange}
              placeholder="0.0"
              className="min-w-0 flex-1 bg-transparent text-white outline-none"
              step="0.01"
              min="0"
            />
            <p className="shrink-0 text-white">USDC</p>
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
            <div className="flex h-8 w-14 shrink-0 items-center justify-end gap-0.5 rounded-lg border border-stone-800 px-3 py-0 text-xs font-normal leading-normal text-white">
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
    </div>
  )
}
