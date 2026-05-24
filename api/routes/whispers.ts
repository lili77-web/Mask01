import { Router, Request, Response } from 'express'
import { nanoid } from 'nanoid'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../database.js'
import { authMiddleware, optionalAuth } from '../middleware/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '..', '..', 'uploads')

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.dat'
    cb(null, `${nanoid(12)}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedImages = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const allowedAudio = ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/ogg']
    if (allowedImages.includes(file.mimetype) || allowedAudio.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  },
})

const router = Router()

router.get('/', optionalAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId || null
  const sort = req.query.sort as string || 'latest'
  const cursor = req.query.cursor as string | undefined
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50)

  let whispers: any[] = []
  if (sort === 'popular') {
    const cursorCondition = cursor ? `AND (w.like_count < ? OR (w.like_count = ? AND w.created_at < ?))` : ''
    whispers = db.prepare(`
      SELECT w.*, u.nickname as user_nickname, u.avatar as user_avatar,
        i.name as identity_name, i.emoji as identity_emoji, i.color as identity_color,
        (SELECT reaction_type FROM user_reactions WHERE user_id = ? AND whisper_id = w.id) as my_reaction,
        EXISTS(SELECT 1 FROM ai_replies WHERE whisper_id = w.id) as has_ai_reply
      FROM whispers w
      JOIN users u ON w.user_id = u.id
      LEFT JOIN identities i ON w.identity_id = i.id
      WHERE 1=1 ${cursorCondition}
      ORDER BY w.like_count DESC, w.created_at DESC
      LIMIT ?
    `).all(...(cursor ? [userId || '', cursor, cursor, cursor, limit] : [userId || '', limit])) as any[]
  } else {
    const cursorCondition = cursor ? `AND w.created_at < ?` : ''
    whispers = db.prepare(`
      SELECT w.*, u.nickname as user_nickname, u.avatar as user_avatar,
        i.name as identity_name, i.emoji as identity_emoji, i.color as identity_color,
        (SELECT reaction_type FROM user_reactions WHERE user_id = ? AND whisper_id = w.id) as my_reaction,
        EXISTS(SELECT 1 FROM ai_replies WHERE whisper_id = w.id) as has_ai_reply
      FROM whispers w
      JOIN users u ON w.user_id = u.id
      LEFT JOIN identities i ON w.identity_id = i.id
      WHERE 1=1 ${cursorCondition}
      ORDER BY w.created_at DESC
      LIMIT ?
    `).all(...(cursor ? [userId || '', cursor, limit] : [userId || '', limit])) as any[]
  }

  const parsed = whispers.map((w) => ({
    ...w,
    images: JSON.parse(w.images || '[]'),
    myReaction: w.my_reaction || null,
    hasAiReply: !!w.has_ai_reply,
    identity: w.identity_id ? { id: w.identity_id, name: w.identity_name, emoji: w.identity_emoji, color: w.identity_color } : null,
  }))

  const nextCursor = whispers.length === limit
    ? (sort === 'popular' ? String(whispers[whispers.length - 1].like_count) : String(whispers[whispers.length - 1].created_at))
    : null

  res.json({ whispers: parsed, nextCursor })
})

router.get('/search', optionalAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId || null
  const q = (req.query.q as string || '').trim()

  if (!q || q.length < 2) {
    res.json({ whispers: [], nextCursor: null })
    return
  }

  const whispers = db.prepare(`
    SELECT w.*, u.nickname as user_nickname, u.avatar as user_avatar,
      i.name as identity_name, i.emoji as identity_emoji, i.color as identity_color,
      (SELECT reaction_type FROM user_reactions WHERE user_id = ? AND whisper_id = w.id) as my_reaction,
      EXISTS(SELECT 1 FROM ai_replies WHERE whisper_id = w.id) as has_ai_reply
    FROM whispers w
    JOIN users u ON w.user_id = u.id
    LEFT JOIN identities i ON w.identity_id = i.id
    WHERE w.content LIKE ?
    ORDER BY w.created_at DESC
    LIMIT 20
  `).all(userId || '', `%${q}%`) as any[]

  const parsed = whispers.map((w) => ({
    ...w,
    images: JSON.parse(w.images || '[]'),
    myReaction: w.my_reaction || null,
    hasAiReply: !!w.has_ai_reply,
    identity: w.identity_id ? { id: w.identity_id, name: w.identity_name, emoji: w.identity_emoji, color: w.identity_color } : null,
  }))

  res.json({ whispers: parsed, nextCursor: null })
})

router.get('/hashtags', (_req: Request, res: Response) => {
  const hashtags = db.prepare('SELECT * FROM hashtags ORDER BY count DESC LIMIT 20').all()
  res.json({ hashtags })
})

router.get('/:id', optionalAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId || null
  const whisper = db.prepare(`
    SELECT w.*, u.nickname as user_nickname, u.avatar as user_avatar,
      i.name as identity_name, i.emoji as identity_emoji, i.color as identity_color,
      (SELECT reaction_type FROM user_reactions WHERE user_id = ? AND whisper_id = w.id) as my_reaction
    FROM whispers w
    JOIN users u ON w.user_id = u.id
    LEFT JOIN identities i ON w.identity_id = i.id
    WHERE w.id = ?
  `).get(userId || '', req.params.id) as any

  if (!whisper) {
    res.status(404).json({ error: '低语不存在' })
    return
  }

  const aiReply = db.prepare('SELECT * FROM ai_replies WHERE whisper_id = ?').get(req.params.id) as any

  res.json({
    whisper: {
      ...whisper,
      images: JSON.parse(whisper.images || '[]'),
      myReaction: whisper.my_reaction || null,
      aiReply: aiReply || null,
      identity: whisper.identity_id ? { id: whisper.identity_id, name: whisper.identity_name, emoji: whisper.identity_emoji, color: whisper.identity_color } : null,
    },
  })
})

router.post('/', authMiddleware, upload.fields([
  { name: 'images', maxCount: 3 },
  { name: 'voice', maxCount: 1 },
]), (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { content, is_private_response, identity_id } = req.body
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }

  if (!content && (!files?.images?.length) && !files?.voice?.length) {
    res.status(400).json({ error: '请至少输入文字、上传图片或录制语音' })
    return
  }

  const id = nanoid(12)
  const imageFiles = files?.images || []
  const voiceFile = files?.voice?.[0]
  const images = imageFiles.map((f) => `/uploads/${f.filename}`)
  const isPrivate = is_private_response === 'true' || is_private_response === true ? 1 : 0

  db.prepare(`
    INSERT INTO whispers (id, user_id, content, images, voice_url, is_private_response, identity_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    userId,
    content || '',
    JSON.stringify(images),
    voiceFile ? `/uploads/${voiceFile.filename}` : '',
    isPrivate,
    identity_id || null,
    Date.now()
  )

  // Parse and store hashtags
  const hashtagRegex = /#(\w+)/g
  let match
  while ((match = hashtagRegex.exec(content)) !== null) {
    const tagName = match[1].toLowerCase()
    try {
      const existing = db.prepare('SELECT id FROM hashtags WHERE name = ?').get(tagName) as any
      if (existing) {
        db.prepare('UPDATE hashtags SET count = count + 1 WHERE name = ?').run(tagName)
        const hashtag = db.prepare('SELECT id FROM hashtags WHERE name = ?').get(tagName) as any
        db.prepare('INSERT OR IGNORE INTO whisper_hashtags (whisper_id, hashtag_id) VALUES (?, ?)').run(id, hashtag.id)
      } else {
        const result = db.prepare('INSERT INTO hashtags (name, count) VALUES (?, 1)').run(tagName)
        db.prepare('INSERT INTO whisper_hashtags (whisper_id, hashtag_id) VALUES (?, ?)').run(id, result.lastInsertRowid)
      }
    } catch { /* ignore */ }
  }

  const whisper = db.prepare(`
    SELECT w.*, u.nickname as user_nickname, u.avatar as user_avatar,
      i.name as identity_name, i.emoji as identity_emoji, i.color as identity_color
    FROM whispers w
    JOIN users u ON w.user_id = u.id
    LEFT JOIN identities i ON w.identity_id = i.id
    WHERE w.id = ?
  `).get(id) as any

  res.status(201).json({
    whisper: {
      ...whisper,
      images: JSON.parse(whisper.images || '[]'),
      myReaction: null,
      hasAiReply: false,
      identity: whisper.identity_id ? { id: whisper.identity_id, name: whisper.identity_name, emoji: whisper.identity_emoji, color: whisper.identity_color } : null,
    },
  })
})

