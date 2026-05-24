import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="text-center animate-fade-up" style={{ opacity: 0 }}>
        <p className="text-6xl mb-4">🌙</p>
        <h1 className="font-display text-4xl text-white font-bold italic mb-2">404</h1>
        <p className="text-neutral-400 font-body mb-2">这片区域还在黑暗中</p>
        <p className="text-neutral-500 text-sm font-ui mb-8">你寻找的页面已经消散在夜风里</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-ui font-medium transition-all hover:shadow-[0_0_30px_rgba(212,165,116,0.2)]"
        >
          <span>🏠</span>
          <span>返回首页</span>
        </Link>
      </div>
    </div>
  )
}
