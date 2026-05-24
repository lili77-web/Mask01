import { Router, Request, Response } from 'express'
import db from '../database.js'
import { nanoid } from 'nanoid'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.get('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId

  const drafts = db.prepare(`
    SELECT d.*, i.name as identity_name, i.emoji as identity_emoji, i.color as identity_color
    FROM drafts d
    LEFT JOIN identities i ON d.identity_id = i.id
    WHERE d.user_id = ?
    ORDER BY d.created_at DESC
  `).all(userId) as any[]

  const parsed = drafts.map((d) => ({
    ...d,
    images: JSON.parse(d.images || '[]'),
    identity: d.identity_id ? { id: d.identity_id, name: d.identity_name, emoji: d.identity_emoji, color: d.identity_color } : null,
  }))

  res.json({ drafts: parsed })
})

router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const draft = db.prepare(`
    SELECT d.*, i.name as identity_name, i.emoji as identity_emoji, i.color as identity_color
    FROM drafts d
    LEFT JOIN identities i ON d.identity_id = i.id
    WHERE d.id = ? AND d.user_id = ?
  `).get(req.params.id, userId) as any

  if (!draft) {
    return res.status(404).json({ error: '草稿不存在' })
  }

  res.json({
    draft: {
      ...draft,
      images: JSON.parse(draft.images || '[]'),
      identity: draft.identity_id ? { id: draft.identity_id, name: draft.identity_name, emoji: draft.identity_emoji, color: draft.identity_color } : null,
    },
  })
})

router.post('/', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId
  const { content, images, voice_url, identity_id, draft_id } = req.body

  let id = draft_id
  let isUpdate = false

  if (draft_id) {
    const existing = db.prepare('SELECT id FROM drafts WHERE id = ? AND user_id = ?').get(draft_id, userId)
    if (existing) {
      isUpdate = true
    }
  }

  if (!id) {
    id = nanoid(12)
  }

  const imagesJson = JSON.stringify(images || [])

  if (isUpdate) {
    db.prepare(`
      UPDATE drafts SET content = ?, images = ?, voice_url = ?, identity_id = ?, created_at = ?
      WHERE id = ? AND user_id = ?
    `).run(content || '', imagesJson, voice_url || '', identity_id || null, Date.now(), id, userId)
  } else {
    db.prepare(`
      INSERT INTO drafts (id, user_id, content, images, voice_url, identity_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, content || '', imagesJson, voice_url || '', identity_id || null, Date.now())
  }

  const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(id)
  res.json({ draft })
})

router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId

  const result = db.prepare('DELETE FROM drafts WHERE id = ? AND user_id = ?').run(req.params.id, userId)
  if (result.changes === 0) {
    return res.status(404).json({ error: '草稿不存在' })
  }
  res.json({ success: true })
})

export default router