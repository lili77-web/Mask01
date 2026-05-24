import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Friend, FriendRequest, SearchUser } from '@/types'
import api from '@/lib/api'
import { timeAgo } from '@/utils/timeAgo'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function FriendsPage() {
  const navigate = useNavigate()
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [searching, setSearching] = useState(false)

  const fetchFriends = useCallback(async () => {
    try {
      const { data } = await api.get('/friends')
      setFriends(data.friends)
      setRequests(data.requests)
    } catch {}
  }, [])

  useEffect(() => { fetchFriends() }, [fetchFriends])

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim().length < 2) return
    setSearching(true)
    try {
      const { data } = await api.get(`/friends/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchResults(data.users)
    } catch {}
    setSearching(false)
  }, [searchQuery])

  const sendRequest = async (friendId: string) => {
    try {
      await api.post('/friends/request', { friendId })
      fetchFriends()
      handleSearch()
    } catch (e: any) {
      alert(e.response?.data?.error || '操作失败')
    }
  }

  const acceptRequest = async (requestId: string) => {
    try {
      await api.post('/friends/accept', { requestId })
      fetchFriends()
    } catch {}
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-400 transition-colors font-ui text-sm">← 返回</Link>
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-white font-bold italic mb-8">好友</h1>

        <div className="mb-8 animate-fade-up" style={{ opacity: 0 }}>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索昵称添加好友..."
              className="flex-1 bg-neutral-900/60 rounded-xl px-4 py-2.5 text-white font-ui text-sm placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-ui text-sm hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              {searching ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                '🔍'
              )}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((u) => (
                <div key={u.id} className="flex items-center justify-between bg-neutral-900/40 rounded-xl p-3 border border-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-ui">
                      {u.nickname.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm text-white font-ui">{u.nickname}</p>
                      <p className="text-xs text-neutral-500 font-ui">{u.phone || '微信用户'}</p>
                    </div>
                  </div>
                  {u.friendStatus === 'accepted' ? (
                    <button onClick={() => navigate(`/chat/${u.id}`)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-ui">
                      发消息
                    </button>
                  ) : u.friendStatus === 'pending' ? (
                    <span className="text-xs text-neutral-500 font-ui">已申请</span>
                  ) : (
                    <button onClick={() => sendRequest(u.id)} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-ui">
                      添加
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {requests.length > 0 && (
          <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <p className="text-xs text-neutral-500 font-ui mb-3 tracking-widest uppercase">好友申请</p>
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between bg-neutral-900/40 rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-ui">
                      {r.nickname.charAt(0)}
                    </span>
                    <p className="text-sm text-white font-ui">{r.nickname}</p>
                  </div>
                  <button onClick={() => acceptRequest(r.id)} className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-ui">
                    接受
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="animate-fade-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
          <p className="text-xs text-neutral-500 font-ui mb-3 tracking-widest uppercase">我的好友 ({friends.length})</p>
          {friends.length === 0 ? (
            <EmptyState
              icon="🌿"
              title="还没有好友"
              description="搜索上方昵称添加好友"
            />
          ) : (
            <div className="space-y-1">
              {friends.map((f) => (
                <button
                  key={f.id}
                  onClick={() => navigate(`/chat/${f.id}`)}
                  className="w-full flex items-center gap-3 bg-neutral-900/40 hover:bg-neutral-900/60 rounded-xl p-3 border border-white/[0.04] transition-colors text-left"
                >
                  <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm text-white font-ui flex-shrink-0">
                    {f.nickname.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-ui">{f.nickname}</p>
                    {f.lastMessage && (
                      <p className="text-xs text-neutral-500 font-ui truncate">{f.lastMessage}</p>
                    )}
                  </div>
                  {f.lastTime && (
                    <span className="text-xs text-neutral-500 font-ui flex-shrink-0">{timeAgo(f.lastTime)}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
