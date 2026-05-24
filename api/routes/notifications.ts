import { Router, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const notifications = db.prepare(`
    SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(userId)

  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as any

  res.json({ notifications, unreadCount: unreadCount.count })
})

router.put('/read-all', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId)
  res.json({ success: true })
})

router.put('/:id/read', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { id } = req.params

  const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?').get(id, userId)
  if (!notification) {
    res.status(404).json({ error: '通知不存在' })
    return
  }

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id)
  res.json({ success: true })
})

export default router