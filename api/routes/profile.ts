import { Router, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', '..', 'uploads')

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.png'
      cb(null, `avatar_${nanoid(10)}${ext}`)
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('仅支持图片格式'))
    }
  },
})

const router = Router()

router.get('/:userId', (req: Request, res: Response) => {
  const user = db.prepare('SELECT id, nickname, avatar, bio FROM users WHERE id = ?').get(req.params.userId) as any
  if (!user) {
    res.status(404).json({ error: '用户不存在' })
    return
  }

  const whisperCount = db.prepare('SELECT COUNT(*) as count FROM whispers WHERE user_id = ?').get(req.params.userId) as any
  const followersCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE followed_id = ?').get(req.params.userId) as any
  const followingCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(req.params.userId) as any
  const favoritesCount = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE user_id = ?').get(req.params.userId) as any

  res.json({
    user: {
      ...user,
      whisper_count: whisperCount?.count || 0,
      followers_count: followersCount?.count || 0,
      following_count: followingCount?.count || 0,
      favorites_count: favoritesCount?.count || 0,
    },
  })
})

router.put('/avatar', authMiddleware, avatarUpload.single('avatar'), (req: Request, res: Response) => {
  const userId = (req as any).userId
  if (!req.file) {
    res.status(400).json({ error: '请上传头像图片' })
    return
  }
  const avatarUrl = `/uploads/${req.file.filename}`
  db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(avatarUrl, userId)
  res.json({ avatar: avatarUrl })
})

router.put('/bio', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { bio, nickname } = req.body

  if (nickname !== undefined) {
    db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(nickname, userId)
  }
  if (bio !== undefined) {
    db.prepare('UPDATE users SET bio = ? WHERE id = ?').run(bio, userId)
  }

  const user = db.prepare('SELECT id, phone, wechat_id, nickname, avatar, bio FROM users WHERE id = ?').get(userId) as any
  res.json({ user })
})

router.put('/notification-time', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { time } = req.body

  db.prepare('UPDATE users SET night_notification_time = ? WHERE id = ?').run(time || null, userId)
  res.json({ success: true, night_notification_time: time || null })
})

export default router