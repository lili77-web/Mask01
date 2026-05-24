import { Router, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import db from '../database.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', optionalAuth, (_req: Request, res: Response) => {
  const rooms = db.prepare(`
    SELECT r.*, u.nickname as creator_nickname,
      (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count
    FROM rooms r JOIN users u ON r.created_by = u.id
    ORDER BY created_at DESC
  `).all() as any[]

  res.json({ rooms })
})

router.get('/:id', optionalAuth, (req: Request, res: Response) => {
  const { id } = req.params
  const userId = (req as any).userId || null

  const room = db.prepare(`
    SELECT r.*, u.nickname as creator_nickname,
      (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as member_count
    FROM rooms r JOIN users u ON r.created_by = u.id
    WHERE r.id = ?
  `).get(id) as any

  if (!room) {
    res.status(404).json({ error: '房间不存在' })
    return
  }

  let isMember = false
  if (userId) {
    const member = db.prepare('SELECT * FROM room_members WHERE room_id = ? AND user_id = ?').get(id, userId)
    isMember = !!member
  }

  res.json({ room: { ...room, isMember } })
})

router.post('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { name, description, mood_tag } = req.body

  if (!name || !name.trim()) {
    res.status(400).json({ error: '房间名称不能为空' })
    return
  }

  const id = nanoid(12)
  const now = Date.now()

  db.prepare(`
    INSERT INTO rooms (id, name, description, mood_tag, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name.trim(), description || '', mood_tag || '', userId, now)

  db.prepare('INSERT INTO room_members (room_id, user_id, joined_at) VALUES (?, ?, ?)').run(id, userId, now)

  res.status(201).json({
    room: { id, name: name.trim(), description: description || '', mood_tag: mood_tag || '', created_by: userId, created_at: now }
  })
})

router.get('/:id/messages', optionalAuth, (req: Request, res: Response) => {
  const { id } = req.params
  const limit = parseInt(req.query.limit as string) || 50

  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(id)
  if (!room) {
    res.status(404).json({ error: '房间不存在' })
    return
  }

  const messages = db.prepare(`
    SELECT rm.*, u.nickname as user_nickname
    FROM room_messages rm JOIN users u ON rm.user_id = u.id
    WHERE rm.room_id = ?
    ORDER BY rm.created_at ASC
    LIMIT ?
  `).all(id, limit)

  res.json({ messages })
})

router.post('/:id/messages', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { id } = req.params
  const { content } = req.body

  if (!content || !content.trim()) {
    res.status(400).json({ error: '消息内容不能为空' })
    return
  }

  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(id)
  if (!room) {
    res.status(404).json({ error: '房间不存在' })
    return
  }

  const member = db.prepare('SELECT * FROM room_members WHERE room_id = ? AND user_id = ?').get(id, userId)
  if (!member) {
    res.status(403).json({ error: '需要先加入房间' })
    return
  }

  const id_msg = nanoid(12)
  const now = Date.now()

  db.prepare('INSERT INTO room_messages (id, room_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)').run(
    id_msg, id, userId, content.trim(), now
  )

  const user = db.prepare('SELECT nickname FROM users WHERE id = ?').get(userId) as any

  res.status(201).json({
    message: {
      id: id_msg,
      room_id: id,
      user_id: userId,
      user_nickname: user.nickname,
      content: content.trim(),
      created_at: now,
    }
  })
})

router.post('/:id/join', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { id } = req.params

  const room = db.prepare('SELECT id FROM rooms WHERE id = ?').get(id)
  if (!room) {
    res.status(404).json({ error: '房间不存在' })
    return
  }

  const existing = db.prepare('SELECT * FROM room_members WHERE room_id = ? AND user_id = ?').get(id, userId)
  if (existing) {
    res.json({ joined: true, message: '已经在房间里了' })
    return
  }

  db.prepare('INSERT INTO room_members (room_id, user_id, joined_at) VALUES (?, ?, ?)').run(id, userId, Date.now())
  res.json({ joined: true })
})

router.delete('/:id/leave', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { id } = req.params

  db.prepare('DELETE FROM room_members WHERE room_id = ? AND user_id = ?').run(id, userId)
  res.json({ left: true })
})

export default router