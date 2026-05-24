import { useState, useRef, useCallback, useEffect } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  maxPull?: number
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 150,
}: UsePullToRefreshOptions) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const isPulling = useRef(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      isPulling.current = true
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current) return
    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current
    if (diff > 0) {
      setPullDistance(Math.min(diff, maxPull))
    }
  }, [maxPull])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return
    isPulling.current = false

    if (pullDistance > threshold) {
      setIsRefreshing(true)
      await onRefresh()
    }
    setPullDistance(0)
    setIsRefreshing(false)
  }, [pullDistance, threshold, onRefresh])

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.addEventListener('touchstart', handleTouchStart, { passive: true })
      node.addEventListener('touchmove', handleTouchMove, { passive: true })
      node.addEventListener('touchend', handleTouchEnd, { passive: true })
      containerRef.current = node
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('touchstart', handleTouchStart)
        containerRef.current.removeEventListener('touchmove', handleTouchMove)
        containerRef.current.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    pullDistance,
    isRefreshing,
    containerRef: setContainerRef,
    indicatorStyle: {
      height: pullDistance > 0 ? Math.min(pullDistance, 80) : 0,
      opacity: pullDistance > 0 ? 1 : 0,
    },
  }
}