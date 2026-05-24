import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Whisper } from '@/types'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/api'
import WhisperCard from '@/components/WhisperCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function FavoritesPage() {
  const [whispers, setWhispers] = useState<Whisper[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFavorites = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/favorites')
      setWhispers(data.favorites)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchFavorites() }, [fetchFavorites])

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-400 transition-colors font-ui text-sm">← 返回</Link>
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-white font-bold italic mb-8">我的收藏</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="md" text="加载中..." />
          </div>
        ) : whispers.length === 0 ? (
          <EmptyState
            icon="❤️"
            title="还没有收藏"
            description="点亮心形图标收藏喜欢的低语"
          />
        ) : (
          <div className="space-y-4">
            {whispers.map((whisper) => (
              <WhisperCard
                key={whisper.id}
                whisper={whisper}
                onUpdate={fetchFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}