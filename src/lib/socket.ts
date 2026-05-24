import { io as socketIo, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(token?: string): Socket {
  if (!socket) {
    socket = socketIo(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export default { getSocket, disconnectSocket }