import { useNavigate } from 'react-router-dom'

interface Props {
  tag: string
  count?: number
  size?: 'sm' | 'md'
}

export default function HashtagPill({ tag, count, size = 'md' }: Props) {
  const navigate = useNavigate()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/feed?hashtag=${encodeURIComponent(tag)}`)
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors font-ui ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span>#</span>
      <span>{tag}</span>
      {count !== undefined && (
        <span className="text-neutral-600 ml-1">{count}</span>
      )}
    </button>
  )
}