import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '@/lib/api'
import IdentitySelector from '@/components/IdentitySelector'
import BlurImage from '@/components/BlurImage'
import { Identity } from '@/types'
import { compressImage } from '@/utils/imageCompression'
import { generateBlurPlaceholder } from '@/utils/generateBlurPlaceholder'
import { hapticFeedback } from '@/utils/haptics'

export default function WritePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const draftId = searchParams.get('draftId')

  const [content, setContent] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [blurPlaceholders, setBlurPlaceholders] = useState<string[]>([])
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null)
  const [voiceUrl, setVoiceUrl] = useState<string>('')
  const [isRecording, setIsRecording] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isPrivateResponse, setIsPrivateResponse] = useState(false)
  const [selectedIdentity, setSelectedIdentity] = useState<string | null>(null)
  const [identities, setIdentities] = useState<Identity[]>([])
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    api.get('/identities').then(({ data }) => setIdentities(data.identities)).catch(() => {})

    if (draftId) {
      api.get(`/drafts/${draftId}`).then(({ data }) => {
        const draft = data.draft
        setContent(draft.content || '')
        setSelectedIdentity(draft.identity_id || null)
        setCurrentDraftId(draft.id)
        if (draft.images && draft.images.length > 0) {
          draft.images.forEach((img: string) => {
            fetch(img).then(r => r.blob()).then(blob => {
              const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
              setImageFiles(prev => [...prev, file])
              setImagePreviews(prev => [...prev, img])
              setBlurPlaceholders(prev => [...prev, ''])
            })
          })
        }
      }).catch(() => {})
    }
  }, [draftId])

  const saveDraft = useCallback(async () => {
    if (!content.trim() && imageFiles.length === 0 && !voiceBlob) return
    try {
      const { data } = await api.post('/drafts', {
        content,
        images: imageFiles.map((_, i) => imagePreviews[i]),
        voice_url: voiceUrl,
        identity_id: selectedIdentity,
        draft_id: currentDraftId,
      })
      if (!currentDraftId) {
        setCurrentDraftId(data.draft.id)
      }
    } catch { /* silent fail */ }
  }, [content, imageFiles, imagePreviews, voiceUrl, selectedIdentity, currentDraftId])

  useEffect(() => {
    if (autoSaveRef.current) clearInterval(autoSaveRef.current)
    autoSaveRef.current = setInterval(saveDraft, 30000)
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current) }
  }, [saveDraft])

  const maxLength = 500

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 3 - imageFiles.length
    const toAdd = files.slice(0, remaining)

    for (const f of toAdd) {
      try {
        const compressed = await compressImage(f)
        const placeholder = await generateBlurPlaceholder(compressed)
        const preview = URL.createObjectURL(compressed)

        setImageFiles(prev => [...prev, compressed])
        setImagePreviews(prev => [...prev, preview])
        setBlurPlaceholders(prev => [...prev, placeholder])
      } catch {
        const reader = new FileReader()
        reader.onload = () => {
          setImageFiles(prev => [...prev, f])
          setImagePreviews(prev => [...prev, reader.result as string])
          setBlurPlaceholders(prev => [...prev, ''])
        }
        reader.readAsDataURL(f)
      }
    }
  }

  const removeImage = (idx: number) => {
    setImageFiles(p => p.filter((_, i) => i !== idx))
    setImagePreviews(p => p.filter((_, i) => i !== idx))
    setBlurPlaceholders(p => p.filter((_, i) => i !== idx))
  }

  const startRecording = useCallback(async () => {
    try {
      hapticFeedback('light')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setVoiceBlob(blob)
        setVoiceUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setTimeout(() => { if (recorder.state === 'recording') recorder.stop(); setIsRecording(false) }, 60000)
    } catch {
      alert('无法访问麦克风')
    }
  }, [])

  const stopRecording = () => {
    hapticFeedback('medium')
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && imageFiles.length === 0 && !voiceBlob) return

    if (currentDraftId) {
      await api.delete(`/drafts/${currentDraftId}`).catch(() => {})
    }

    setUploading(true)
    hapticFeedback('heavy')
    try {
      const formData = new FormData()
      formData.append('content', content.trim())
      formData.append('is_private_response', String(isPrivateResponse))
      if (selectedIdentity) {
        formData.append('identity_id', selectedIdentity)
      }
      imageFiles.forEach((f) => formData.append('images', f))
      if (voiceBlob) {
        formData.append('voice', voiceBlob, 'recording.webm')
      }
      const { data } = await api.post('/whispers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setShowSuccess(true)
      setTimeout(() => navigate(`/whisper/${data.whisper.id}`), 1500)
    } catch {
      alert('发布失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="animate-fade-up text-center">
          <div className="text-6xl mb-6 animate-bounce-icon">🕯️</div>
          <h2 className="font-display text-3xl text-white italic mb-3">已轻轻放下</h2>
          <p className="text-neutral-400 font-body">你的秘密已经被温柔安放</p>
          <p className="text-neutral-500 text-sm mt-2 font-ui">正在为你跳转...</p>
        </div>
      </div>
    )
  }

  const canSubmit = (content.trim() || imageFiles.length > 0 || voiceBlob) && !uploading

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-neutral-500 hover:text-neutral-400 transition-colors font-ui text-sm">← 返回</Link>
          {currentDraftId && (
            <span className="text-xs text-neutral-600 font-ui">已自动保存</span>
          )}
        </div>

        <div className="animate-fade-up" style={{ opacity: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl text-white font-bold italic mb-2">写下秘密</h1>
          <p className="text-neutral-500 text-sm font-ui mb-8">在这里，你可以放下一切。支持文字、图片和语音。</p>

          <div className="mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
              placeholder="在这里，你可以放下一切……"
              rows={6}
              className="w-full bg-neutral-900/60 backdrop-blur-sm rounded-2xl p-6 text-white text-base leading-relaxed font-body placeholder:text-neutral-500/50 border border-white/[0.04] focus:border-white/30 focus:outline-none transition-all duration-300 resize-none"
              autoFocus
              aria-label="秘密内容"
            />
            <div className="flex justify-end mt-2">
              <span className={`text-xs font-ui ${content.length >= maxLength ? 'text-red-400' : 'text-neutral-500'}`}>
                {content.length}/{maxLength}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs text-neutral-500 font-ui mb-2 tracking-widest uppercase">图片（最多3张）</p>
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                    <BlurImage
                      src={preview}
                      blurSrc={blurPlaceholders[i]}
                      alt={`上传图片 ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      aria-label={`删除图片 ${i + 1}`}
                      className="absolute top-0 right-0 w-5 h-5 bg-black/60 rounded-bl-xl flex items-center justify-center text-white text-xs hover:bg-black/80 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {imageFiles.length < 3 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 rounded-xl border-2 border-dashed border-white/[0.08] text-neutral-500 hover:border-white/30 hover:text-white transition-colors font-ui text-sm flex items-center justify-center gap-2"
              >
                <span>📷</span>点击上传图片
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              aria-label="选择图片"
            />
          </div>

          <div className="mb-6 bg-neutral-900/30 rounded-xl p-4 border border-white/[0.04]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white font-ui">私密回应</p>
                <p className="text-xs text-neutral-500 font-ui">开启后只有你能看到别人的回复</p>
              </div>
              <button
                onClick={() => setIsPrivateResponse(!isPrivateResponse)}
                aria-label={isPrivateResponse ? '关闭私密回应' : '开启私密回应'}
                aria-pressed={isPrivateResponse}
                className={`w-12 h-6 rounded-full transition-all ${isPrivateResponse ? 'bg-white' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${isPrivateResponse ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>

          <IdentitySelector identities={identities} selectedId={selectedIdentity} onSelect={setSelectedIdentity} onRefresh={() => api.get('/identities').then(({ data }) => setIdentities(data.identities)).catch(() => {})} />

          <div className="mb-8">
            <p className="text-xs text-neutral-500 font-ui mb-2 tracking-widest uppercase">语音消息</p>
            {voiceUrl ? (
              <div className="bg-neutral-900/60 rounded-xl p-4 flex items-center gap-3">
                <audio src={voiceUrl} controls className="flex-1 h-8 [&::-webkit-media-controls-panel]:bg-transparent" aria-label="语音预览" />
                <button onClick={() => { setVoiceBlob(null); setVoiceUrl('') }} className="text-neutral-500 hover:text-red-400 text-sm font-ui">重录</button>
              </div>
            ) : (
              <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                aria-label={isRecording ? '停止录音' : '开始录音'}
                className={`w-full py-4 rounded-xl border-2 border-dashed transition-all font-ui text-sm flex items-center justify-center gap-2 ${
                  isRecording
                    ? 'border-red-400/30 bg-red-400/5 text-red-400 animate-pulse'
                    : 'border-white/[0.08] text-neutral-500 hover:border-white/30 hover:text-white'
                }`}
              >
                <span>🎙️</span>
                {isRecording ? '正在录制...松开停止' : '按住开始录音（最长60秒）'}
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label={uploading ? '发布中' : '发布低语'}
            className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-ui font-medium text-lg transition-all duration-500 ${
              canSubmit
                ? 'bg-white text-black hover:shadow-[0_0_40px_rgba(212,165,116,0.3)] hover:scale-[1.01]'
                : 'bg-white/[0.03] text-neutral-500 cursor-not-allowed'
            }`}
          >
            {uploading ? (
              <span className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <span className="text-xl">🕯️</span>
            )}
            <span>{uploading ? '上传中...' : '轻轻放下'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}