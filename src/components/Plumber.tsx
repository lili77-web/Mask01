import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/store/useAuthStore'

const PLUMBER_MESSAGES = [
  '你好呀！我是你的小助手 🎭',
  '有什么想说的都可以告诉我哦',
  '今天过得怎么样？',
  '记得要照顾好自己 🌙',
  '你的秘密在这里很安全',
  '想聊聊吗？我随时在',
  '放下伪装，做真实的自己',
  '每一个故事都值得被倾听',
  '有时候倾诉就是最好的疗愈',
  '你并不孤单，我在这里',
  '把烦恼都留在这里吧',
  '今天的你也很棒！',
  '深呼吸，一切都会好起来的',
  '这里是你的安全港湾 🏠',
  '面具之下，是更美的你',
]

export type RepairWorkType =
  | 'idle'
  | 'wrench'
  | 'hammer'
  | 'wipe'
  | 'flashlight'
  | 'plunger'
  | 'valve'
  | 'cut'
  | 'sealant'

export interface RepairWork {
  type: RepairWorkType
  name: string
  description: string
  duration: number
}

export const REPAIR_WORKS: RepairWork[] = [
  { type: 'wrench', name: '拧螺丝', description: '正在拧紧水管螺丝...', duration: 8000 },
  { type: 'hammer', name: '敲敲打打', description: '咚咚咚～敲敲打打修水管', duration: 6000 },
  { type: 'wipe', name: '擦拭清洁', description: '把水管擦得亮晶晶～', duration: 7000 },
  { type: 'flashlight', name: '检查漏水源', description: '拿手电筒找问题...', duration: 5000 },
  { type: 'plunger', name: '通马桶', description: '一、二、三！通了通了！', duration: 8000 },
  { type: 'valve', name: '调节阀门', description: '拧拧阀门调调水压', duration: 5000 },
  { type: 'cut', name: '切割管道', description: '精准切割，完美对接！', duration: 7000 },
  { type: 'sealant', name: '涂抹密封胶', description: '涂涂密封胶，水管不漏水～', duration: 6000 },
]

const PLUMBER_COLORS = {
  red: { cap: '#E52521', capDark: '#B71C1C', overalls: '#0D47A1', overallsDark: '#0A36A1', skin: '#FFCC99', skinDark: '#E5A875', mustache: '#5D4037', shirt: '#E52521', pipe: '#4CAF50', pipeDark: '#388E3C' },
  blue: { cap: '#1565C0', capDark: '#0D47A1', overalls: '#E52521', overallsDark: '#B71C1C', skin: '#FFCC99', skinDark: '#E5A875', mustache: '#5D4037', shirt: '#1565C0', pipe: '#4CAF50', pipeDark: '#388E3C' },
  green: { cap: '#2E7D32', capDark: '#1B5E20', overalls: '#E52521', overallsDark: '#B71C1C', skin: '#FFCC99', skinDark: '#E5A875', mustache: '#5D4037', shirt: '#2E7D32', pipe: '#4CAF50', pipeDark: '#388E3C' },
  yellow: { cap: '#F9A825', capDark: '#F57F17', overalls: '#0D47A1', overallsDark: '#0A36A1', skin: '#FFCC99', skinDark: '#E5A875', mustache: '#5D4037', shirt: '#F9A825', pipe: '#4CAF50', pipeDark: '#388E3C' },
  purple: { cap: '#7B1FA2', capDark: '#4A148C', overalls: '#E52521', overallsDark: '#B71C1C', skin: '#FFCC99', skinDark: '#E5A875', mustache: '#5D4037', shirt: '#7B1FA2', pipe: '#4CAF50', pipeDark: '#388E3C' },
  orange: { cap: '#E65100', capDark: '#BF360C', overalls: '#0D47A1', overallsDark: '#0A36A1', skin: '#FFCC99', skinDark: '#E5A875', mustache: '#5D4037', shirt: '#E65100', pipe: '#4CAF50', pipeDark: '#388E3C' },
}

