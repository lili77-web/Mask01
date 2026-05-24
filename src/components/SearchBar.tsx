import { useState, useEffect, useCallback, useRef } from 'react'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export default function SearchBar({
  onSearch,
  placeholder = '搜索低语...',
  debounceMs = 300,
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }, [])

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      onSearch(value)
    }, debounceMs)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [value, debounceMs, onSearch])

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">🔍</span>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-neutral-900/60 backdrop-blur-sm rounded-xl px-4 py-2.5 pl-10 pr-10 text-white text-sm font-ui placeholder:text-neutral-500 border border-white/[0.06] focus:border-white/30 focus:outline-none transition-all"
      />
      {value && (
        <button
          onClick={handleClear}
          aria-label="清除搜索"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
        >
          ×
        </button>
      )}
    </div>
  )
}