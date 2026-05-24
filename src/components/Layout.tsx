import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import FloatingLights from './FloatingLights'
import MonochromeNature from './MonochromeNature'
import MobileNav from './MobileNav'
import NotificationBell from './NotificationBell'
import { useAuthStore } from '@/store/useAuthStore'

export default function Layout() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage)
  const user = useAuthStore((s) => s.user)
  const theme = useAuthStore((s) => s.theme)
  const toggleTheme = useAuthStore((s) => s.toggleTheme)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <div className="relative min-h-screen pb-14 md:pb-0">
      <MonochromeNature />
      <FloatingLights />
      <div className="relative z-10 min-h-screen">
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            className="p-2 rounded-xl bg-neutral-900/80 text-neutral-400 hover:text-white transition-colors backdrop-blur-sm border border-white/[0.06]"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <NotificationBell />
        </div>
        <Outlet />
      </div>
      <MobileNav />
    </div>
  )
}
