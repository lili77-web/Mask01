import { Router, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import db from '../database.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/:whisperId', optionalAuth, (req: Request, res: Response) => {
  const { whisperId } = req.params
  const userId = (req as any).userId || null

  const whisper = db.prepare('SELECT user_id, is_private_response FROM whispers WHERE id = ?').get(whisperId) as any

  if (!whisper) {
    res.status(404).json({ error: '低语不存在' })
    return
  }

  if (whisper.is_private_response && whisper.user_id !== userId) {
    res.json({ comments: [], isPrivate: true })
    return
  }

  const comments = db.prepare(`
    SELECT c.*, u.nickname as user_nickname, u.avatar as user_avatar
    FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.whisper_id = ?
    ORDER BY c.created_at ASC
  `).all(whisperId)

  res.json({ comments, isPrivate: false })
})

router.post('/:whisperId', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { whisperId } = req.params
  const { content } = req.body

  if (!content || !content.trim()) {
    res.status(400).json({ error: '回复内容不能为空' })
    return
  }

  const whisper = db.prepare('SELECT id FROM whispers WHERE id = ?').get(whisperId)
  if (!whisper) {
    res.status(404).json({ error: '低语不存在' })
    return
  }

  const id = nanoid(12)
  const now = Date.now()
  db.prepare('INSERT INTO comments (id, whisper_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)').run(
    id, whisperId, userId, content.trim(), now
  )

  const user = db.prepare('SELECT nickname, avatar FROM users WHERE id = ?').get(userId) as any
  res.status(201).json({
    comment: {
      id,
      whisper_id: whisperId,
      user_id: userId,
      user_nickname: user.nickname,
      user_avatar: user.avatar,
      content: content.trim(),
      created_at: now,
    },
  })
})

export default router