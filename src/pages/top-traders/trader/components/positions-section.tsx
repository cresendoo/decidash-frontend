import { useState } from 'react'

import { Card } from '@/shared/components'

import AssetPositionsTable from './asset-positions-table'
import CompletedTradesTable from './completed-trades-table'
import OpenOrdersTable from './open-orders-table'
import RecentFillsTable from './recent-fills-table'

type TabType = 'asset' | 'orders' | 'fills' | 'completed'

interface PositionsSectionProps {
  address: string
}

export default function PositionsSection({
  address,
}: PositionsSectionProps) {
  const [activeTab, setActiveTab] =
    useState<TabType>('asset')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'asset':
        return <AssetPositionsTable address={address} />
      case 'orders':
        return <OpenOrdersTable address={address} />
      case 'fills':
        return <RecentFillsTable address={address} />
      case 'completed':
        return <CompletedTradesTable address={address} />
      default:
        return null
    }
  }

  return (
    <Card className="flex flex-col overflow-clip border border-stone-800">
      {/* Info List - Header with Stats */}
      <div className="flex items-center gap-6 border-b border-stone-800 px-6 py-3">
        <div className="flex items-center gap-1 text-xs">
          <p className="text-white/60">Positions</p>
          <p className="text-white">17</p>
          <p className="text-white/40">(15win)</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <p className="text-white/60">Total</p>
          <p className="text-white">$155.6M</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <p className="text-white/60">Long</p>
          <p className="text-white">$155.6M</p>
          <p className="text-white/40">(100%)</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <p className="text-white/60">Short</p>
          <p className="text-white">$0.0</p>
          <p className="text-white/40">(0%)</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <p className="text-white/60">Δ</p>
          <p className="text-[#00c951]">+$142.3M</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <p className="text-white/60">Long PnL</p>
          <p className="text-[#00c951]">+$15.4M</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <p className="text-white/60">Short PnL</p>
          <p className="text-[#00c951]">$0.0</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <p className="text-white/60">UPnL</p>
          <p className="text-[#00c951]">+$15.4M</p>
          <p className="text-white/40">(88% win)</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-5 p-6">
        {/* Button Group - Tab Navigation */}
        <div className="flex items-center gap-2.5">
          <div className="overflow-clip rounded-xl border border-stone-800 p-1">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('asset')}
                className={`flex h-8 items-center justify-center gap-1 rounded-lg px-3 text-xs font-medium ${
                  activeTab === 'asset'
                    ? 'bg-[#ede030] text-stone-950'
                    : 'text-white'
                }`}
              >
                Asset Positions
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex h-8 items-center justify-center gap-1 rounded-lg px-3 text-xs font-medium ${
                  activeTab === 'orders'
                    ? 'bg-[#ede030] text-stone-950'
                    : 'text-white'
                }`}
              >
                Open Orders
              </button>
              <button
                onClick={() => setActiveTab('fills')}
                className={`flex h-8 items-center justify-center gap-1 rounded-lg px-3 text-xs font-medium ${
                  activeTab === 'fills'
                    ? 'bg-[#ede030] text-stone-950'
                    : 'text-white'
                }`}
              >
                Recent Fills
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex h-8 items-center justify-center gap-1 rounded-lg px-3 text-xs font-medium ${
                  activeTab === 'completed'
                    ? 'bg-[#ede030] text-stone-950'
                    : 'text-white'
                }`}
              >
                Completed Trades
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full">{renderTabContent()}</div>
      </div>
    </Card>
  )
}
