import React, { useState } from 'react'

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
    // 증거금 비율 자동 계산 (간단한 예시)
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
    // 증거금 자동 계산
    const margin = (availableBalance * percentage) / 100
    setInitialMargin(margin.toFixed(2))
  }

  return (
    <div className="flex h-full flex-col p-4 text-white">
      {/* 상단 설정 영역 - 스크린샷 유사 pill UI */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2">
            <button
              onClick={() => setMarginMode('isolated')}
              className={`rounded-lg px-3 py-1 text-xs transition-colors ${
                marginMode === 'isolated'
                  ? 'bg-gray-100 font-semibold text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
              aria-pressed={marginMode === 'isolated'}
            >
              Isolated
            </button>
            <button
              onClick={() => setMarginMode('cross')}
              className={`rounded-lg px-3 py-1 text-xs transition-colors ${
                marginMode === 'cross'
                  ? 'bg-gray-100 font-semibold text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
              aria-pressed={marginMode === 'cross'}
            >
              Cross
            </button>
          </div>

          <div className="rounded-xl border border-gray-700 bg-gray-900 px-4 py-2 text-xs text-gray-200">
            {leverage}x
          </div>
        </div>
      </div>

      {/* 주문 타입 탭 - 언더라인 인디케이터 */}
      <div className="mb-5">
        <div className="relative">
          <div className="flex text-sm">
            {(['market', 'limit'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`flex-1 px-3 py-2 text-left transition-colors ${
                  orderType === t
                    ? 'text-yellow-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                aria-pressed={orderType === t}
              >
                {t === 'market' ? 'Market' : 'Limit'}
              </button>
            ))}
          </div>
          <div className="h-[1px] bg-gray-700" />
          <div
            className={`absolute bottom-0 h-[2px] bg-yellow-400 transition-all duration-300 ${
              orderType === 'market'
                ? 'left-0 w-1/2'
                : 'left-1/2 w-1/2'
            }`}
          />
        </div>
      </div>

      {/* 포지션 토글 - 세그먼트 */}
      <div className="mb-4">
        <div className="grid grid-cols-2 rounded-xl border border-gray-700 bg-gray-900 p-1">
          <button
            onClick={() => setPositionType('buy')}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              positionType === 'buy'
                ? 'bg-yellow-400 font-semibold text-black'
                : 'text-gray-300 hover:text-white'
            }`}
            aria-pressed={positionType === 'buy'}
          >
            Buy / Long
          </button>
          <button
            onClick={() => setPositionType('sell')}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              positionType === 'sell'
                ? 'border border-gray-700 bg-gray-800 font-semibold text-white'
                : 'text-gray-300 hover:text-white'
            }`}
            aria-pressed={positionType === 'sell'}
          >
            Sell / Short
          </button>
        </div>
      </div>

      {/* 잔고 정보 */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Available to trade
          </span>
          <span className="text-sm font-semibold text-white">
            {availableBalance} USDC
          </span>
        </div>
      </div>

      {/* 초기 증거금 입력 */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="initialMargin"
            className="text-sm text-gray-400"
          >
            Initial Margin
          </label>
        </div>
        <div className="relative">
          <input
            id="initialMargin"
            type="number"
            value={initialMargin}
            onChange={handleMarginChange}
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 py-3 pl-3 pr-16 text-sm text-white focus:border-yellow-500 focus:outline-none"
            step="0.01"
            min="0"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-400">
            USDC
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map((p) => (
            <button
              key={p}
              onClick={() => {
                const margin = (availableBalance * p) / 100
                setMarginPercentage(p)
                setInitialMargin(margin.toFixed(2))
              }}
              className="rounded border border-gray-700 bg-gray-900 py-1 text-xs text-gray-300 hover:border-gray-600 hover:text-white"
            >
              {p}%
            </button>
          ))}
        </div>
      </div>

      {/* 증거금 비율 슬라이더 */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-400">
            Margin Ratio
          </span>
          <span className="rounded border border-gray-700 bg-gray-900 px-2 py-0.5 text-xs text-gray-300">
            {marginPercentage}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={marginPercentage}
          onChange={handlePercentageChange}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-800"
          style={{ accentColor: '#FACC15' }}
        />
      </div>

      {/* 주문 실행 버튼 */}
      <button
        className={`w-full rounded-lg py-3 text-sm font-semibold shadow-lg transition-colors ${
          positionType === 'buy'
            ? 'bg-yellow-400 text-black hover:bg-yellow-300'
            : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
        }`}
      >
        {positionType === 'buy'
          ? 'Buy / Long'
          : 'Sell / Short'}
      </button>
    </div>
  )
}
