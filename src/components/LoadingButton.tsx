import { ReactNode, ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading: boolean
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function LoadingButton({
  onClick,
  loading,
  disabled,
  children,
  className,
  variant = 'primary',
  ...rest
}: Props) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-ui font-medium text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    danger: 'bg-red-500/80 text-white hover:bg-red-500',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(baseClasses, variantClasses[variant], className)}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}