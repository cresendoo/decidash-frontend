import React, { useState } from 'react'

import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/dialog'

export interface ClosePositionMarketModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  marketPrice?: number
  positionSize?: number
  estimatedSlippage?: number
  onConfirm?: (orderSize: number) => void
}

export const ClosePositionMarketModal: React.FC<
  ClosePositionMarketModalProps
> = ({
  open,
  onOpenChange,
  marketPrice = 0,
  positionSize = 100,
  estimatedSlippage = -3.6001,
  onConfirm,
}) => {
  const [orderSize, setOrderSize] = useState(
    positionSize.toString(),
  )

  const numOrderSize = Number(orderSize) || 0
  const estimatedPnl = marketPrice * numOrderSize * 0.05 // 간단한 PnL 계산 (예시)

  const handleConfirm = () => {
    onConfirm?.(numOrderSize)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <div className="flex flex-col gap-3">
          <DialogTitle>Close Position (Market)</DialogTitle>
          <DialogDescription>
            Close your position at the current market price.
            This will execute your order at the best
            available price.
          </DialogDescription>
        </div>

        {/* Order Size Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs leading-[normal] text-white/60">
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
              Market Price
            </span>
            <span className="font-medium text-white">
              ${marketPrice.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs leading-4">
            <span className="text-white/60">
              Est. Slippage
            </span>
            <span className="font-medium text-white">
              {estimatedSlippage.toFixed(4)}%
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
            <span className="text-white/60">Est. PnL</span>
            <span
              className={`font-medium ${
                estimatedPnl >= 0
                  ? 'text-[#00c951]'
                  : 'text-red-500'
              }`}
            >
              {estimatedPnl >= 0 ? '+' : ''}$
              {estimatedPnl.toFixed(3)}
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
