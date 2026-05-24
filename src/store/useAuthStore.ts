import { create } from 'zustand'
import { User } from '@/types'
import api from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoaded: boolean
  theme: 'dark' | 'light'
  loginByPhone: (phone: string, code: string) => Promise<void>
  loginByWechat: (wechatId: string, nickname?: string) => Promise<void>
  sendCode: (phone: string) => Promise<string>
  logout: () => void
  loadFromStorage: () => void
  updatePlumberName: (name: string) => void
  updatePlumberColor: (color: string) => void
  updatePlumberMessageTime: (time: number) => void
  toggleTheme: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoaded: false,
  theme: (localStorage.getItem('mask01_theme') as 'dark' | 'light') || 'dark',

  loadFromStorage: () => {
    const token = localStorage.getItem('mask01_token')
    const userStr = localStorage.getItem('mask01_user')
    const theme = (localStorage.getItem('mask01_theme') as 'dark' | 'light') || 'dark'
    if (token && userStr) {
      try {
        set({ user: JSON.parse(userStr), token, isLoaded: true, theme })
        document.documentElement.setAttribute('data-theme', theme)
      } catch {
        set({ isLoaded: true, theme })
        document.documentElement.setAttribute('data-theme', theme)
      }
    } else {
      set({ isLoaded: true, theme })
      document.documentElement.setAttribute('data-theme', theme)
    }
  },

  loginByPhone: async (phone, code) => {
    const { data } = await api.post('/auth/phone-login', { phone, code })
    localStorage.setItem('mask01_token', data.token)
    localStorage.setItem('mask01_user', JSON.stringify(data.user))
    set({ user: data.user, token: data.token })
  },

  loginByWechat: async (wechatId, nickname) => {
    const { data } = await api.post('/auth/wechat-login', { wechatId, nickname })
    localStorage.setItem('mask01_token', data.token)
    localStorage.setItem('mask01_user', JSON.stringify(data.user))
    set({ user: data.user, token: data.token })
  },

  sendCode: async (phone) => {
    const { data } = await api.post('/auth/send-code', { phone })
    return data.code
  },

  logout: () => {
    localStorage.removeItem('mask01_token')
    localStorage.removeItem('mask01_user')
    set({ user: null, token: null })
  },

  updatePlumberName: (name) => {
    const user = useAuthStore.getState().user
    if (user) {
      const updatedUser = { ...user, plumberName: name }
      localStorage.setItem('mask01_user', JSON.stringify(updatedUser))
      set({ user: updatedUser })
    }
  },

  updatePlumberColor: (color) => {
    const user = useAuthStore.getState().user
    if (user) {
      const updatedUser = { ...user, plumberColor: color }
      localStorage.setItem('mask01_user', JSON.stringify(updatedUser))
      set({ user: updatedUser })
    }
  },

  updatePlumberMessageTime: (time) => {
    const user = useAuthStore.getState().user
    if (user) {
      const updatedUser = { ...user, lastPlumberMessageTime: time }
      localStorage.setItem('mask01_user', JSON.stringify(updatedUser))
      set({ user: updatedUser })
    }
  },

  toggleTheme: () => {
    const current = useAuthStore.getState().theme
    const next = current === 'dark' ? 'light' : 'dark'
    localStorage.setItem('mask01_theme', next)
    document.documentElement.setAttribute('data-theme', next)
    set({ theme: next })
  },
}))