'use client'

import { themeStore } from '@/store/theme-store'
import { useEffect } from 'react'

export default function ThemeChanger({ children }: { children: React.ReactNode }) {
  const theme = themeStore((state) => state.theme)
  const initializeTheme = themeStore((state) => state.initializeTheme)

  useEffect(() => {
    initializeTheme()
  }, [])

  return <div data-theme={theme}>{children}</div>
}
