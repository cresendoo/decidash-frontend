import React, { useState } from 'react'

import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/dialog'

export interface ClosePositionLimitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPrice?: number
  positionSize?: number
  onConfirm?: (
    limitPrice: number,
    orderSize: number,
  ) => void
}

export const ClosePositionLimitModal: React.FC<
  ClosePositionLimitModalProps
> = ({
  open,
  onOpenChange,
  currentPrice = 0,
  positionSize = 100,
  onConfirm,
}) => {
  const [limitPrice, setLimitPrice] = useState(
    currentPrice.toString(),
  )
  const [orderSize, setOrderSize] = useState(
    positionSize.toString(),
  )

  const numLimitPrice = Number(limitPrice) || 0
  const numOrderSize = Number(orderSize) || 0
  const closeValue = numLimitPrice * numOrderSize
  const pnl = closeValue - positionSize * currentPrice // 간단한 PnL 계산 (예시)

  const handleUseMid = () => {
    setLimitPrice(currentPrice.toString())
  }

  const handleConfirm = () => {
    onConfirm?.(numLimitPrice, numOrderSize)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <div className="flex flex-col gap-3">
          <DialogTitle>Close Position (Limit)</DialogTitle>
          <DialogDescription>
            Enter the price you want to close your position
            at.
          </DialogDescription>
        </div>

        {/* Limit Price Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs leading-4 text-white/60">
            Limit Price (USD)
          </label>
          <div className="flex h-10 items-center gap-1 rounded-lg border border-stone-800 px-3 text-sm">
            <input
              type="number"
              value={limitPrice}
              onChange={(e) =>
                setLimitPrice(e.target.value)
              }
              placeholder="0.0"
              className="flex-1 bg-transparent text-white outline-none"
            />
            <button
              onClick={handleUseMid}
              className="text-white/60 underline hover:text-white"
            >
              Mid
            </button>
          </div>
        </div>

        {/* Order Size Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs leading-4 text-white/60">
            Order Size
          </label>
          <div className="flex h-10 items-center gap-1 rounded-lg border border-stone-800 px-3 text-sm text-white">
            <input
              type="number"
              value={orderSize}
              onChange={(e) => setOrderSize(e.target.value)}
              placeholder="100"
              className="flex-1 bg-transparent text-white outline-none"
            />
            <span className="text-white">USDC</span>
          </div>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs leading-4">
            <span className="text-white/60">
              Close Price
            </span>
            <span className="font-medium text-white">
              ${numLimitPrice.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs leading-4">
            <span className="text-white/60">
              Order Size
            </span>
            <span className="font-medium text-white">
              {numOrderSize}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs leading-4">
            <span className="text-white/60">
              Close Value
            </span>
            <span className="font-medium text-white">
              ${closeValue.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs leading-4">
            <span className="text-white/60">PnL</span>
            <span
              className={`font-medium ${
                pnl >= 0 ? 'text-[#00c951]' : 'text-red-500'
              }`}
            >
              {pnl >= 0 ? '+' : ''}${pnl.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Confirm Button */}
        <Button fullWidth onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  )
}
