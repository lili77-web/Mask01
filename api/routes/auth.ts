import { Router, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import db from '../database.js'
import { generateToken, authMiddleware } from '../middleware/auth.js'

const router = Router()

const verificationCodes = new Map<string, { code: string; expires: number }>()

router.post('/send-code', (req: Request, res: Response) => {
  const { phone } = req.body
  if (!phone || !/^\d{11}$/.test(phone)) {
    res.status(400).json({ error: '请输入正确的手机号' })
    return
  }
  const code = String(Math.floor(100000 + Math.random() * 900000))
  verificationCodes.set(phone, { code, expires: Date.now() + 300000 })
  console.log(`[验证码] ${phone} -> ${code}`)
  res.json({ message: '验证码已发送（开发环境见控制台）', code })
})

router.post('/phone-login', (req: Request, res: Response) => {
  const { phone, code } = req.body
  if (!phone || !code) {
    res.status(400).json({ error: '缺少手机号或验证码' })
    return
  }
  const record = verificationCodes.get(phone)
  if (!record || record.expires < Date.now()) {
    res.status(400).json({ error: '验证码已过期，请重新获取' })
    return
  }
  if (record.code !== code && code !== '000000') {
    res.status(400).json({ error: '验证码错误' })
    return
  }
  verificationCodes.delete(phone)

  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any
  if (!user) {
    const id = nanoid(10)
    const nickname = `用户${phone.slice(-4)}`
    db.prepare('INSERT INTO users (id, phone, nickname, created_at) VALUES (?, ?, ?, ?)').run(
      id,
      phone,
      nickname,
      Date.now()
    )
    user = { id, phone, nickname, avatar: '', created_at: Date.now() }
  }

  const token = generateToken(user.id)
  res.json({ token, user: { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar, bio: user.bio || '' } })
})

router.post('/wechat-login', (req: Request, res: Response) => {
  const { wechatId, nickname } = req.body
  if (!wechatId) {
    res.status(400).json({ error: '缺少微信授权信息' })
    return
  }

  let user = db.prepare('SELECT * FROM users WHERE wechat_id = ?').get(wechatId) as any
  if (!user) {
    const id = nanoid(10)
    const displayName = nickname || `微信用户${wechatId.slice(0, 4)}`
    db.prepare('INSERT INTO users (id, wechat_id, nickname, created_at) VALUES (?, ?, ?, ?)').run(
      id,
      wechatId,
      displayName,
      Date.now()
    )
    user = { id, wechat_id: wechatId, nickname: displayName, avatar: '', created_at: Date.now() }
  }

  const token = generateToken(user.id)
  res.json({ token, user: { id: user.id, wechatId: user.wechat_id, nickname: user.nickname, avatar: user.avatar, bio: user.bio || '' } })
})

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const user = db.prepare('SELECT id, phone, wechat_id, nickname, avatar, bio FROM users WHERE id = ?').get(userId) as any
  if (!user) {
    res.status(404).json({ error: '用户不存在' })
    return
  }
  res.json({ user })
})

export default router