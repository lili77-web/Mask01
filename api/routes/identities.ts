import { Router, Request, Response } from 'express'
import db from '../database.js'
import { nanoid } from 'nanoid'

const router = Router()

router.get('/', (_req: Request, res: Response) => {
  const identities = db.prepare('SELECT * FROM identities ORDER BY id').all()
  res.json({ identities })
})

router.post('/', (req: Request, res: Response) => {
  const { name, emoji, color } = req.body
  
  if (!name || !emoji || !color) {
    return res.status(400).json({ error: '名称、表情和颜色是必填的' })
  }
  
  if (name.length > 20) {
    return res.status(400).json({ error: '名称不能超过20个字符' })
  }
  
  const id = `custom_${nanoid(8)}`
  
  try {
    db.prepare('INSERT INTO identities (id, name, emoji, color) VALUES (?, ?, ?, ?)').run(id, name, emoji, color)
    const identity = db.prepare('SELECT * FROM identities WHERE id = ?').get(id)
    res.json({ identity })
  } catch (error) {
    res.status(500).json({ error: '创建身份失败' })
  }
})

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params

  if (typeof id !== 'string' || !id.startsWith('custom_')) {
    return res.status(400).json({ error: '只能删除自定义身份' })
  }
  
  try {
    const result = db.prepare('DELETE FROM identities WHERE id = ?').run(id)
    if (result.changes === 0) {
      return res.status(404).json({ error: '身份不存在' })
    }
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: '删除身份失败' })
  }
})

export default router