import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAppStore } from '@/shared/store/appStore'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useAppStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    // 기본 다크 고정: 클래스 유무와 관계없이 다크를 유지
    root.classList.add('dark')
  }, [theme])
  return <>{children}</>
}
