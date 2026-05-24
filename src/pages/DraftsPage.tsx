import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Draft } from '@/types'
import api from '@/lib/api'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { timeAgo } from '@/utils/timeAgo'

export default function DraftsPage() {
  const navigate = useNavigate()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDrafts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/drafts')
      setDrafts(data.drafts)
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchDrafts() }, [fetchDrafts])

  const handleEdit = (draft: Draft) => {
    navigate(`/write?draftId=${draft.id}`)
  }

  const handleDelete = async (draftId: string) => {
    if (!confirm('确定要删除这个草稿吗？')) return
    try {
      await api.delete(`/drafts/${draftId}`)
      setDrafts((prev) => prev.filter((d) => d.id !== draftId))
    } catch (e: any) {
      alert(e.response?.data?.error || '删除失败')
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-400 transition-colors font-ui text-sm">← 返回</Link>
          <Link to="/write" className="px-4 py-2 rounded-xl bg-white text-black font-ui text-sm">+ 新建</Link>
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-white font-bold italic mb-8">草稿箱</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="md" text="加载中..." />
          </div>
        ) : drafts.length === 0 ? (
          <EmptyState
            icon="📝"
            title="草稿箱是空的"
            description="在发布页编写的内容会自动保存到这里"
          />
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-neutral-900/40 rounded-2xl p-5 border border-white/[0.04] animate-fade-up"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {draft.identity && (
                      <span
                        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mb-2 font-ui"
                        style={{ backgroundColor: `${draft.identity.color}20`, color: draft.identity.color }}
                      >
                        {draft.identity.emoji} {draft.identity.name}
                      </span>
                    )}
                    <p className="text-white font-ui text-sm line-clamp-2">
                      {draft.content || '[空白内容]'}
                    </p>
                    {draft.images.length > 0 && (
                      <p className="text-neutral-500 text-xs font-ui mt-1">🖼️ {draft.images.length} 张图片</p>
                    )}
                    {draft.voice_url && (
                      <p className="text-neutral-500 text-xs font-ui mt-1">🎙️ 语音消息</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
                  <span className="text-xs text-neutral-600 font-ui">{timeAgo(draft.created_at)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(draft)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-ui hover:bg-white/20 transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(draft.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-ui hover:bg-red-500/20 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}