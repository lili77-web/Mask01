import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/api'
import Plumber from '@/components/Plumber'
import LoadingSpinner from '@/components/LoadingSpinner'

const PLUMBER_COLORS: Record<string, { cap: string; capDark: string; overalls: string; overallsDark: string; shirt: string }> = {
  red: { cap: '#E52521', capDark: '#B71C1C', overalls: '#0D47A1', overallsDark: '#0A36A1', shirt: '#E52521' },
  blue: { cap: '#1565C0', capDark: '#0D47A1', overalls: '#E52521', overallsDark: '#B71C1C', shirt: '#1565C0' },
  green: { cap: '#2E7D32', capDark: '#1B5E20', overalls: '#E52521', overallsDark: '#B71C1C', shirt: '#2E7D32' },
  yellow: { cap: '#F9A825', capDark: '#F57F17', overalls: '#0D47A1', overallsDark: '#0A36A1', shirt: '#F9A825' },
  purple: { cap: '#7B1FA2', capDark: '#4A148C', overalls: '#E52521', overallsDark: '#B71C1C', shirt: '#7B1FA2' },
  orange: { cap: '#E65100', capDark: '#BF360C', overalls: '#0D47A1', overallsDark: '#0A36A1', shirt: '#E65100' },
}

export default function ProfilePage() {
  const { user, token } = useAuthStore()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const theme = useAuthStore((s) => s.theme)
  const toggleTheme = useAuthStore((s) => s.toggleTheme)

  const [nickname, setNickname] = useState(user?.nickname || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [nightTime, setNightTime] = useState(user?.night_notification_time || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [plumberName, setPlumberName] = useState(user?.plumberName || 'Mario')
  const [plumberColor, setPlumberColor] = useState(user?.plumberColor || 'red')
  const [showPlumberPreview, setShowPlumberPreview] = useState(false)

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  useEffect(() => {
    if (user) {
      api.get(`/profile/${user.id}`).then(({ data }) => {
        setNickname(data.user.nickname)
        setBio(data.user.bio || '')
        setAvatar(data.user.avatar || '')
        setNightTime(data.user.night_notification_time || '')
      }).catch(() => {})
    }
  }, [user])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      const { data } = await api.put('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAvatar(data.avatar)
      const updated = { ...user!, avatar: data.avatar }
      localStorage.setItem('mask01_user', JSON.stringify(updated))
      useAuthStore.setState({ user: updated })
      setMessage('头像已更新')
      setTimeout(() => setMessage(''), 2000)
    } catch {
      setMessage('上传失败')
      setTimeout(() => setMessage(''), 2000)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/profile/bio', { nickname, bio })
      if (nightTime !== user?.night_notification_time) {
        await api.put('/profile/notification-time', { time: nightTime })
      }
      const updated = {
        ...user!,
        nickname: data.user.nickname,
        bio: data.user.bio,
        night_notification_time: nightTime,
        plumberName,
        plumberColor,
      }
      localStorage.setItem('mask01_user', JSON.stringify(updated))
      useAuthStore.setState({ user: updated } as any)
      useAuthStore.getState().updatePlumberName(plumberName)
      useAuthStore.getState().updatePlumberColor(plumberColor)
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 2000)
    } catch {
      setMessage('保存失败')
      setTimeout(() => setMessage(''), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-400 transition-colors font-ui text-sm">← 返回</Link>
          {message && <span className="text-xs text-white font-ui">{message}</span>}
        </div>

        <div className="animate-fade-up" style={{ opacity: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl text-white font-bold italic mb-8">账号设置</h1>

          <div className="flex flex-col items-center mb-10">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {avatar ? (
                <img src={avatar} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-white/30" />
              ) : (
                <span className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl text-white">
                  {nickname?.charAt(0) || '?'}
                </span>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white font-ui">更换</span>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <p className="text-xs text-neutral-500 font-ui mt-2">点击头像更换</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs text-neutral-500 font-ui mb-2 block tracking-widest uppercase">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                className="w-full bg-neutral-900/60 rounded-xl px-4 py-3 text-white font-ui placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500 font-ui mb-2 block tracking-widest uppercase">个性签名</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 100))}
                placeholder="写一句话介绍自己..."
                maxLength={100}
                rows={3}
                className="w-full bg-neutral-900/60 rounded-xl px-4 py-3 text-white font-body placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none resize-none"
              />
              <p className="text-xs text-neutral-500 font-ui text-right mt-1">{bio.length}/100</p>
            </div>

            <div>
              <label className="text-xs text-neutral-500 font-ui mb-2 block tracking-widest uppercase">晚安通知时间</label>
              <input
                type="time"
                value={nightTime}
                onChange={(e) => setNightTime(e.target.value)}
                className="w-full bg-neutral-900/60 rounded-xl px-4 py-3 text-white font-ui border border-white/[0.06] focus:border-white/30 focus:outline-none"
              />
              <p className="text-xs text-neutral-500 font-ui mt-1">设置时间后，每天会在此时收到一条晚安问候（留空则不开启）</p>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-xs text-neutral-500 font-ui tracking-widest uppercase">外观主题</p>
                <p className="text-xs text-neutral-600 font-ui mt-1">{theme === 'dark' ? '深色模式' : '浅色模式'}</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-all ${theme === 'dark' ? 'bg-white' : 'bg-neutral-600'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-neutral-900 shadow transition-all ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`}>
                  <span className="flex items-center justify-center h-full text-xs">{theme === 'dark' ? '🌙' : '☀️'}</span>
                </div>
              </button>
            </div>

            {/* Plumber Settings */}
            <div className="border-t border-white/5 pt-5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs text-neutral-500 font-ui tracking-widest uppercase">🎮 水管工宠物</label>
                <button
                  onClick={() => setShowPlumberPreview(!showPlumberPreview)}
                  className="text-xs text-white/60 hover:text-white font-ui transition-colors"
                >
                  {showPlumberPreview ? '隐藏预览' : '显示预览'}
                </button>
              </div>

              {/* Plumber Preview */}
              {showPlumberPreview && (
                <div className="flex justify-center mb-4">
                  <div className="w-28 h-36">
                    <Plumber className="w-full h-full" />
                  </div>
                </div>
              )}

              {/* Plumber Name */}
              <div className="mb-3">
                <input
                  type="text"
                  value={plumberName}
                  onChange={(e) => setPlumberName(e.target.value)}
                  placeholder="水管工名字"
                  maxLength={10}
                  className="w-full bg-neutral-900/60 rounded-xl px-4 py-3 text-white font-ui placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none"
                />
              </div>

              {/* Plumber Color Picker */}
              <div>
                <label className="text-xs text-neutral-500 font-ui mb-2 block">选择颜色</label>
                <div className="grid grid-cols-6 gap-2">
                  {Object.entries(PLUMBER_COLORS).map(([color, colors]) => (
                    <button
                      key={color}
                      onClick={() => setPlumberColor(color)}
                      className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                        plumberColor === color ? 'border-white scale-105' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: colors.cap }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-white text-black font-ui font-medium transition-all hover:shadow-[0_0_30px_rgba(212,165,116,0.2)] disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  保存中...
                </span>
              ) : (
                '保存设置'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}