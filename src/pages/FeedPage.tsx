import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Whisper, Hashtag } from '@/types'
import api from '@/lib/api'
import WhisperCard from '@/components/WhisperCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useAuthStore } from '@/store/useAuthStore'
import SearchBar from '@/components/SearchBar'
import SkeletonCard from '@/components/SkeletonCard'
import HashtagPill from '@/components/HashtagPill'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { hapticFeedback } from '@/utils/haptics'

type SortMode = 'latest' | 'popular'

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [whispers, setWhispers] = useState<Whisper[]>([])
  const [hashtags, setHashtags] = useState<Hashtag[]>([])
  const [sort, setSort] = useState<SortMode>('latest')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const hashtagFilter = searchParams.get('hashtag') || ''

  const fetchWhispers = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ sort })
    if (cursor) params.set('cursor', cursor)
    if (searchQuery) {
      params.set('q', searchQuery)
    } else if (hashtagFilter) {
      params.set('q', `#${hashtagFilter}`)
    }
    const { data } = await api.get(`/whispers/search?${params}`)
    return { items: data.whispers as Whisper[], nextCursor: data.nextCursor as string | null }
  }, [sort, searchQuery, hashtagFilter])

  const { items, loading: infiniteLoading, hasMore, loadMoreRef, reset } = useInfiniteScroll({ fetchFn: fetchWhispers })

  useEffect(() => {
    api.get('/whispers/hashtags').then(({ data }) => setHashtags(data.hashtags)).catch(() => {})
  }, [])

  const { pullDistance, isRefreshing, containerRef, indicatorStyle } = usePullToRefresh({
    onRefresh: async () => {
      reset()
      await fetchWhispers()
    },
    threshold: 80,
    maxPull: 150,
  })

  useEffect(() => {
    reset()
    setLoading(true)
    fetchWhispers().then(result => {
      setWhispers(result.items)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [sort, searchQuery])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleLike = async (whisperId: string) => {
    hapticFeedback('light')
  }

  return (
    <div ref={containerRef} className="min-h-screen px-4 py-8 md:py-12 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {/* Enhanced Pull to refresh indicator */}
        <div
          className="flex items-center justify-center transition-all duration-300 overflow-hidden"
          style={indicatorStyle}
        >
          <div
            className="flex items-center gap-2 font-ui text-sm"
            style={{
              color: pullDistance > 80 ? '#e5e5e5' : '#737373',
              transform: `scale(${1 + pullDistance / 500})`,
            }}
          >
            <span className={`text-lg ${isRefreshing ? 'animate-spin' : ''}`}>
              {isRefreshing ? '⏳' : pullDistance > 80 ? '👆' : '👇'}
            </span>
            <span>{isRefreshing ? '刷新中...' : pullDistance > 80 ? '松开刷新' : '下拉刷新'}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 animate-fade-up" style={{ opacity: 0 }}>
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-accent font-bold italic">低语海湾</h1>
            <p className="text-text-muted text-sm mt-1 font-ui">{items.length} 条低语等待被听见</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-surface-elevated/50 rounded-lg p-0.5">
              <button onClick={() => setSort('latest')} className={`px-3 py-1.5 rounded-md text-xs font-ui transition-all ${sort === 'latest' ? 'bg-accent/15 text-accent' : 'text-text-muted'}`}>
                最新
              </button>
              <button onClick={() => setSort('popular')} className={`px-3 py-1.5 rounded-md text-xs font-ui transition-all ${sort === 'popular' ? 'bg-accent/15 text-accent' : 'text-text-muted'}`}>
                热门
              </button>
            </div>
            <Link to="/" className="text-text-muted hover:text-text-secondary transition-colors font-ui text-sm">← 返回</Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <SearchBar onSearch={handleSearch} placeholder="搜索低语内容..." />
        </div>

        {/* Hashtags Bar */}
        {hashtags.length > 0 && (
          <div className="mb-6 animate-fade-up overflow-x-auto pb-2" style={{ animationDelay: '0.15s', opacity: 0 }}>
            <div className="flex gap-2 min-w-max">
              {hashtagFilter && (
                <button
                  onClick={() => setSearchParams({})}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-ui"
                >
                  <span>#</span><span>{hashtagFilter}</span><span className="ml-1">×</span>
                </button>
              )}
              {hashtags.filter(h => h.name !== hashtagFilter).map((tag) => (
                <HashtagPill key={tag.id} tag={tag.name} count={tag.count} size="sm" />
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="🌙"
            title={searchQuery ? '没有找到相关低语' : '还没有低语'}
            description={searchQuery ? '试试其他关键词吧' : '成为第一个倾诉的人吧'}
            action={
              user ? (
                <button onClick={() => navigate('/write')} className="inline-block px-6 py-3 rounded-full bg-accent text-black font-ui font-medium transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  🕯️ 写下你的秘密
                </button>
              ) : (
                <button onClick={() => navigate('/login')} className="inline-block px-6 py-3 rounded-full bg-accent text-black font-ui font-medium transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  🕯️ 登录后发布
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((w, i) => (
                <div key={w.id} className="animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.05}s`, opacity: 0 }}>
                  <WhisperCard whisper={w} onUpdate={reset} />
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                {infiniteLoading && <LoadingSpinner size="sm" text="加载更多..." />}
              </div>
            )}
          </>
        )}

        {items.length > 0 && user && (
          <div className="text-center mt-12 pb-12 animate-fade-up" style={{ animationDelay: '0.6s', opacity: 0 }}>
            <button onClick={() => navigate('/write')} className="inline-flex items-center gap-2 text-accent/60 hover:text-accent transition-colors font-ui text-sm">
              <span>🕯️</span>你也有想说的话吗？
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon, title, description, action }: { icon: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-up" style={{ opacity: 0 }}>
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-neutral-400 font-body text-sm mb-2">{title}</h2>
      {description && <p className="text-neutral-600 font-ui text-xs mb-6">{description}</p>}
      {action}
    </div>
  )
}