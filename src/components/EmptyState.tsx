import { ReactNode } from 'react'

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-up" style={{ opacity: 0 }}>
      <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-neutral-400 font-body text-sm">{title}</p>
      {description && (
        <p className="text-neutral-600 font-ui text-xs mt-1">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  )
}
