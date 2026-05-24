import { useState } from 'react'
import { Identity } from '@/types'
import api from '@/lib/api'

interface Props {
  identities: Identity[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onRefresh: () => void
}

const EMOJI_OPTIONS = ['🎭', '🌟', '💫', '🌈', '🎨', '🎵', '📚', '🌸', '🍀', '🎁', '🔮', '🌙', '☀️', '🌊', '🏔️', '🍃']
const COLOR_OPTIONS = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#6366F1', '#14B8A6', '#F97316', '#84CC16']

export default function IdentitySelector({ identities, selectedId, onSelect, onRefresh }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customEmoji, setCustomEmoji] = useState('🎭')
  const [customColor, setCustomColor] = useState(COLOR_OPTIONS[0])
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!customName.trim()) return
    setIsCreating(true)
    try {
      await api.post('/identities', {
        name: customName.trim(),
        emoji: customEmoji,
        color: customColor
      })
      setShowForm(false)
      setCustomName('')
      setCustomEmoji('🎭')
      setCustomColor(COLOR_OPTIONS[0])
      onRefresh()
    } catch {
      alert('创建失败，请重试')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, identityId: string) => {
    e.stopPropagation()
    if (!identityId.startsWith('custom_')) return
    if (!confirm('确定要删除这个自定义身份吗？')) return
    
    try {
      await api.delete(`/identities/${identityId}`)
      if (selectedId === identityId) {
        onSelect(null)
      }
      onRefresh()
    } catch {
      alert('删除失败，请重试')
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-muted font-ui tracking-widest uppercase">选择身份（可选）</p>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-text-muted hover:text-white font-ui transition-colors"
          >
            + 创建自定义身份
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4 p-4 bg-surface-card/50 rounded-xl border border-white/[0.08]">
          <p className="text-xs text-text-secondary font-ui mb-3">创建自定义身份</p>
          
          <div className="mb-3">
            <label className="text-xs text-text-muted font-ui mb-2 block">名称</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value.slice(0, 20))}
              placeholder="输入身份名称"
              className="w-full bg-neutral-900/60 rounded-lg px-3 py-2 text-white text-sm font-ui border border-white/[0.06] focus:border-white/30 focus:outline-none"
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="text-xs text-text-muted font-ui mb-2 block">选择表情</label>
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setCustomEmoji(emoji)}
                  className={`text-xl p-2 rounded-lg transition-all ${
                    customEmoji === emoji 
                      ? 'bg-white/20 scale-110' 
                      : 'hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs text-text-muted font-ui mb-2 block">选择颜色</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => setCustomColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    customColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="mb-3 p-3 bg-neutral-900/40 rounded-lg">
            <p className="text-xs text-text-muted font-ui mb-2">预览</p>
            <div className="flex items-center gap-2">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: customColor + '20', border: `2px solid ${customColor}60` }}
              >
                <span className="text-2xl">{customEmoji}</span>
              </div>
              <span className="text-sm text-white font-ui">{customName || '身份名称'}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!customName.trim() || isCreating}
              className="flex-1 py-2 rounded-lg bg-white text-black font-ui text-sm hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? '创建中...' : '确认创建'}
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                setCustomName('')
                setCustomEmoji('🎭')
                setCustomColor(COLOR_OPTIONS[0])
              }}
              className="px-4 py-2 rounded-lg border border-white/[0.08] text-text-secondary font-ui text-sm hover:bg-white/5 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-5 gap-2">
        {identities.map((identity) => (
          <button
            key={identity.id}
            onClick={() => onSelect(selectedId === identity.id ? null : identity.id)}
            className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
              selectedId === identity.id
                ? 'border-white/50 bg-white/10'
                : 'border-white/[0.06] hover:border-white/[0.12] bg-surface-card/30'
            }`}
            style={{
              borderColor: selectedId === identity.id ? identity.color + '80' : undefined,
              backgroundColor: selectedId === identity.id ? identity.color + '15' : undefined,
            }}
          >
            <span className="text-2xl">{identity.emoji}</span>
            <span className="text-xs text-text-secondary font-ui">{identity.name}</span>
            {identity.id.startsWith('custom_') && (
              <button
                onClick={(e) => handleDelete(e, identity.id)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/80 hover:bg-red-500 text-white text-xs rounded-full flex items-center justify-center transition-colors"
                title="删除自定义身份"
              >
                ×
              </button>
            )}
          </button>
        ))}
      </div>
      
      {selectedId && (
        <button onClick={() => onSelect(null)} className="mt-2 text-xs text-text-muted hover:text-text-secondary font-ui">
          取消选择身份
        </button>
      )}
    </div>
  )
}