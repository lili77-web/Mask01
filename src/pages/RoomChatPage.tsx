import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { RoomMessage, Room } from '@/types'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { timeAgo } from '@/utils/timeAgo'

export default function RoomChatPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const user = useAuthStore((s) => s.user)
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [room, setRoom] = useState<Room | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchRoom = useCallback(async () => {
    if (!roomId) return
    try {
      const { data } = await api.get(`/rooms/${roomId}`)
      setRoom(data.room)
      setIsMember(data.room.isMember)
    } catch {}
  }, [roomId])

  const fetchMessages = useCallback(async () => {
    if (!roomId) return
    setLoading(true)
    try {
      const { data } = await api.get(`/rooms/${roomId}/messages`)
      setMessages(data.messages)
    } catch {}
    setLoading(false)
  }, [roomId])

  useEffect(() => { fetchRoom(); fetchMessages() }, [fetchRoom, fetchMessages])

  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !roomId) return
    try {
      const { data } = await api.post(`/rooms/${roomId}/messages`, { content: input.trim() })
      setMessages((prev) => [...prev, data.message])
      setInput('')
    } catch (e: any) {
      alert(e.response?.data?.error || '发送失败')
    }
  }

  const joinRoom = async () => {
    if (!roomId) return
    try {
      await api.post(`/rooms/${roomId}/join`)
      setIsMember(true)
      fetchMessages()
    } catch (e: any) {
      alert(e.response?.data?.error || '加入失败')
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-neutral-500 font-ui mb-4">请先登录</p>
        <Link to="/login" className="px-6 py-3 rounded-xl bg-white text-black font-ui">去登录</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] flex-shrink-0">
        <Link to="/rooms" className="text-neutral-500 hover:text-neutral-400 text-sm font-ui">← 返回</Link>
        <div className="text-center">
          <p className="text-sm text-white font-ui font-medium">{room?.name || '话题房间'}</p>
          <p className="text-xs text-neutral-600 font-ui">{room?.member_count || 0} 人在线</p>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="md" text="加载中..." />
          </div>
        ) : !isMember ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-3xl mb-3">🏠</p>
              <p className="text-neutral-500 text-sm font-ui mb-4">加入房间后才能发言</p>
              <button onClick={joinRoom} className="px-6 py-2.5 rounded-xl bg-white text-black font-ui text-sm">
                加入房间
              </button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon="💬"
              title="还没有消息"
              description="来说点什么吧"
            />
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.user_id === user?.id
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMine
                    ? 'bg-white text-black rounded-br-md'
                    : 'bg-neutral-900 text-white rounded-bl-md'
                }`}>
                  {!isMine && (
                    <p className="text-[10px] text-neutral-500 font-ui mb-1">{msg.user_nickname}</p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 font-ui ${isMine ? 'text-black/60' : 'text-neutral-500'}`}>
                    {timeAgo(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {isMember && (
        <div className="px-4 py-3 border-t border-white/[0.04] flex gap-2 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="输入消息..."
            className="flex-1 bg-neutral-900/60 rounded-xl px-4 py-2.5 text-white font-ui text-sm placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="px-4 py-2.5 rounded-xl bg-white text-black font-ui text-sm disabled:opacity-40 transition-opacity"
          >
            发送
          </button>
        </div>
      )}
    </div>
  )
}