router.post('/:id/like', authMiddleware, (req: Request, res: Response) => {
  handleReaction(req, res, 'like')
})

router.post('/:id/dislike', authMiddleware, (req: Request, res: Response) => {
  handleReaction(req, res, 'dislike')
})

function handleReaction(req: Request, res: Response, type: 'like' | 'dislike') {
  const userId = (req as any).userId
  const whisperId = req.params.id

  const whisper = db.prepare('SELECT * FROM whispers WHERE id = ?').get(whisperId) as any
  if (!whisper) {
    res.status(404).json({ error: '低语不存在' })
    return
  }

  const existing = db.prepare('SELECT * FROM user_reactions WHERE user_id = ? AND whisper_id = ?').get(userId, whisperId) as any

  if (existing) {
    if (existing.reaction_type === type) {
      db.prepare('DELETE FROM user_reactions WHERE user_id = ? AND whisper_id = ?').run(userId, whisperId)
      db.prepare(`UPDATE whispers SET ${type}_count = MAX(0, ${type}_count - 1) WHERE id = ?`).run(whisperId)
      res.json({ action: 'removed', type })
      return
    } else {
      const oldType = existing.reaction_type
      db.prepare('UPDATE user_reactions SET reaction_type = ? WHERE user_id = ? AND whisper_id = ?').run(type, userId, whisperId)
      db.prepare(`UPDATE whispers SET ${oldType}_count = MAX(0, ${oldType}_count - 1) WHERE id = ?`).run(whisperId)
      db.prepare(`UPDATE whispers SET ${type}_count = ${type}_count + 1 WHERE id = ?`).run(whisperId)
      res.json({ action: 'switched', from: oldType, to: type })
      return
    }
  }

  db.prepare('INSERT INTO user_reactions (user_id, whisper_id, reaction_type) VALUES (?, ?, ?)').run(userId, whisperId, type)
  db.prepare(`UPDATE whispers SET ${type}_count = ${type}_count + 1 WHERE id = ?`).run(whisperId)
  res.json({ action: 'added', type })
}

