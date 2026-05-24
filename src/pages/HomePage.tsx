import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Whisper } from '@/types'
import api from '@/lib/api'
import Plumber from '@/components/Plumber'

export default function HomePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [randomWhisper, setRandomWhisper] = useState<Whisper | null>(null)
  const [fadeKey, setFadeKey] = useState(0)
  const [whispers, setWhispers] = useState<Whisper[]>([])
  const [showMenu, setShowMenu] = useState(false)
  const [showPlumberSettings, setShowPlumberSettings] = useState(false)

  useEffect(() => {
    api.get('/whispers?sort=latest').then(({ data }) => {
      setWhispers(data.whispers || [])
    }).catch(() => {
      setWhispers([])
    })
  }, [])

  const pickRandom = useCallback(() => {
    if (whispers.length === 0) return
    const idx = Math.floor(Math.random() * whispers.length)
    setFadeKey((k) => k + 1)
    setTimeout(() => setRandomWhisper(whispers[idx]), 400)
  }, [whispers])

  useEffect(() => { pickRandom() }, [pickRandom])
  useEffect(() => {
    const t = setInterval(pickRandom, 8000)
    return () => clearInterval(t)
  }, [pickRandom])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-12">
      {user && (
        <Plumber
          className="fixed bottom-4 right-4 z-40"
          onSettingsClick={() => setShowPlumberSettings(!showPlumberSettings)}
        />
      )}
      {user && (
        <div className="absolute top-4 right-4 z-20">
          <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/[0.04] transition-colors">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-ui">
                {user.nickname.charAt(0)}
              </span>
            )}
            <span className="text-sm text-neutral-400 font-ui">{user.nickname}</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 bg-neutral-900 border border-white/[0.08] rounded-xl p-2 shadow-xl min-w-[140px]">
              <Link to="/profile" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 rounded-lg text-sm text-neutral-400 hover:bg-white/[0.04] font-ui">⚙️ 账号设置</Link>
              <Link to="/friends" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 rounded-lg text-sm text-neutral-400 hover:bg-white/[0.04] font-ui">👥 好友</Link>
              <Link to="/rooms" onClick={() => setShowMenu(false)} className="block px-4 py-2.5 rounded-lg text-sm text-neutral-400 hover:bg-white/[0.04] font-ui">🏠 话题房间</Link>
              <button onClick={() => { logout(); setShowMenu(false) }} className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-white/[0.04] font-ui">退出登录</button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center max-w-lg w-full">
        <div className="flex items-center gap-6 mb-12 animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <div className="text-center">
            <h1 className="font-display text-6xl md:text-7xl font-bold text-white tracking-wide mb-4 italic">Mask01</h1>
            <p className="text-neutral-400 text-lg font-body tracking-wider">在这里，卸下你的面具</p>
          </div>
        </div>

        {user ? (
          <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
            <button onClick={() => navigate('/write')} className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-ui font-medium text-lg transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,165,116,0.3)] hover:scale-[1.02]">
              <span className="text-xl">🕯️</span><span>猛猛的讲出来🤪👹💩</span>
            </button>
            <button onClick={() => navigate('/feed')} className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-white/30 text-white font-ui font-medium text-lg transition-all duration-500 hover:bg-white/[0.06] hover:border-white/50 hover:shadow-[0_0_30px_rgba(212,165,116,0.1)] hover:scale-[1.02]">
              <span className="text-xl">👂</span><span>低语海湾</span>
            </button>
            <button onClick={() => navigate('/friends')} className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-white/[0.08] text-neutral-400 font-ui font-medium text-lg transition-all duration-500 hover:bg-white/[0.03] hover:border-white/[0.15] hover:scale-[1.02]">
              <span className="text-xl">👥</span><span>我的好友</span>
            </button>
            <button onClick={() => navigate('/rooms')} className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-white/[0.08] text-neutral-400 font-ui font-medium text-lg transition-all duration-500 hover:bg-white/[0.03] hover:border-white/[0.15] hover:scale-[1.02]">
              <span className="text-xl">🏠</span><span>话题房间</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
            <button onClick={() => navigate('/login')} className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-ui font-medium text-lg transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,165,116,0.3)] hover:scale-[1.02]">
              <span className="text-xl">🕯️</span><span>登录 / 注册</span>
            </button>
            <button onClick={() => navigate('/feed')} className="group flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-white/30 text-white font-ui font-medium text-lg transition-all duration-500 hover:bg-white/[0.06] hover:border-white/50 hover:shadow-[0_0_30px_rgba(212,165,116,0.1)] hover:scale-[1.02]">
              <span className="text-xl">👂</span><span>先随便看看</span>
            </button>
          </div>
        )}
      </div>

      {randomWhisper && (
        <div className="w-full max-w-lg mt-auto pb-8 animate-fade-up" style={{ animationDelay: '0.7s', opacity: 0 }}>
          <div key={fadeKey} className="animate-fade-in">
            <div className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 border border-white/[0.04]">
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 mb-3 font-ui">
                {randomWhisper.user_nickname} · {randomWhisper.hasAiReply ? 'AI ✨' : ''}
              </span>
              <p className="text-white text-base leading-relaxed italic">
                &ldquo;{randomWhisper.content?.slice(0, 120)}{(randomWhisper.content?.length || 0) > 120 ? '...' : ''}&rdquo;
              </p>
              <Link to={`/whisper/${randomWhisper.id}`} className="inline-block mt-3 text-xs text-white/60 hover:text-white transition-colors font-ui">
                倾听这条低语 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
