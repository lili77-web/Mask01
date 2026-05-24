import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

interface NavItem {
  path: string
  label: string
  icon: string
  requiresAuth?: boolean
}

const navItems: NavItem[] = [
  { path: '/', label: '首页', icon: '🏠' },
  { path: '/feed', label: '广场', icon: '👂' },
  { path: '/write', label: '发布', icon: '🕯️', requiresAuth: true },
  { path: '/friends', label: '好友', icon: '👥', requiresAuth: true },
  { path: '/drafts', label: '草稿', icon: '📝', requiresAuth: true },
  { path: '/favorites', label: '收藏', icon: '❤️', requiresAuth: true },
  { path: '/profile', label: '我的', icon: '⚙️', requiresAuth: true },
]

export default function MobileNav() {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-neutral-950/95 backdrop-blur-lg border-t border-white/[0.06] safe-area-bottom">
        <nav className="flex items-center justify-around h-14 px-2">
          {navItems.map((item) => {
            if (item.requiresAuth && !user) return null

            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-label={item.label}
                aria-current={isActive(item.path) ? 'page' : undefined}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive(item.path)
                    ? 'text-white'
                    : 'text-neutral-500 hover:text-neutral-400'
                }`}
              >
                <span className={`text-xl mb-0.5 transition-transform ${
                  isActive(item.path) ? 'scale-110' : ''
                }`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-ui font-medium">
                  {item.label}
                </span>
                {isActive(item.path) && (
                  <div className="absolute bottom-0 w-8 h-0.5 bg-white rounded-full" />
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-neutral-950/95" />
    </div>
  )
}
