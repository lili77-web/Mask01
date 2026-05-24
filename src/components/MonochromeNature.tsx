import { useMemo } from 'react'

const TREE_PATH = 'M50,100 Q30,70 35,50 Q25,40 30,25 Q35,15 45,10 Q50,5 55,10 Q65,15 70,25 Q75,40 65,50 Q70,70 50,100 M50,100 Q50,85 50,70 M40,60 Q45,55 50,60 Q55,55 60,60 M35,45 Q40,40 45,45 M55,45 Q60,40 65,45 M42,30 Q47,25 50,30 Q53,25 58,30'
const FLOWER_PATH = 'M50,50 Q45,40 50,30 Q55,40 50,50 Q60,45 70,50 Q60,55 50,50 Q55,60 50,70 Q45,60 50,50 Q40,55 30,50 Q40,45 50,50 M50,50 L50,80'
const LEAF_PATH = 'M50,50 Q40,40 30,50 Q40,60 50,50 M50,50 Q60,40 70,50 Q60,60 50,50 M50,50 L50,90'
const GRASS_PATH = 'M50,100 Q45,80 40,70 Q42,85 45,100 M50,100 Q50,75 50,60 Q52,80 55,100 M50,100 Q60,80 65,70 Q62,85 60,100'
const BRANCH_PATH = 'M50,50 Q40,45 30,40 M50,50 Q60,45 70,40 M50,50 Q45,35 40,25 M50,50 Q55,35 60,25'

interface NatureElement {
  id: number
  type: 'tree' | 'flower' | 'leaf' | 'grass' | 'branch'
  left: string
  top: string
  size: number
  opacity: number
  delay: number
  duration: number
  rotate: number
}

export default function MonochromeNature() {
  const elements = useMemo<NatureElement[]>(() => {
    const items: NatureElement[] = []
    const types: NatureElement['type'][] = ['tree', 'flower', 'leaf', 'grass', 'branch']

    for (let i = 0; i < 40; i++) {
      items.push({
        id: i,
        type: types[i % types.length],
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 40 + Math.random() * 120,
        opacity: 0.04 + Math.random() * 0.08,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 12,
        rotate: Math.random() * 360,
      })
    }
    return items
  }, [])

  const getPath = (type: NatureElement['type']) => {
    switch (type) {
      case 'tree': return TREE_PATH
      case 'flower': return FLOWER_PATH
      case 'leaf': return LEAF_PATH
      case 'grass': return GRASS_PATH
      case 'branch': return BRANCH_PATH
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {elements.map((el) => (
        <svg
          key={el.id}
          className="absolute animate-sway"
          style={{
            left: el.left,
            top: el.top,
            width: `${el.size}px`,
            height: `${el.size}px`,
            opacity: el.opacity,
            animationDelay: `${el.delay}s`,
            animationDuration: `${el.duration}s`,
            transform: `rotate(${el.rotate}deg)`,
          }}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={getPath(el.type)} />
        </svg>
      ))}
    </div>
  )
}