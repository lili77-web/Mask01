import { Router, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import db from '../database.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/search', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const q = (req.query.q as string || '').trim()
  if (!q || q.length < 2) {
    res.json({ users: [] })
    return
  }

  const users = db.prepare(`
    SELECT id, nickname, phone, avatar FROM users
    WHERE id != ? AND (phone LIKE ? OR nickname LIKE ?)
    LIMIT 10
  `).all(userId, `%${q}%`, `%${q}%`) as any[]

  const friends = db.prepare('SELECT friend_id, status FROM friends WHERE user_id = ?').all(userId) as any[]
  const friendMap = new Map(friends.map((f: any) => [f.friend_id, f.status]))

  res.json({
    users: users.map((u) => ({
      ...u,
      friendStatus: friendMap.get(u.id) || null,
    })),
  })
})

router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const friends = db.prepare(`
    SELECT f.id as friend_record_id, f.status, u.id, u.nickname, u.phone, u.avatar
    FROM friends f JOIN users u ON f.friend_id = u.id
    WHERE f.user_id = ? AND f.status = 'accepted'
    UNION
    SELECT f.id as friend_record_id, f.status, u.id, u.nickname, u.phone, u.avatar
    FROM friends f JOIN users u ON f.user_id = u.id
    WHERE f.friend_id = ? AND f.status = 'accepted'
  `).all(userId, userId) as any[]

  const friendList = friends.map((f) => {
    const lastMsg = db.prepare(`
      SELECT content, created_at FROM messages
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at DESC LIMIT 1
    `).get(userId, f.id, f.id, userId) as any

    return {
      id: f.id,
      nickname: f.nickname,
      avatar: f.avatar,
      lastMessage: lastMsg ? lastMsg.content : null,
      lastTime: lastMsg ? lastMsg.created_at : null,
    }
  })

  const requests = db.prepare(`
    SELECT f.id, f.status, u.id as user_id, u.nickname, u.avatar
    FROM friends f JOIN users u ON f.user_id = u.id
    WHERE f.friend_id = ? AND f.status = 'pending'
  `).all(userId) as any[]

  res.json({ friends: friendList, requests })
})

router.post('/request', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { friendId } = req.body
  if (!friendId) {
    res.status(400).json({ error: '缺少好友 ID' })
    return
  }
  if (friendId === userId) {
    res.status(400).json({ error: '不能添加自己为好友' })
    return
  }

  const existing = db.prepare('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?').get(userId, friendId) as any
  if (existing) {
    res.status(400).json({ error: '已发送过好友申请' })
    return
  }

  db.prepare('INSERT INTO friends (id, user_id, friend_id, status, created_at) VALUES (?, ?, ?, ?, ?)').run(
    nanoid(10), userId, friendId, 'pending', Date.now()
  )
  res.json({ message: '好友申请已发送' })
})

router.post('/accept', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { requestId } = req.body

  const req2 = db.prepare('SELECT * FROM friends WHERE id = ? AND friend_id = ? AND status = ?').get(requestId, userId, 'pending') as any
  if (!req2) {
    res.status(404).json({ error: '申请不存在' })
    return
  }

  db.prepare("UPDATE friends SET status = 'accepted' WHERE id = ?").run(requestId)

  const reverse = db.prepare('SELECT * FROM friends WHERE user_id = ? AND friend_id = ?').get(req2.user_id, userId) as any
  if (!reverse) {
    db.prepare('INSERT INTO friends (id, user_id, friend_id, status, created_at) VALUES (?, ?, ?, ?, ?)').run(
      nanoid(10), userId, req2.user_id, 'accepted', Date.now()
    )
  }

  res.json({ message: '已接受好友申请' })
})

export default router