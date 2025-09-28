import { useState } from 'react'

import { Button } from './Button'

/**
 * Button 컴포넌트 사용 예제
 * 다양한 variant, size, 상태들을 보여줍니다.
 */
export function ButtonExamples() {
  const [loading, setLoading] = useState(false)

  const handleLoadingClick = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="space-y-8 p-8">
      <h2 className="mb-4 text-2xl font-bold">Button 컴포넌트 예제</h2>

      {/* 기본 Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">기본 Variants</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>

      {/* 다양한 Size */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Size Variants</h3>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="md">
            Medium
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
        </div>
      </div>

      {/* Disabled 상태 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Disabled 상태</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" disabled>
            Primary Disabled
          </Button>
          <Button variant="secondary" disabled>
            Secondary Disabled
          </Button>
          <Button variant="outline" disabled>
            Outline Disabled
          </Button>
        </div>
      </div>

      {/* Loading 상태 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Loading 상태</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" loading={loading} onClick={handleLoadingClick}>
            Click me to load
          </Button>
          <Button variant="secondary" loading>
            Always Loading
          </Button>
        </div>
      </div>

      {/* 아이콘과 함께 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">아이콘과 함께</h3>
        <div className="flex flex-wrap gap-4">
          <Button
            variant="primary"
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            Add Item
          </Button>
          <Button
            variant="outline"
            rightIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            }
          >
            Next
          </Button>
          <Button
            variant="secondary"
            leftIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
            rightIcon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            }
          >
            Gallery
          </Button>
        </div>
      </div>

      {/* Full Width */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Full Width</h3>
        <Button variant="primary" fullWidth>
          Full Width Button
        </Button>
      </div>

      {/* 실제 사용 예제 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">실제 사용 예제 (트레이딩 앱)</h3>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="lg">
            매수
          </Button>
          <Button variant="destructive" size="lg">
            매도
          </Button>
          <Button variant="outline" size="sm">
            차트
          </Button>
          <Button variant="ghost" size="sm">
            포지션
          </Button>
        </div>
      </div>
    </div>
  )
}
