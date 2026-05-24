import { Router, Request, Response } from 'express'
import db from '../database.js'
import { nanoid } from 'nanoid'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId

  const favorites = db.prepare(`
    SELECT w.*, u.nickname as user_nickname, u.avatar as user_avatar,
      i.name as identity_name, i.emoji as identity_emoji, i.color as identity_color,
      (SELECT reaction_type FROM user_reactions WHERE user_id = ? AND whisper_id = w.id) as my_reaction,
      EXISTS(SELECT 1 FROM ai_replies WHERE whisper_id = w.id) as has_ai_reply,
      f.created_at as favorited_at
    FROM favorites f
    JOIN whispers w ON f.whisper_id = w.id
    JOIN users u ON w.user_id = u.id
    LEFT JOIN identities i ON w.identity_id = i.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `).all(userId, userId) as any[]

  const parsed = favorites.map((w) => ({
    ...w,
    images: JSON.parse(w.images || '[]'),
    myReaction: w.my_reaction || null,
    hasAiReply: !!w.has_ai_reply,
    favoritedAt: w.favorited_at,
    identity: w.identity_id ? { id: w.identity_id, name: w.identity_name, emoji: w.identity_emoji, color: w.identity_color } : null,
  }))

  res.json({ favorites: parsed })
})

router.post('/:whisperId', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { whisperId } = req.params

  const whisper = db.prepare('SELECT id FROM whispers WHERE id = ?').get(whisperId)
  if (!whisper) {
    return res.status(404).json({ error: '低语不存在' })
  }

  const existing = db.prepare('SELECT * FROM favorites WHERE user_id = ? AND whisper_id = ?').get(userId, whisperId)
  if (existing) {
    return res.status(400).json({ error: '已经收藏过了' })
  }

  db.prepare('INSERT INTO favorites (user_id, whisper_id, created_at) VALUES (?, ?, ?)').run(userId, whisperId, Date.now())
  res.json({ success: true })
})

router.delete('/:whisperId', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { whisperId } = req.params

  const result = db.prepare('DELETE FROM favorites WHERE user_id = ? AND whisper_id = ?').run(userId, whisperId)
  if (result.changes === 0) {
    return res.status(404).json({ error: '收藏不存在' })
  }
  res.json({ success: true })
})

export default router