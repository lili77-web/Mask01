import { useState } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const REPORT_REASONS = [
  { value: 'spam', label: '垃圾信息' },
  { value: 'harassment', label: '骚扰/人身攻击' },
  { value: 'inappropriate', label: '不当内容' },
  { value: 'privacy', label: '侵犯隐私' },
  { value: 'other', label: '其他' },
]

interface Props {
  whisperId: string
  onClose: () => void
  onSubmit: (reason: string) => Promise<void>
}

export default function ReportModal({ onClose, onSubmit }: Props) {
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const menuRef = useFocusTrap<HTMLDivElement>(true)

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)
    await onSubmit(selected)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        ref={menuRef}
        className="bg-neutral-900 rounded-2xl p-6 w-full max-w-sm border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-white font-display text-lg mb-4 italic">举报低语</h3>
        <div className="space-y-2 mb-6">
          {REPORT_REASONS.map(r => (
            <label
              key={r.value}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                selected === r.value ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={selected === r.value}
                onChange={() => setSelected(r.value)}
                className="accent-accent"
              />
              <span className="text-white text-sm font-ui">{r.label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-sm font-ui hover:bg-white/20 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selected || loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500/80 text-white text-sm font-ui disabled:opacity-50 hover:bg-red-500 transition-colors"
          >
            {loading ? '提交中...' : '举报'}
          </button>
        </div>
      </div>
    </div>
  )
}