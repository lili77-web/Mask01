import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Room } from '@/types'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function RoomsPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDesc, setNewRoomDesc] = useState('')

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/rooms')
      setRooms(data.rooms)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchRooms() }, [fetchRooms])

  const createRoom = async () => {
    if (!newRoomName.trim()) return
    try {
      await api.post('/rooms', { name: newRoomName.trim(), description: newRoomDesc.trim() })
      setNewRoomName('')
      setNewRoomDesc('')
      setShowCreate(false)
      fetchRooms()
    } catch (e: any) {
      alert(e.response?.data?.error || '创建失败')
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      await api.post(`/rooms/${roomId}/join`)
      navigate(`/room/${roomId}`)
    } catch (e: any) {
      alert(e.response?.data?.error || '加入失败')
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-400 transition-colors font-ui text-sm">← 返回</Link>
          {user && (
            <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 rounded-xl bg-white text-black font-ui text-sm">
              + 创建房间
            </button>
          )}
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-white font-bold italic mb-8">话题房间</h1>

        {showCreate && (
          <div className="mb-8 bg-neutral-900/60 rounded-2xl p-5 border border-white/[0.06] animate-fade-up">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="房间名称..."
              className="w-full bg-neutral-950/60 rounded-xl px-4 py-2.5 text-white font-ui text-sm placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none mb-3"
            />
            <input
              type="text"
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
              placeholder="房间描述（可选）..."
              className="w-full bg-neutral-950/60 rounded-xl px-4 py-2.5 text-white font-ui text-sm placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none mb-3"
            />
            <div className="flex gap-2">
              <button onClick={createRoom} className="px-4 py-2 rounded-xl bg-white text-black font-ui text-sm">创建</button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl bg-white/10 text-white font-ui text-sm">取消</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="md" text="加载中..." />
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon="🏠"
            title="还没有话题房间"
            description="创建一个房间开始讨论吧"
          />
        ) : (
          <div className="space-y-3">
            {rooms.map((room, idx) => (
              <div
                key={room.id}
                className="bg-neutral-900/40 hover:bg-neutral-900/60 rounded-2xl p-5 border border-white/[0.04] transition-colors cursor-pointer animate-fade-up"
                style={{ animationDelay: `${idx * 0.05}s`, opacity: 0 }}
                onClick={() => room.isMember ? navigate(`/room/${room.id}`) : joinRoom(room.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-ui font-medium text-lg mb-1">{room.name}</h3>
                    {room.description && (
                      <p className="text-neutral-500 font-ui text-sm mb-2">{room.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-neutral-600 font-ui">
                      <span>创建者: {room.creator_nickname}</span>
                      <span>·</span>
                      <span>{room.member_count} 人</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {room.isMember ? (
                      <span className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-ui">进入</span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-ui">加入</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
