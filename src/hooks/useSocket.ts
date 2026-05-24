import { useEffect, useRef, useCallback } from 'react'
import { getSocket, disconnectSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/useAuthStore'

export function useSocket() {
  const token = useAuthStore((s) => s.token)
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null)

  useEffect(() => {
    if (token) {
      socketRef.current = getSocket(token)
    } else {
      disconnectSocket()
      socketRef.current = null
    }

    return () => {
      disconnectSocket()
      socketRef.current = null
    }
  }, [token])

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data)
    }
  }, [])

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler)
    }
  }, [])

  const off = useCallback((event: string, handler?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler)
    }
  }, [])

  return { socket: socketRef.current, emit, on, off }
}