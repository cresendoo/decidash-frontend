import React, { useState } from 'react'
import { Circle, CircleDot } from 'lucide-react'

import { Button } from '@/shared/components/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/dialog'

export interface MarginModeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMode?: 'cross' | 'isolated'
  onConfirm?: (mode: 'cross' | 'isolated') => void
}

export const MarginModeModal: React.FC<
  MarginModeModalProps
> = ({
  open,
  onOpenChange,
  currentMode = 'cross',
  onConfirm,
}) => {
  const [selectedMode, setSelectedMode] = useState<
    'cross' | 'isolated'
  >(currentMode)

  const handleConfirm = () => {
    onConfirm?.(selectedMode)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogTitle>Margin Mode</DialogTitle>

        {/* Cross Option */}
        <button
          className="flex w-full items-start gap-4 text-left transition-opacity hover:opacity-80"
          onClick={() => setSelectedMode('cross')}
        >
          <div className="flex h-5 items-center pt-1">
            {selectedMode === 'cross' ? (
              <CircleDot className="h-4 w-4 text-white" />
            ) : (
              <Circle className="h-4 w-4 text-white" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-base font-medium leading-6 text-white">
              Cross
            </p>
            <p className="text-sm font-normal leading-5 text-white/60">
              All cross positions use the same shared
              margin. If liquidation happens, you could lose
              your margin and all open positions in this
              mode.
            </p>
          </div>
        </button>

        {/* Isolated Option */}
        <button
          className="flex w-full items-start gap-4 text-left transition-opacity hover:opacity-80"
          onClick={() => setSelectedMode('isolated')}
        >
          <div className="flex h-5 items-center pt-1">
            {selectedMode === 'isolated' ? (
              <CircleDot className="h-4 w-4 text-white" />
            ) : (
              <Circle className="h-4 w-4 text-white" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="text-base font-medium leading-6 text-white">
              Isolated
            </p>
            <p className="text-sm font-normal leading-5 text-white/60">
              Each position has its own margin to control
              risk. If an isolated position's margin ratio
              hits 100%, it will be liquidated. You can add
              or remove margin anytime.
            </p>
          </div>
        </button>

        {/* Confirm Button */}
        <Button fullWidth onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogContent>
    </Dialog>
  )
}
