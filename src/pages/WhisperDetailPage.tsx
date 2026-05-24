import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Whisper, Comment } from '@/types'
import { useAuthStore } from '@/store/useAuthStore'
import api from '@/lib/api'
import LikeDislikeBar from '@/components/LikeDislikeBar'
import WhisperCard from '@/components/WhisperCard'
import LoadingSpinner from '@/components/LoadingSpinner'
import WhisperMenu from '@/components/WhisperMenu'
import ReportModal from '@/components/ReportModal'
import SkeletonCard from '@/components/SkeletonCard'
import { timeAgo } from '@/utils/timeAgo'
import { hapticFeedback } from '@/utils/haptics'

export default function WhisperDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [whisper, setWhisper] = useState<Whisper | null>(null)
  const [related, setRelated] = useState<Whisper[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [commentInput, setCommentInput] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPrivate, setIsPrivate] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchDetail = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const { data } = await api.get(`/whispers/${id}`)
      setWhisper(data.whisper)
      setEditContent(data.whisper.content || '')
      const { data: all } = await api.get('/whispers?sort=latest')
      const others = all.whispers.filter((w: Whisper) => w.id !== id).sort(() => Math.random() - 0.5).slice(0, 4)
      setRelated(others)
    } catch {
      setWhisper(null)
    }
    setLoading(false)
  }, [id])

  const fetchComments = useCallback(async () => {
    if (!id) return
    try {
      const { data } = await api.get(`/comments/${id}`)
      setComments(data.comments)
      setIsPrivate(data.isPrivate || false)
    } catch {}
  }, [id])

  useEffect(() => { fetchDetail(); fetchComments() }, [fetchDetail, fetchComments])

  const handleLike = async () => {
    if (!id) return
    hapticFeedback('light')
    try { await api.post(`/whispers/${id}/like`); fetchDetail() } catch {}
  }

  const handleDislike = async () => {
    if (!id) return
    hapticFeedback('light')
    try { await api.post(`/whispers/${id}/dislike`); fetchDetail() } catch {}
  }

  const submitComment = async () => {
    if (!commentInput.trim() || !id) return
    setSubmittingComment(true)
    hapticFeedback('medium')
    try {
      await api.post(`/comments/${id}`, { content: commentInput.trim() })
      setCommentInput('')
      fetchComments()
    } catch {}
    setSubmittingComment(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(whisper?.content || '')
  }

  const handleSaveEdit = async () => {
    if (!id || !editContent.trim()) return
    setSavingEdit(true)
    try {
      await api.put(`/whispers/${id}`, { content: editContent.trim() })
      setIsEditing(false)
      fetchDetail()
    } catch {}
    setSavingEdit(false)
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('确定要删除这条低语吗？删除后无法恢复。')) return
    setDeleting(true)
    try {
      await api.delete(`/whispers/${id}`)
      hapticFeedback('heavy')
      navigate('/feed')
    } catch {}
    setDeleting(false)
  }

  const handleReport = async (reason: string) => {
    if (!id) return
    hapticFeedback('medium')
    try {
      await api.post(`/whispers/${id}/report`, { reason })
      alert('举报成功，我们会尽快处理')
    } catch (e: any) {
      alert(e.response?.data?.error || '举报失败')
    }
  }

  const isOwner = user?.id === whisper?.user_id

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <div className="h-8 w-32 bg-white/5 rounded animate-pulse mb-12" />
          <div className="space-y-4">
            <SkeletonCard />
          </div>
        </div>
      </div>
    )
  }

  if (!whisper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <EmptyState
          icon="🌙"
          title="这条低语已经消散在夜风里"
          action={
            <Link to="/feed" className="text-white/60 hover:text-white transition-colors font-ui text-sm">
              ← 回到低语海湾
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      {showReportModal && (
        <ReportModal
          whisperId={whisper.id}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <Link to="/feed" className="text-neutral-500 hover:text-neutral-400 transition-colors font-ui text-sm">← 返回低语海湾</Link>
          <div className="flex items-center gap-3">
            <WhisperMenu
              isOwner={isOwner}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={() => setShowReportModal(true)}
            />
            <div className="flex items-center gap-2">
              {whisper.user_avatar ? (
                <img src={whisper.user_avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-ui">
                  {whisper.user_nickname?.charAt(0) || '?'}
                </span>
              )}
              <span className="text-sm text-neutral-400 font-ui">{whisper.user_nickname}</span>
              <span className="text-xs text-neutral-500 font-ui">· {timeAgo(whisper.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="animate-fade-up" style={{ opacity: 0 }}>
          {isEditing ? (
            <div className="bg-neutral-900/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/[0.04] mb-6">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value.slice(0, 500))}
                className="w-full bg-transparent text-xl md:text-2xl leading-relaxed text-white font-body whitespace-pre-wrap resize-none focus:outline-none"
                rows={6}
                autoFocus
              />
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-neutral-500 font-ui">{editContent.length}/500</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-ui hover:bg-white/20 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editContent.trim() || savingEdit}
                    className="px-4 py-2 rounded-xl bg-white text-black text-sm font-ui disabled:opacity-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
                  >
                    {savingEdit ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {whisper.content && (
                <div className="bg-neutral-900/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/[0.04] mb-6">
                  <p className="text-xl md:text-2xl leading-relaxed text-white font-body whitespace-pre-wrap">
                    {whisper.content}
                  </p>
                </div>
              )}

              {whisper.images.length > 0 && (
                <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(whisper.images.length, 3)}, 1fr)` }}>
                  {whisper.images.map((img, i) => (
                    <img key={i} src={img} alt="" className="w-full rounded-2xl object-cover max-h-80" loading="lazy" decoding="async" />
                  ))}
                </div>
              )}

              {whisper.voice_url && (
                <div className="bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-5 border border-white/[0.04] mb-6">
                  <div className="flex items-center gap-2 mb-3 text-sm text-white font-ui">
                    <span>🎙️</span><span>语音消息</span>
                  </div>
                  <audio src={whisper.voice_url} controls className="w-full h-10" />
                </div>
              )}

              <div className="bg-neutral-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/[0.04] mb-8">
                <p className="text-xs text-neutral-500 font-ui text-center mb-4 tracking-widest uppercase">你的感受</p>
                <div className="flex justify-center">
                  <LikeDislikeBar
                    likeCount={whisper.like_count}
                    dislikeCount={whisper.dislike_count}
                    myReaction={whisper.myReaction}
                    onLike={handleLike}
                    onDislike={handleDislike}
                    size="lg"
                  />
                </div>
              </div>
            </>
          )}

          {whisper.aiReply && !isEditing && (
            <div className="bg-gradient-to-br from-purple-500/[0.05] to-blue-500/[0.05] backdrop-blur-sm rounded-2xl p-6 border border-purple-400/10 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-ui">AI ✨</span>
                <span className="text-xs text-neutral-500 font-ui">的回应</span>
              </div>
              <p className="text-white text-base leading-relaxed font-body italic">
                &ldquo;{whisper.aiReply.content}&rdquo;
              </p>
            </div>
          )}

          {!isEditing && (
            <div className="mb-8">
              <p className="text-xs text-neutral-500 font-ui mb-4 tracking-widest uppercase">
                回复 {isPrivate && whisper.user_id !== user?.id ? '(私密)' : `(${comments.length})`}
              </p>

              {isPrivate && whisper.user_id !== user?.id ? (
                <div className="text-center py-8 bg-neutral-900/30 rounded-xl border border-white/[0.04]">
                  <p className="text-3xl mb-3">🔒</p>
                  <p className="text-neutral-400 text-sm font-ui">作者已开启私密回应</p>
                  <p className="text-neutral-500 text-xs font-ui mt-1">只有作者才能看到这些回复</p>
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-3 mb-5">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-neutral-900/30 rounded-xl p-4 border border-white/[0.03]">
                      <div className="flex items-center gap-2 mb-2">
                        {c.user_avatar ? (
                          <img src={c.user_avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white font-ui">
                            {c.user_nickname?.charAt(0) || '?'}
                          </span>
                        )}
                        <span className="text-xs text-neutral-400 font-ui">{c.user_nickname}</span>
                        <span className="text-[10px] text-neutral-500 font-ui">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-white leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="💭"
                  title="还没有回复"
                  description="来说点什么吧"
                />
              )}

              {user && (!isPrivate || whisper.user_id === user.id) ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                    placeholder="写下你的回复..."
                    maxLength={300}
                    disabled={submittingComment}
                    className="flex-1 bg-neutral-900/60 rounded-xl px-4 py-2.5 text-white font-ui text-sm placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none disabled:opacity-50"
                    aria-label="评论输入框"
                  />
                  <button
                    onClick={submitComment}
                    disabled={!commentInput.trim() || submittingComment}
                    className="px-4 py-2.5 rounded-xl bg-white text-black font-ui text-sm disabled:opacity-40 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    aria-label="发送评论"
                  >
                    {submittingComment ? (
                      <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      '回复'
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-center text-xs text-neutral-500 font-ui">
                  <Link to="/login" className="text-white/60 hover:text-white">登录</Link>后可以回复
                </p>
              )}
            </div>
          )}

          {related.length > 0 && !isEditing && (
            <div>
              <p className="text-xs text-neutral-500 font-ui text-center mb-6 tracking-widest uppercase">更多低语</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {related.map((w) => (
                  <WhisperCard key={w.id} whisper={w} onUpdate={() => {}} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, description, action }: { icon: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-up" style={{ opacity: 0 }}>
      <div className="text-3xl mb-3">{icon}</div>
      <h2 className="text-neutral-400 font-body text-sm mb-2">{title}</h2>
      {description && <p className="text-neutral-600 font-ui text-xs mb-6">{description}</p>}
      {action}
    </div>
  )
}