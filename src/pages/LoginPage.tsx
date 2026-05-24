import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import FloatingEmojis from '@/components/FloatingEmojis'

export default function LoginPage() {
  const navigate = useNavigate()
  const { loginByPhone, loginByWechat, sendCode } = useAuthStore()

  const [mode, setMode] = useState<'phone' | 'wechat'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sentCode, setSentCode] = useState('')
  const [wechatId, setWechatId] = useState('')
  const [wechatNick, setWechatNick] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async () => {
    if (!/^\d{11}$/.test(phone)) {
      setError('请输入正确的手机号')
      return
    }
    setError('')
    try {
      const c = await sendCode(phone)
      setSentCode(c)
      setCodeSent(true)
    } catch {
      setError('发送验证码失败')
    }
  }

  const handlePhoneLogin = async () => {
    if (!phone || !code) { setError('请输入手机号和验证码'); return }
    setLoading(true)
    setError('')
    try {
      await loginByPhone(phone, code)
      navigate('/')
    } catch {
      setError('登录失败，请检查验证码')
    } finally {
      setLoading(false)
    }
  }

  const handleWechatLogin = async () => {
    if (!wechatId.trim()) { setError('请输入微信 ID'); return }
    setLoading(true)
    setError('')
    try {
      await loginByWechat(wechatId.trim(), wechatNick.trim() || undefined)
      navigate('/')
    } catch {
      setError('微信登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 relative">
      <FloatingEmojis />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-up" style={{ opacity: 0 }}>
          <h1 className="font-display text-5xl text-white font-bold italic mb-3">Mask01</h1>
          <p className="text-neutral-400 font-body">欢迎回来，你的秘密在这里很安全</p>
        </div>

        <div className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-8 border border-white/[0.05] animate-fade-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
          <div className="flex mb-6 bg-neutral-800/50 rounded-xl p-1">
            <button
              onClick={() => setMode('phone')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-ui transition-all ${
                mode === 'phone' ? 'bg-white text-black' : 'text-neutral-500'
              }`}
            >
              📱 手机号登录
            </button>
            <button
              onClick={() => setMode('wechat')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-ui transition-all ${
                mode === 'wechat' ? 'bg-[#07c160] text-white' : 'text-neutral-500'
              }`}
            >
              💬 微信登录
            </button>
          </div>

          {mode === 'phone' ? (
            <div className="space-y-4">
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.slice(0, 11))}
                  placeholder="请输入手机号"
                  maxLength={11}
                  className="w-full bg-neutral-800/50 rounded-xl px-4 py-3 text-white font-ui placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.slice(0, 6))}
                  placeholder="验证码"
                  maxLength={6}
                  className="flex-1 bg-neutral-800/50 rounded-xl px-4 py-3 text-white font-ui placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none"
                />
                <button
                  onClick={handleSendCode}
                  disabled={codeSent}
                  className="px-4 py-3 rounded-xl text-sm font-ui border border-white/30 text-white hover:bg-white/5 transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  {codeSent ? '已发送' : '获取验证码'}
                </button>
              </div>
              {codeSent && (
                <p className="text-xs text-neutral-500 font-ui text-center">
                  开发模式验证码：<span className="text-white font-bold">{sentCode}</span>（万能验证码：000000）
                </p>
              )}
              <button
                onClick={handlePhoneLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white text-black font-ui font-medium transition-all hover:shadow-[0_0_30px_rgba(212,165,116,0.2)] disabled:opacity-50"
              >
                {loading ? '登录中...' : '登录 / 注册'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={wechatId}
                  onChange={(e) => setWechatId(e.target.value)}
                  placeholder="请输入微信 ID（模拟登录）"
                  className="w-full bg-neutral-800/50 rounded-xl px-4 py-3 text-white font-ui placeholder:text-neutral-500 border border-white/[0.06] focus:border-[#07c160]/30 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={wechatNick}
                  onChange={(e) => setWechatNick(e.target.value)}
                  placeholder="昵称（选填）"
                  className="w-full bg-neutral-800/50 rounded-xl px-4 py-3 text-white font-ui placeholder:text-neutral-500 border border-white/[0.06] focus:border-[#07c160]/30 focus:outline-none"
                />
              </div>
              <button
                onClick={handleWechatLogin}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#07c160] text-white font-ui font-medium transition-all hover:bg-[#06ad56] disabled:opacity-50"
              >
                {loading ? '登录中...' : '微信登录'}
              </button>
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-400 font-ui text-center">{error}</p>
          )}
        </div>

        <div className="text-center mt-6 animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <Link to="/" className="text-neutral-500 hover:text-neutral-400 text-sm font-ui transition-colors">
            ← 先随便看看
          </Link>
        </div>
      </div>
    </div>
  )
}
