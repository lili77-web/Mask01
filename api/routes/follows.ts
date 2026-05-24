import { Router, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import db from '../database.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'

const router = Router()

router.post('/:userId', authMiddleware, (req: Request, res: Response) => {
  const followerId = (req as any).userId
  const followedId = req.params.userId

  if (followerId === followedId) {
    res.status(400).json({ error: '不能关注自己' })
    return
  }

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(followedId)
  if (!user) {
    res.status(404).json({ error: '用户不存在' })
    return
  }

  const existing = db.prepare('SELECT * FROM follows WHERE follower_id = ? AND followed_id = ?').get(followerId, followedId)
  if (existing) {
    res.status(400).json({ error: '已经关注过了' })
    return
  }

  db.prepare('INSERT INTO follows (follower_id, followed_id, created_at) VALUES (?, ?, ?)').run(
    followerId, followedId, Date.now()
  )

  res.json({ following: true })
})

router.delete('/:userId', authMiddleware, (req: Request, res: Response) => {
  const followerId = (req as any).userId
  const followedId = req.params.userId

  db.prepare('DELETE FROM follows WHERE follower_id = ? AND followed_id = ?').run(followerId, followedId)
  res.json({ following: false })
})

router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId

  const following = db.prepare(`
    SELECT u.id as user_id, u.nickname, u.avatar, f.created_at as followed_at
    FROM follows f JOIN users u ON f.followed_id = u.id
    WHERE f.follower_id = ?
    ORDER BY f.created_at DESC
  `).all(userId)

  res.json({ following })
})

export default router