router.put('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { content } = req.body

  const whisper = db.prepare('SELECT * FROM whispers WHERE id = ?').get(req.params.id) as any
  if (!whisper) {
    res.status(404).json({ error: '低语不存在' })
    return
  }
  if (whisper.user_id !== userId) {
    res.status(403).json({ error: '无权修改' })
    return
  }

  db.prepare('UPDATE whispers SET content = ? WHERE id = ?').run(content, req.params.id)
  res.json({ success: true })
})

router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId

  const whisper = db.prepare('SELECT * FROM whispers WHERE id = ?').get(req.params.id) as any
  if (!whisper) {
    res.status(404).json({ error: '低语不存在' })
    return
  }
  if (whisper.user_id !== userId) {
    res.status(403).json({ error: '无权删除' })
    return
  }

  db.prepare('DELETE FROM whispers WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

router.post('/:id/report', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { reason } = req.body

  if (!reason) {
    res.status(400).json({ error: '请选择举报原因' })
    return
  }

  const whisper = db.prepare('SELECT * FROM whispers WHERE id = ?').get(req.params.id)
  if (!whisper) {
    res.status(404).json({ error: '低语不存在' })
    return
  }

  const existing = db.prepare('SELECT * FROM reports WHERE whisper_id = ? AND reporter_id = ?').get(req.params.id, userId)
  if (existing) {
    res.status(400).json({ error: '已举报过该内容' })
    return
  }

  db.prepare('INSERT INTO reports (id, whisper_id, reporter_id, reason, created_at) VALUES (?, ?, ?, ?, ?)').run(
    nanoid(12), req.params.id, userId, reason, Date.now()
  )

  db.prepare('UPDATE whispers SET report_count = COALESCE(report_count, 0) + 1 WHERE id = ?').run(req.params.id)

  res.json({ success: true, message: '举报成功，我们会尽快处理' })
})

export default router