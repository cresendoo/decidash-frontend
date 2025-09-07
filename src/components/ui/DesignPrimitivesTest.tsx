import { Button } from './Button'

/**
 * 디자인 프리미티브 테스트 컴포넌트
 * global.json에서 정의한 색상들이 제대로 적용되는지 확인
 */
export function DesignPrimitivesTest() {
  return (
    <div
      style={{ backgroundColor: '#0c0a09', color: '#ffffff', minHeight: '100vh', padding: '2rem' }}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="mb-8 text-2xl font-bold">디자인 프리미티브 테스트</h1>

        {/* 색상 팔레트 테스트 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">색상 팔레트</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-default h-8 w-8 rounded"></div>
              <span>Primary Default (#ede030)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary-hover h-8 w-8 rounded"></div>
              <span>Primary Hover (#F6EB61)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-secondary-default h-8 w-8 rounded"></div>
              <span>Secondary Default (stone-900)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-fg-default h-8 w-8 rounded border"></div>
              <span>Foreground Default (white)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-bg-surface h-8 w-8 rounded"></div>
              <span>Background Surface (stone-900)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-border-default h-8 w-8 rounded border"></div>
              <span>Border Default (stone-800)</span>
            </div>
          </div>
        </div>

        {/* 버튼 테스트 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">버튼 Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary 버튼</Button>
            <Button variant="secondary">Secondary 버튼</Button>
            <Button variant="outline">Outline 버튼</Button>
            <Button variant="ghost">Ghost 버튼</Button>
            <Button variant="destructive">Destructive 버튼</Button>
          </div>
        </div>

        {/* 텍스트 색상 테스트 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">텍스트 색상</h2>
          <div className="space-y-2">
            <p className="text-fg-default">기본 텍스트 색상 (fg-default)</p>
            <p className="text-fg-muted">뮤트 텍스트 색상 (fg-muted)</p>
            <p className="text-fg-hint">힌트 텍스트 색상 (fg-hint)</p>
          </div>
        </div>

        {/* 배경색 테스트 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">배경색</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-default text-fg-default rounded p-4">기본 배경 (bg-default)</div>
            <div className="bg-bg-surface text-fg-default rounded p-4">
              서페이스 배경 (bg-surface)
            </div>
            <div className="bg-bg-green text-fg-default rounded p-4">그린 배경 (bg-green)</div>
            <div className="bg-bg-red text-fg-default rounded p-4">레드 배경 (bg-red)</div>
          </div>
        </div>

        {/* 테두리 테스트 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">테두리</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-border-default text-fg-default rounded border p-4">
              기본 테두리 (border-default)
            </div>
            <div className="border-border-muted text-fg-default rounded border p-4">
              뮤트 테두리 (border-muted)
            </div>
            <div className="border-border-green text-fg-default rounded border p-4">
              그린 테두리 (border-green)
            </div>
            <div className="border-border-red text-fg-default rounded border p-4">
              레드 테두리 (border-red)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
