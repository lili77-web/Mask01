export default function SkeletonCard() {
  return (
    <div className="bg-surface-card/80 backdrop-blur-sm rounded-2xl p-5 border border-white/[0.05] animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-white/5" />
        <div className="w-20 h-4 rounded bg-white/5" />
        <div className="w-12 h-3 rounded bg-white/5" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="w-full h-4 rounded bg-white/5" />
        <div className="w-3/4 h-4 rounded bg-white/5" />
        <div className="w-1/2 h-4 rounded bg-white/5" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="w-24 h-24 rounded-xl bg-white/5" />
        <div className="w-24 h-24 rounded-xl bg-white/5" />
      </div>
      <div className="flex items-center gap-4 pt-3 border-t border-white/[0.04]">
        <div className="w-16 h-6 rounded-lg bg-white/5" />
        <div className="w-16 h-6 rounded-lg bg-white/5" />
      </div>
    </div>
  )
}