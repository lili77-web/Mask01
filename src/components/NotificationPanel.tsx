import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Notification } from '@/types'
import api from '@/lib/api'
import { timeAgo } from '@/utils/timeAgo'
import LoadingSpinner from './LoadingSpinner'

interface Props {
  onClose: () => void
  onUpdate: () => void
}

export default function NotificationPanel({ onClose, onUpdate }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    if (!user) return
    api.get('/notifications').then(({ data }) => {
      setNotifications(data.notifications)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user])

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      onUpdate()
    } catch { /* ignore */ }
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 bg-neutral-900 rounded-xl border border-white/10 shadow-xl z-50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <span className="text-white font-ui text-sm">通知</span>
          <button
            onClick={markAllRead}
            className="text-xs text-accent hover:underline font-ui"
          >
            全部已读
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-center text-neutral-500 text-sm py-8 font-ui">暂无通知</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-4 border-b border-white/5 ${!n.is_read ? 'bg-white/5' : ''}`}
              >
                <p className="text-sm text-white font-ui">{n.content}</p>
                <p className="text-xs text-neutral-500 mt-1 font-ui">{timeAgo(n.created_at)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}