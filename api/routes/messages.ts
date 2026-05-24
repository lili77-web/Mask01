import { Router, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/:friendId', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { friendId } = req.params

  const areFriends = db.prepare(`
    SELECT * FROM friends WHERE status = 'accepted'
    AND ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
  `).get(userId, friendId, friendId, userId)

  if (!areFriends) {
    res.status(403).json({ error: '还不是好友' })
    return
  }

  const readInfo = db.prepare('SELECT last_read_message_id FROM message_reads WHERE user_id = ? AND friend_id = ?').get(userId, friendId) as any

  const messages = db.prepare(`
    SELECT * FROM messages
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC LIMIT 100
  `).all(userId, friendId, friendId, userId) as any[]

  const withReadFlag = messages.map((m) => ({
    ...m,
    is_read: readInfo ? m.id === readInfo.last_read_message_id || m.created_at < Date.now() - 86400000 : false,
  }))

  res.json({ messages: withReadFlag })
})

router.post('/:friendId', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { friendId } = req.params
  const { content } = req.body

  if (!content || !content.trim()) {
    res.status(400).json({ error: '消息不能为空' })
    return
  }

  const areFriends = db.prepare(`
    SELECT * FROM friends WHERE status = 'accepted'
    AND ((user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?))
  `).get(userId, friendId, friendId, userId)

  if (!areFriends) {
    res.status(403).json({ error: '还不是好友' })
    return
  }

  const id = nanoid(12)
  db.prepare('INSERT INTO messages (id, sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?, ?)').run(
    id, userId, friendId, content.trim(), Date.now()
  )

  res.status(201).json({ message: { id, sender_id: userId, receiver_id: friendId, content: content.trim(), created_at: Date.now() } })
})

router.post('/:friendId/read', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { friendId } = req.params

  const lastMessage = db.prepare(`
    SELECT id FROM messages
    WHERE sender_id = ? AND receiver_id = ?
    ORDER BY created_at DESC LIMIT 1
  `).get(friendId, userId) as any

  if (lastMessage) {
    db.prepare(`
      INSERT INTO message_reads (user_id, friend_id, last_read_message_id, last_read_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, friend_id) DO UPDATE SET
        last_read_message_id = excluded.last_read_message_id,
        last_read_at = excluded.last_read_at
    `).run(userId, friendId, lastMessage.id, Date.now())
  }

  res.json({ success: true })
})

export default router