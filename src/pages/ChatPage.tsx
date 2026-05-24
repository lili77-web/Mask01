import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Message } from '@/types'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { timeAgo } from '@/utils/timeAgo'
import { useSocket } from '@/hooks/useSocket'

export default function ChatPage() {
  const { friendId } = useParams<{ friendId: string }>()
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const { emit, on, off } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [friendName, setFriendName] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [friendTyping, setFriendTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const PAGE_SIZE = 20

  useEffect(() => {
    if (!token) return
    const handleNewMessage = (data: any) => {
      if (data.from === friendId) {
        setMessages(prev => [...prev, { id: Date.now().toString(), sender_id: data.from, receiver_id: user!.id, content: data.content, created_at: data.created_at }])
        api.post(`/messages/${friendId}/read`).catch(() => {})
      }
    }
    const handleTyping = (data: any) => {
      if (data.from === friendId) setFriendTyping(true)
    }
    on('new_message', handleNewMessage)
    on('user_typing', handleTyping)
    return () => {
      off('new_message', handleNewMessage)
      off('user_typing', handleTyping)
    }
  }, [token, friendId, user, on, off])

  const fetchMessages = useCallback(async (pageNum = 1, append = false) => {
    if (!friendId) return
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const { data: msgData } = await api.get(`/messages/${friendId}?page=${pageNum}&limit=${PAGE_SIZE}`)
      const newMessages = msgData.messages || []

      if (append) {
        setMessages(prev => [...newMessages, ...prev])
      } else {
        setMessages(newMessages)
      }

      setHasMore(newMessages.length === PAGE_SIZE)

      if (pageNum === 1) {
        const { data: friendData } = await api.get('/friends')
        const f = friendData.friends.find((f: any) => f.id === friendId)
        if (f) setFriendName(f.nickname)
      }
    } catch {}

    if (pageNum === 1) setLoading(false)
    else setLoadingMore(false)
  }, [friendId])

  useEffect(() => { fetchMessages(1, false) }, [fetchMessages])

  useEffect(() => {
    if (page === 1) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, page])

  useEffect(() => {
    inputRef.current?.focus()
  }, [friendId])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container || loadingMore || !hasMore) return

    if (container.scrollTop < 50) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchMessages(nextPage, true)
    }
  }, [page, loadingMore, hasMore, fetchMessages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)

    emit('typing', { to: friendId })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setFriendTyping(false)
    }, 2000)
  }

  const sendMessage = async () => {
    if (!input.trim() || !friendId || sending) return
    setSending(true)
    try {
      const { data } = await api.post(`/messages/${friendId}`, { content: input.trim() })
      setMessages((prev) => [...prev, data.message])
      emit('send_message', { to: friendId, content: input.trim() })
      setInput('')
      inputRef.current?.focus()
      api.post(`/messages/${friendId}/read`).catch(() => {})
    } catch {}
    setSending(false)
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] flex-shrink-0">
        <Link to="/friends" className="text-neutral-500 hover:text-neutral-400 text-sm font-ui">← 返回</Link>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-ui">
            {friendName?.charAt(0) || '?'}
          </span>
          <span className="text-sm text-neutral-400 font-ui">{friendName || '好友'}</span>
          {friendTyping && <span className="text-xs text-neutral-600 font-ui animate-pulse">正在输入...</span>}
        </div>
        <div className="w-12" />
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {loadingMore && (
          <div className="text-center py-2">
            <p className="text-xs text-neutral-500 font-ui">加载更多...</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner size="md" text="加载中..." />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              icon="💬"
              title="打个招呼吧"
              description="开启你们的第一次对话"
            />
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_id === user?.id
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                  isMine
                    ? 'bg-white text-black rounded-br-md'
                    : 'bg-neutral-900 text-white rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 font-ui ${isMine ? 'text-black/60' : 'text-neutral-500'}`}>
                    {timeAgo(msg.created_at)}
                    {msg.is_read && isMine && <span className="ml-1">· 已读</span>}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-white/[0.04] flex gap-2 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="输入消息..."
          disabled={sending}
          className="flex-1 bg-neutral-900/60 rounded-xl px-4 py-2.5 text-white font-ui text-sm placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="px-4 py-2.5 rounded-xl bg-white text-black font-ui text-sm disabled:opacity-40 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          {sending ? (
            <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            '发送'
          )}
        </button>
      </div>
    </div>
  )
}