import { useNavigate } from 'react-router-dom'
import { Whisper } from '@/types'
import { timeAgo } from '@/utils/timeAgo'
import LikeDislikeBar from './LikeDislikeBar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'

interface Props {
  whisper: Whisper
  onUpdate: () => void
}

export default function WhisperCard({ whisper, onUpdate }: Props) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const renderContent = (content: string) => {
    const parts = content.split(/(#\w+)/g)
    return parts.map((part, i) =>
      part.startsWith('#') ? (
        <span key={i} className="text-accent hover:underline cursor-pointer">{part}</span>
      ) : part
    )
  }

  const preview = whisper.content.length > 80 ? whisper.content.slice(0, 80) + '...' : whisper.content
  const hasContent = whisper.content || whisper.images.length > 0 || whisper.voice_url

  const handleLike = async () => {
    try {
      await api.post(`/whispers/${whisper.id}/like`)
      onUpdate()
    } catch { /* ignore */ }
  }

  const handleDislike = async () => {
    try {
      await api.post(`/whispers/${whisper.id}/dislike`)
      onUpdate()
    } catch { /* ignore */ }
  }

  const handleFavorite = async () => {
    try {
      if (whisper.isFavorited) {
        await api.delete(`/favorites/${whisper.id}`)
      } else {
        await api.post(`/favorites/${whisper.id}`)
      }
      onUpdate()
    } catch { /* ignore */ }
  }

  // Get image grid layout based on count
  const getImageGridClass = (count: number) => {
    switch (count) {
      case 1: return 'grid-cols-1'
      case 2: return 'grid-cols-2'
      default: return 'grid-cols-3'
    }
  }

  const getImageHeight = (count: number) => {
    switch (count) {
      case 1: return 'h-48'
      case 2: return 'h-32'
      default: return 'h-24'
    }
  }

  return (
    <div
      onClick={() => navigate(`/whisper/${whisper.id}`)}
      role="button"
      tabIndex={0}
      aria-label={`查看${whisper.user_nickname}的低语`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/whisper/${whisper.id}`)}
      className="group bg-surface-card/80 backdrop-blur-sm rounded-2xl p-5 border border-white/[0.05] hover:border-accent/20 transition-all duration-500 cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
    >
      <div className="flex items-center gap-2 mb-3">
        {whisper.user_avatar ? (
          <img src={whisper.user_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-xs text-accent font-ui">
            {whisper.user_nickname?.charAt(0) || '?'}
          </span>
        )}
        <span className="text-sm text-text-secondary font-ui">{whisper.user_nickname}</span>
        <span className="text-xs text-text-muted font-ui">{timeAgo(whisper.created_at)}</span>
        {whisper.hasAiReply && (
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/[0.05] text-text-muted font-ui">AI</span>
        )}
      </div>

      {hasContent ? (
        <>
          {whisper.content ? (
            <p className="text-[15px] leading-relaxed text-text-primary mb-3 line-clamp-3">
              {renderContent(preview)}
            </p>
          ) : null}
          {whisper.images.length > 0 && (
            <div className={`grid ${getImageGridClass(whisper.images.length)} gap-1.5 mb-3 overflow-hidden rounded-xl`}>
              {whisper.images.slice(0, 3).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className={`w-full ${getImageHeight(whisper.images.length)} object-cover rounded-lg`}
                  loading="lazy"
                />
              ))}
            </div>
          )}
          {whisper.voice_url && (
            <div className="flex items-center gap-2 mb-3 text-xs text-accent font-ui">
              <span>🎙️</span>
              <span>语音消息</span>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-text-muted mb-3 italic">[空白低语]</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
        <LikeDislikeBar
          likeCount={whisper.like_count}
          dislikeCount={whisper.dislike_count}
          myReaction={whisper.myReaction}
          onLike={handleLike}
          onDislike={handleDislike}
        />
        {user && (
          <button
            onClick={(e) => { e.stopPropagation(); handleFavorite() }}
            aria-label={whisper.isFavorited ? '取消收藏' : '收藏'}
            className="p-1.5 hover:scale-110 transition-transform"
          >
            <svg
              className={`w-5 h-5 ${whisper.isFavorited ? 'fill-red-500 text-red-500' : 'fill-none text-neutral-500 hover:text-red-400'}`}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
