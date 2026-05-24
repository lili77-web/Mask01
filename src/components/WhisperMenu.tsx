import { useState, useRef, useEffect } from 'react'

interface Props {
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
  onReport: () => void
}

export default function WhisperMenu({ isOwner, onEdit, onDelete, onReport }: Props) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        aria-label="更多选项"
        className="text-neutral-500 hover:text-white p-1 transition-colors"
      >
        ⋮
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-neutral-800 rounded-lg border border-white/10 shadow-xl z-50 min-w-[120px] overflow-hidden">
          {isOwner ? (
            <>
              <button
                onClick={() => { onEdit(); setOpen(false) }}
                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 font-ui transition-colors"
              >
                ✏️ 编辑
              </button>
              <button
                onClick={() => { onDelete(); setOpen(false) }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/10 font-ui transition-colors"
              >
                🗑️ 删除
              </button>
            </>
          ) : (
            <button
              onClick={() => { onReport(); setOpen(false) }}
              className="w-full px-4 py-2.5 text-left text-sm text-yellow-400 hover:bg-white/10 font-ui transition-colors"
            >
              🚩 举报
            </button>
          )}
        </div>
      )}
    </div>
  )
}