interface PlumberProps {
  className?: string
  onSettingsClick?: () => void
}

export default function Plumber({ className = '', onSettingsClick }: PlumberProps) {
  const { user, updatePlumberName, updatePlumberColor } = useAuthStore()
  const [showBubble, setShowBubble] = useState(false)
  const [currentMessage, setCurrentMessage] = useState('')
  const [showEditName, setShowEditName] = useState(false)
  const [tempName, setTempName] = useState('')

  // Work state
  const [currentWork, setCurrentWork] = useState<RepairWork | null>(null)
  const [isWorking, setIsWorking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [workFrame, setWorkFrame] = useState(0)
  const [showWorkBubble, setShowWorkBubble] = useState(false)

  const startTimeRef = useRef<number>(0)
  const workDurationRef = useRef<number>(0)
  const animationRef = useRef<number>()

  const plumberName = user?.plumberName || 'Mario'
  const plumberColor = user?.plumberColor || 'red'
  const colors = PLUMBER_COLORS[plumberColor as keyof typeof PLUMBER_COLORS] || PLUMBER_COLORS.red

  // Work animation frame
  useEffect(() => {
    if (!isWorking) return
    const frameInterval = setInterval(() => {
      setWorkFrame((f) => (f + 1) % 8)
    }, 120)
    return () => clearInterval(frameInterval)
  }, [isWorking])

  // Start new work
  const startWork = useCallback(() => {
    const work = REPAIR_WORKS[Math.floor(Math.random() * REPAIR_WORKS.length)]
    setCurrentWork(work)
    setIsWorking(true)
    setShowWorkBubble(true)
    startTimeRef.current = Date.now()
    workDurationRef.current = work.duration
    setProgress(0)
    setWorkFrame(0)
  }, [])

  // End work
  const endWork = useCallback(() => {
    setIsWorking(false)
    setShowWorkBubble(false)
    setProgress(100)
    // 30 minute cycle - rest for 30 seconds then start next work
    const nextWorkDelay = 30 * 1000 // 30 seconds rest
    setTimeout(() => {
      startWork()
    }, nextWorkDelay)
  }, [startWork])

  // Initialize work cycle
  useEffect(() => {
    const initTimer = setTimeout(() => {
      startWork()
    }, 1500)
    return () => clearTimeout(initTimer)
  }, [])

  // Progress animation
  useEffect(() => {
    if (!isWorking || !currentWork) return

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const newProgress = Math.min((elapsed / workDurationRef.current) * 100, 100)
      setProgress(newProgress)

      if (elapsed >= workDurationRef.current) {
        endWork()
      } else {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isWorking, currentWork, endWork])

  // Random message every hour
  const showRandomMessage = useCallback(() => {
    const msg = PLUMBER_MESSAGES[Math.floor(Math.random() * PLUMBER_MESSAGES.length)]
    setCurrentMessage(msg)
    setShowBubble(true)
    setTimeout(() => setShowBubble(false), 8000)
  }, [])

  useEffect(() => {
    const lastMessageTime = user?.lastPlumberMessageTime || 0
    const now = Date.now()
    const hourInMs = 60 * 60 * 1000

    if (now - lastMessageTime >= hourInMs) {
      showRandomMessage()
      useAuthStore.getState().updatePlumberMessageTime(now)
    }

    const timeToNext = Math.max(hourInMs - (now - lastMessageTime), 0)
    const timer = setTimeout(() => {
      showRandomMessage()
      useAuthStore.getState().updatePlumberMessageTime(Date.now())
    }, timeToNext)

    return () => clearTimeout(timer)
  }, [])

  const handleNameSave = () => {
    if (tempName.trim()) {
      updatePlumberName(tempName.trim())
    }
    setShowEditName(false)
  }

  const handleColorChange = (color: keyof typeof PLUMBER_COLORS) => {
    updatePlumberColor(color)
  }

  // Calculate arm animation offset based on work type
  const getArmOffset = () => {
    if (!isWorking) return { left: 0, right: 0 }
    const offset = Math.sin(workFrame * Math.PI / 4) * 6
    switch (currentWork?.type) {
      case 'wrench':
      case 'valve':
        return { left: offset, right: -offset }
      case 'hammer':
        return { left: 0, right: offset }
      case 'wipe':
        return { left: offset, right: offset }
      case 'flashlight':
        return { left: -4, right: 8 }
      case 'plunger':
        return { left: -offset * 0.5, right: -offset * 0.5 }
      case 'cut':
        return { left: offset, right: -offset }
      case 'sealant':
        return { left: offset, right: offset * 0.5 }
      default:
        return { left: offset, right: -offset }
    }
  }

  const armOffsets = getArmOffset()

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-36 h-48 cursor-pointer group">
        {/* Work bubble */}
        {showWorkBubble && currentWork && (
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-yellow-100 rounded-xl px-3 py-2 shadow-lg z-50 animate-fade-in whitespace-nowrap max-w-[160px]">
            <div className="text-xs text-yellow-800 font-medium text-center">
              🔧 {currentWork.description}
            </div>
            {/* Progress bar */}
            <div className="mt-1 h-1.5 bg-yellow-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-500 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-6 border-transparent border-t-yellow-100" />
          </div>
        )}

        {/* Message bubble */}
        {showBubble && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow-lg z-50 animate-fade-in whitespace-nowrap">
            <div className="text-sm text-gray-700 font-medium">{currentMessage}</div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
          </div>
        )}

        {/* Name tag */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 rounded-lg px-3 py-1">
          <span className="text-xs text-white font-medium">{plumberName}</span>
        </div>

        {/* Work status */}
        <div className="absolute -top-8 right-0 bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
          {isWorking ? '🔧工作中' : '💤休息'}
        </div>

        {/* Pixel Art Plumber */}
        <div className="relative w-full h-full" style={{ imageRendering: 'pixelated' }}>
          <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-lg" style={{ imageRendering: 'pixelated' }}>
            <g transform="translate(32, 36)">
              {/* Pipe */}
              <rect x="-32" y="30" width="64" height="8" fill={colors.pipe} />
              <rect x="-32" y="30" width="64" height="3" fill={colors.pipeDark} />

              {/* Work tools (shown when working) */}
              {isWorking && currentWork && (
                <>
                  {/* Wrench */}
                  {(currentWork.type === 'wrench' || currentWork.type === 'valve') && (
                    <g transform={`translate(18, ${-4 + armOffsets.right}) rotate(${workFrame * 15})`}>
                      <rect x="0" y="0" width="10" height="3" fill="#9E9E9E" />
                      <rect x="8" y="-2" width="4" height="7" fill="#757575" />
                      <rect x="10" y="1" width="4" height="1" fill="#616161" />
                    </g>
                  )}
                  {/* Hammer */}
                  {currentWork.type === 'hammer' && (
                    <g transform={`translate(16, ${-6 + armOffsets.right}) rotate(${workFrame * 20 - 40})`}>
                      <rect x="0" y="0" width="12" height="3" fill="#8D6E63" />
                      <rect x="-2" y="-4" width="6" height="6" fill="#616161" />
                    </g>
                  )}
                  {/* Plunger */}
                  {currentWork.type === 'plunger' && (
                    <g transform={`translate(14, ${-8 + Math.abs(Math.sin(workFrame * 0.5)) * -4})`}>
                      <rect x="0" y="0" width="3" height="10" fill="#8D6E63" />
                      <ellipse cx="1.5" cy="10" rx="6" ry="4" fill="#D32F2F" />
                    </g>
                  )}
                  {/* Flashlight */}
                  {currentWork.type === 'flashlight' && (
                    <g transform={`translate(16, ${-4}) rotate(${-20 + workFrame * 5})`}>
                      <rect x="0" y="0" width="10" height="4" fill="#FFD54F" />
                      <rect x="-4" y="0" width="4" height="4" fill="#FFC107" />
                    </g>
                  )}
                  {/* Cut saw */}
                  {currentWork.type === 'cut' && (
                    <g transform={`translate(16, ${-4 + armOffsets.right}) rotate(${-30 + workFrame * 8})`}>
                      <rect x="0" y="0" width="10" height="2" fill="#9E9E9E" />
                      <rect x="2" y="-2" width="1" height="6" fill="#757575" />
                      <rect x="5" y="-2" width="1" height="6" fill="#757575" />
                    </g>
                  )}
                  {/* Sealant bottle */}
                  {currentWork.type === 'sealant' && (
                    <g transform={`translate(16, ${-2 + armOffsets.right})`}>
                      <rect x="0" y="0" width="6" height="10" fill="#8BC34A" rx="1" />
                      <rect x="2" y="-2" width="2" height="3" fill="#689F38" />
                    </g>
                  )}
                  {/* Wipe cloth */}
                  {currentWork.type === 'wipe' && (
                    <g transform={`translate(16, ${-4 + armOffsets.right})`}>
                      <rect x="0" y="0" width="8" height="5" fill="#B3E5FC" rx="1" />
                      <rect x="2" y="1" width="4" height="3" fill="#E1F5FE" />
                    </g>
                  )}
                </>
              )}

              {/* Left leg */}
              <rect x="-8" y="16" width="6" height="14" fill={colors.overalls} />
              <rect x="-8" y="16" width="6" height="3" fill={colors.overallsDark} />
              <rect x="-10" y="28" width="8" height="4" fill="#5D4037" />
              <rect x="-8" y="28" width="4" height="2" fill="#8D6E63" />

              {/* Right leg */}
              <rect x="2" y="16" width="6" height="14" fill={colors.overalls} />
              <rect x="2" y="16" width="6" height="3" fill={colors.overallsDark} />
              <rect x="0" y="28" width="8" height="4" fill="#5D4037" />
              <rect x="2" y="28" width="4" height="2" fill="#8D6E63" />

              {/* Body */}
              <rect x="-10" y="0" width="20" height="18" fill={colors.shirt} />
              <rect x="-8" y="2" width="16" height="14" fill={colors.cap} opacity="0.3" />

              {/* Overalls */}
              <rect x="-8" y="0" width="4" height="12" fill={colors.overalls} />
              <rect x="4" y="0" width="4" height="12" fill={colors.overalls} />
              <rect x="-6" y="4" width="2" height="2" fill="#FFD700" />
              <rect x="4" y="4" width="2" height="2" fill="#FFD700" />

              {/* Left arm */}
              <rect x="-16" y="2" width="6" height="12" fill={colors.shirt} />
              <rect x="-15" y="2" width="4" height="10" fill={colors.skin} />
              <rect x="-16" y="12" width="6" height="4" fill="#FFFFFF" />
              <rect x="-15" y="13" width="4" height="2" fill="#E0E0E0" />

              {/* Right arm - animated */}
              <rect x="10" y={2 + armOffsets.right} width="6" height="12" fill={colors.shirt} />
              <rect x="11" y={2 + armOffsets.right} width="4" height="10" fill={colors.skin} />
              <rect x="10" y={12 + armOffsets.right} width="6" height="4" fill="#FFFFFF" />
              <rect x="11" y={13 + armOffsets.right} width="4" height="2" fill="#E0E0E0" />

              {/* Head */}
              <rect x="-8" y="-18" width="16" height="20" fill={colors.skin} />
              <rect x="-6" y="-16" width="12" height="16" fill={colors.skinDark} opacity="0.3" />

              {/* Cap */}
              <rect x="-10" y="-24" width="20" height="8" fill={colors.cap} />
              <rect x="-8" y="-22" width="16" height="4" fill={colors.capDark} opacity="0.4" />
              <rect x="-12" y="-18" width="24" height="4" fill={colors.cap} />
              <rect x="-10" y="-16" width="20" height="2" fill={colors.capDark} opacity="0.4" />
              <rect x="-2" y="-22" width="4" height="4" fill="#FFD700" />

              {/* Eyes - blink occasionally */}
              <rect x="-6" y="-12" width="4" height="4" fill="white" />
              <rect x="-5" y="-11" width="2" height="2" fill="#222" />
              <rect x="2" y="-12" width="4" height="4" fill="white" />
              <rect x="3" y="-11" width="2" height="2" fill="#222" />

              {/* Mustache */}
              <rect x="-8" y="-6" width="16" height="4" fill={colors.mustache} />
              <rect x="-6" y="-7" width="12" height="2" fill={colors.mustache} />
              <rect x="-4" y="-8" width="8" height="2" fill={colors.mustache} opacity="0.7" />

              {/* Nose */}
              <rect x="-2" y="-6" width="4" height="3" fill={colors.skinDark} />
              <rect x="-1" y="-5" width="2" height="1" fill="#E5A875" />

              {/* Mouth - working animation */}
              {isWorking && (
                <rect x="-2" y="-3" width="4" height="3" fill="#CC8875" />
              )}

              {/* Ears */}
              <rect x="-10" y="-10" width="2" height="4" fill={colors.skin} />
              <rect x="8" y="-10" width="2" height="4" fill={colors.skin} />
            </g>

            {/* Sparkles when working */}
            {isWorking && (
              <g fill="#FFE082" opacity="0.8">
                <rect x="12" y="20" width="2" height="2">
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.5s" repeatCount="indefinite" />
                </rect>
                <rect x="52" y="24" width="2" height="2">
                  <animate attributeName="opacity" values="0.4;0.9;0.4" dur="0.6s" repeatCount="indefinite" />
                </rect>
              </g>
            )}

            {/* Done sparkles */}
            {!isWorking && (
              <g fill="#4CAF50" opacity="0.7">
                <rect x="14" y="22" width="3" height="3">
                  <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
                </rect>
                <rect x="50" y="20" width="2" height="2">
                  <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                </rect>
                <rect x="30" y="16" width="2" height="2">
                  <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
                </rect>
              </g>
            )}
          </svg>

          {/* Settings button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowEditName(!showEditName)
            }}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-30"
          >
            <span className="text-sm">⚙️</span>
          </button>
        </div>

        {/* Settings popup */}
        {showEditName && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-neutral-900 border border-white/10 rounded-xl p-4 shadow-xl z-50 w-48">
            <h4 className="text-sm font-medium text-white mb-3">🎮 自定义水管工</h4>

            <div className="mb-3">
              <label className="text-xs text-neutral-400 block mb-1">名字</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder={plumberName}
                className="w-full bg-neutral-800 rounded-lg px-3 py-2 text-white text-sm border border-white/10 focus:border-white/30 focus:outline-none"
              />
              <button onClick={handleNameSave} className="mt-2 w-full py-1.5 bg-white text-black text-sm rounded-lg font-medium hover:bg-neutral-200 transition-colors">
                保存名字
              </button>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-2">颜色主题</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(PLUMBER_COLORS) as Array<keyof typeof PLUMBER_COLORS>).map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      plumberColor === color ? 'border-white scale-110' : 'border-transparent hover:border-white/30'
                    }`}
                    style={{ backgroundColor: PLUMBER_COLORS[color].cap }}
                  />
                ))}
              </div>
            </div>

            <button onClick={() => setShowEditName(false)} className="mt-3 w-full py-2 text-sm text-neutral-400 hover:text-white transition-colors">
              关闭
            </button>
          </div>
        )}
      </div>
    </div>
  )
}