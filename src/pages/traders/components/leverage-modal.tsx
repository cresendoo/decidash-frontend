import React, { useState } from 'react'

import { Input } from '@/shared/components'
import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/dialog'

export interface LeverageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentLeverage?: number
  minLeverage?: number
  maxLeverage?: number
  onConfirm?: (leverage: number) => void
}

export const LeverageModal: React.FC<
  LeverageModalProps
> = ({
  open,
  onOpenChange,
  currentLeverage = 1,
  minLeverage = 1,
  maxLeverage = 10,
  onConfirm,
}) => {
  const [leverage, setLeverage] = useState(currentLeverage)

  const handleSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLeverage(Number(e.target.value))
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value
    const numValue = Number(value)

    if (!isNaN(numValue)) {
      if (
        numValue >= minLeverage &&
        numValue <= maxLeverage
      ) {
        setLeverage(numValue)
      } else if (numValue > maxLeverage) {
        setLeverage(maxLeverage)
      } else if (numValue < minLeverage) {
        setLeverage(minLeverage)
      }
    }
  }

  const handleConfirm = () => {
    onConfirm?.(leverage)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogTitle>Leverage</DialogTitle>

        <div className="flex flex-col gap-3">
          {/* Input Field */}
          <div className="flex w-full items-center gap-2">
            <Input
              type="number"
              value={leverage}
              onChange={handleInputChange}
              min={minLeverage}
              max={maxLeverage}
              step={1}
              placeholder="0"
              className="flex-1"
              rightIcon={
                <span className="text-white">x</span>
              }
            />
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-0">
            <div className="relative h-8">
              <input
                type="range"
                min={minLeverage}
                max={maxLeverage}
                step={1}
                value={leverage}
                onChange={handleSliderChange}
                className="absolute top-1/2 h-1 w-full -translate-y-1/2 cursor-pointer appearance-none rounded-full bg-stone-800 outline-none"
                style={{
                  background: `linear-gradient(to right, #ede030 0%, #ede030 ${
                    ((leverage - minLeverage) /
                      (maxLeverage - minLeverage)) *
                    100
                  }%, #292524 ${
                    ((leverage - minLeverage) /
                      (maxLeverage - minLeverage)) *
                    100
                  }%, #292524 100%)`,
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
                  box-shadow: 0 0 0 4px #1c1917;
                  border: 2px solid #1c1917;
                }
                input[type="range"]::-moz-range-thumb {
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: #ede030;
                  cursor: pointer;
                  border: none;
                  box-shadow: 0 0 0 4px #1c1917;
                }
              `}</style>
            </div>

            {/* Min/Max Labels */}
            <div className="flex items-center justify-between text-xs leading-4 text-white/60">
              <span>{minLeverage}x</span>
              <span>{maxLeverage}x</span>
            </div>
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
