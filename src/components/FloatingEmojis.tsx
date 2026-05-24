import { useMemo, useEffect } from 'react'

const EMOJI_LIST = ['🌙', '✨', '🕯️', '💫', '💙', '🤗', '🌟', '🫂', '🌸', '🌿', '🔮', '💭', '🪽', '🌊', '🎐', '🪷', '☁️', '🕊️', '💎', '🍃']

export default function FloatingEmojis() {
  const items = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      emoji: EMOJI_LIST[i % EMOJI_LIST.length],
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 15,
      duration: 25 + Math.random() * 35,
      size: 16 + Math.random() * 24,
      opacity: 0.08 + Math.random() * 0.12,
    }))
  }, [])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes floatEmoji {
        0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: var(--eo); }
        20% { transform: translate(30px, -60px) rotate(15deg) scale(1.1); opacity: calc(var(--eo) * 1.8); }
        40% { transform: translate(-20px, -100px) rotate(-10deg) scale(0.95); opacity: calc(var(--eo) * 1.3); }
        60% { transform: translate(15px, -50px) rotate(5deg) scale(1.05); opacity: calc(var(--eo) * 1.6); }
        80% { transform: translate(-10px, -80px) rotate(-5deg) scale(0.9); opacity: calc(var(--eo) * 2); }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {items.map((item) => (
        <span
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.left,
            top: item.top,
            fontSize: `${item.size}px`,
            animation: `floatEmoji ${item.duration}s ease-in-out ${item.delay}s infinite`,
            '--eo': item.opacity,
          } as React.CSSProperties}
        >
          {item.emoji}
        </span>
      ))}
    </div>
  )
}