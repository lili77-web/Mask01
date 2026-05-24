import { useCallback, useRef, useState, useEffect } from 'react'

interface UseInfiniteScrollOptions<T> {
  fetchFn: (cursor?: string) => Promise<{ items: T[]; nextCursor?: string }>
  initialData?: T[]
}

export function useInfiniteScroll<T>({
  fetchFn,
  initialData = [],
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData)
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const result = await fetchFn(cursor ?? undefined)
      setItems(prev => [...prev, ...result.items])
      setCursor(result.nextCursor ?? null)
      setHasMore(!!result.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [cursor, loading, hasMore, fetchFn])

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [loadMore])

  const reset = useCallback((newItems: T[] = []) => {
    setItems(newItems)
    setCursor(null)
    setHasMore(true)
  }, [])

  return {
    items,
    loading,
    hasMore,
    loadMoreRef,
    loadMore,
    reset,
    setItems,
  }
}