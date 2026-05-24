import express from 'express'
import cors from 'cors'
import path from 'path'
import http from 'http'
import { fileURLToPath } from 'url'
import { Server as SocketIO } from 'socket.io'
import authRoutes from './routes/auth.js'
import whisperRoutes from './routes/whispers.js'
import friendRoutes from './routes/friends.js'
import messageRoutes from './routes/messages.js'
import commentRoutes from './routes/comments.js'
import profileRoutes from './routes/profile.js'
import identityRoutes from './routes/identities.js'
import followRoutes from './routes/follows.js'
import roomRoutes from './routes/rooms.js'
import notificationRoutes from './routes/notifications.js'
import favoritesRoutes from './routes/favorites.js'
import draftsRoutes from './routes/drafts.js'
import { runAiReplyTask } from './services/ai.js'
import db from './database.js'
import { nanoid } from 'nanoid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const server = http.createServer(app)
const io = new SocketIO(server, { cors: { origin: '*' } })
const PORT = parseInt(process.env.PORT || '3001', 10)

app.use(cors())
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/whispers', whisperRoutes)
app.use('/api/friends', friendRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/identities', identityRoutes)
app.use('/api/follow', followRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/drafts', draftsRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Socket.IO connection handling
io.on('connection', (socket) => {
  const token = socket.handshake.auth.token
  if (!token) {
    socket.disconnect()
    return
  }

  try {
    const jwt = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const userId = jwt.userId
    if (!userId) {
      socket.disconnect()
      return
    }

    socket.data.userId = userId
    socket.join(`user:${userId}`)
    console.log(`[Socket] User ${userId} connected`)

    // Handle private message
    socket.on('send_message', (data) => {
      const { to, content } = data
      io.to(`user:${to}`).emit('new_message', {
        from: socket.data.userId,
        content,
        created_at: Date.now(),
      })
    })

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { to } = data
      io.to(`user:${to}`).emit('user_typing', {
        from: socket.data.userId,
      })
    })

    // Handle room message
    socket.on('send_room_message', (data) => {
      const { room_id, content } = data
      socket.to(`room:${room_id}`).emit('room_message', {
        from: socket.data.userId,
        room_id,
        content,
        created_at: Date.now(),
      })
    })

    socket.on('join_room', (roomId) => {
      socket.join(`room:${roomId}`)
    })

    socket.on('leave_room', (roomId) => {
      socket.leave(`room:${roomId}`)
    })

    socket.on('disconnect', () => {
      console.log(`[Socket] User ${userId} disconnected`)
    })
  } catch {
    socket.disconnect()
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Mask01 API running on http://0.0.0.0:${PORT}`)

  runAiReplyTask()
  setInterval(runAiReplyTask, 5 * 60 * 1000)

  // Night notification scheduler (runs every minute)
  const nightMessages = [
    '晚安🌙 希望你今天被温柔以待',
    '睡个好觉，明天又是新的开始🌟',
    '今夜放下一切，好好休息吧🌸',
    '愿你今夜有个美梦，明早醒来满血复活💫',
    '夜深了，该休息了。Mask01永远在这里等你🌙',
    '晚安朋友，明天会更好🌈',
    '今夜祝你安宁，梦里没有烦恼🌌',
    '放下手机吧，美好的休息在等着你🌛',
  ]

  const checkNightNotifications = () => {
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const users = db.prepare('SELECT id FROM users WHERE night_notification_time = ?').all(currentTime) as any[]
    for (const user of users) {
      const msg = nightMessages[Math.floor(Math.random() * nightMessages.length)]
      db.prepare('INSERT INTO notifications (id, user_id, content, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
        nanoid(12), user.id, msg, 'night_message', 0, Date.now()
      )
    }
  }

  setInterval(checkNightNotifications, 60 * 1000)
})

export { io }