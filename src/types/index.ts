export interface User {
  id: string
  phone?: string
  wechatId?: string
  nickname: string
  avatar: string
  bio: string
  night_notification_time?: string | null
  plumberName?: string
  plumberColor?: string
  lastPlumberMessageTime?: number
}

export interface Identity {
  id: string
  name: string
  emoji: string
  color: string
}

export interface Whisper {
  id: string
  user_id: string
  user_nickname: string
  user_avatar: string
  content: string
  images: string[]
  voice_url: string
  like_count: number
  dislike_count: number
  created_at: number
  myReaction: 'like' | 'dislike' | null
  hasAiReply: boolean
  aiReply?: AiReply | null
  is_private_response?: number
  identity?: Identity | null
  isFavorited?: boolean
  favoritedAt?: number
}

export interface AiReply {
  id: string
  whisper_id: string
  content: string
  created_at: number
}

export interface Comment {
  id: string
  whisper_id: string
  user_id: string
  user_nickname: string
  user_avatar: string
  content: string
  created_at: number
}

export interface Friend {
  id: string
  nickname: string
  avatar: string
  lastMessage: string | null
  lastTime: number | null
}

export interface FriendRequest {
  id: string
  user_id: string
  nickname: string
  avatar: string
  status: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: number
  is_read?: boolean
}

export interface SearchUser {
  id: string
  nickname: string
  phone?: string
  avatar: string
  friendStatus: string | null
}

export interface Room {
  id: string
  name: string
  description: string
  mood_tag: string
  created_by: string
  creator_nickname: string
  created_at: number
  member_count: number
  isMember?: boolean
}

export interface RoomMessage {
  id: string
  room_id: string
  user_id: string
  user_nickname: string
  content: string
  created_at: number
}

export interface Notification {
  id: string
  user_id: string
  content: string
  type: 'night_message' | 'follow_update' | 'general'
  is_read: boolean
  created_at: number
}

export interface Draft {
  id: string
  user_id: string
  content: string
  images: string[]
  voice_url: string
  identity_id: string | null
  created_at: number
  identity?: Identity | null
}

export interface AIMessage {
  id: string
  role: 'user' | 'bot'
  content: string
  created_at: number
}

export interface Hashtag {
  id: number
  name: string
  count: number
}