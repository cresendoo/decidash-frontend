import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useState } from 'react';

import { PositionsSection, TradeHistorySection, TradeSection,TradingSection } from './components';

export default function Traders() {
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  return (
    <PanelGroup direction="horizontal" className="h-screen">
      {/* 왼쪽 메인 영역 - 세로로 리사이징 가능 */}
      <Panel defaultSize={70} minSize={50}>
        <PanelGroup direction="vertical" className="h-full min-h-0">
          {/* 상단: Trading section */}
          <Panel defaultSize={80} minSize={20}>
            <TradingSection />
          </Panel>
          <PanelResizeHandle />
          {/* 하단 통합 섹션: Tabs (Positions / Trade History) */}
          <Panel defaultSize={20} minSize={20}>
            <div className="h-full min-h-0 flex flex-col">
              <div className="px-4 pt-2 border-b border-gray-700">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveTab('positions')}
                    className={
                      activeTab === 'positions'
                        ? 'text-yellow-300 font-semibold pb-2 border-b-2 border-yellow-300'
                        : 'text-gray-400 hover:text-gray-200 pb-2'
                    }
                  >
                    Positions
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={
                      activeTab === 'history'
                        ? 'text-yellow-300 font-semibold pb-2 border-b-2 border-yellow-300'
                        : 'text-gray-400 hover:text-gray-2 00 pb-2'
                    }
                  >
                    Trade History
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
                {activeTab === 'positions' ? (
                  <PositionsSection />
                ) : (
                  <TradeHistorySection />
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </Panel>

      <PanelResizeHandle />

      {/* 오른쪽 사이드바: Trade section */}
      <Panel defaultSize={30} minSize={20}>
        <TradeSection />
      </Panel>
    </PanelGroup>
  );
}
