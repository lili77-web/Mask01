import { useState } from 'react'

interface Props {
  likeCount: number
  dislikeCount: number
  myReaction: 'like' | 'dislike' | null
  onLike: () => void
  onDislike: () => void
  size?: 'sm' | 'lg'
}

export default function LikeDislikeBar({ likeCount, dislikeCount, myReaction, onLike, onDislike, size = 'sm' }: Props) {
  const [bouncing, setBouncing] = useState<'like' | 'dislike' | null>(null)

  const handle = (type: 'like' | 'dislike', fn: () => void) => {
    setBouncing(type)
    setTimeout(() => setBouncing(null), 400)
    fn()
  }

  const isLg = size === 'lg'
  const btnBase = isLg
    ? 'flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-300 cursor-pointer select-none'
    : 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer select-none'
  const iconSize = isLg ? 'text-2xl' : 'text-lg'
  const countSize = isLg ? 'text-sm' : 'text-xs'

  return (
    <div className="flex items-center gap-2" role="group" aria-label="喜欢和不喜欢">
      <button
        onClick={() => handle('like', onLike)}
        aria-label={`喜欢，${likeCount}人赞过`}
        aria-pressed={myReaction === 'like'}
        className={`${btnBase} ${
          myReaction === 'like'
            ? 'bg-teal-400/10 text-teal-400 border border-teal-400/30'
            : 'text-text-muted hover:text-teal-400 hover:bg-teal-400/5 border border-transparent'
        }`}
      >
        <span className={`${iconSize} ${bouncing === 'like' ? 'animate-bounce-icon' : ''}`}>👍</span>
        <span className={`${countSize} font-ui`}>{likeCount}</span>
      </button>
      <button
        onClick={() => handle('dislike', onDislike)}
        aria-label={`不喜欢，${dislikeCount}人踩过`}
        aria-pressed={myReaction === 'dislike'}
        className={`${btnBase} ${
          myReaction === 'dislike'
            ? 'bg-red-400/10 text-red-400 border border-red-400/30'
            : 'text-text-muted hover:text-red-400 hover:bg-red-400/5 border border-transparent'
        }`}
      >
        <span className={`${iconSize} ${bouncing === 'dislike' ? 'animate-bounce-icon' : ''}`}>👎</span>
        <span className={`${countSize} font-ui`}>{dislikeCount}</span>
      </button>
    </div>
  )
}