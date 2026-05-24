import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import NotificationPanel from './NotificationPanel'
import api from '@/lib/api'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    if (!user) return
    const fetchUnread = async () => {
      try {
        const { data } = await api.get('/notifications')
        setUnreadCount(data.unreadCount)
      } catch { /* ignore */ }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [user])

  const handleNotificationUpdate = () => {
    setUnreadCount(0)
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`通知 ${unreadCount > 0 ? `，${unreadCount} 条未读` : ''}`}
        className="relative p-2 text-lg hover:bg-white/5 rounded-lg transition-colors"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center px-1 font-ui">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <NotificationPanel
          onClose={() => setIsOpen(false)}
          onUpdate={handleNotificationUpdate}
        />
      )}
    </div>
  )
}