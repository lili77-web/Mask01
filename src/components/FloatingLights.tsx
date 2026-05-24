import { useEffect, useMemo } from 'react'

interface Light {
  id: number
  left: string
  top: string
  size: number
  delay: number
  duration: number
  opacity: number
}

export default function FloatingLights() {
  const lights = useMemo<Light[]>(() => {
    const items: Light[] = []
    for (let i = 0; i < 20; i++) {
      items.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 1 + Math.random() * 3,
        delay: Math.random() * 10,
        duration: 15 + Math.random() * 20,
        opacity: 0.1 + Math.random() * 0.25,
      })
    }
    return items
  }, [])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes floatLight {
        0%,100% { transform: translate(0,0) scale(1); opacity: var(--lo); }
        25% { transform: translate(20px,-40px) scale(1.3); opacity: calc(var(--lo) * 2); }
        50% { transform: translate(-15px,-20px) scale(0.9); opacity: calc(var(--lo) * 1.3); }
        75% { transform: translate(10px,-50px) scale(1.1); opacity: calc(var(--lo) * 1.6); }
      }
    `
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {lights.map((light) => (
        <div
          key={light.id}
          className="absolute rounded-full"
          style={{
            left: light.left,
            top: light.top,
            width: `${light.size}px`,
            height: `${light.size}px`,
            background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)`,
            animation: `floatLight ${light.duration}s ease-in-out ${light.delay}s infinite`,
            '--lo': light.opacity,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}