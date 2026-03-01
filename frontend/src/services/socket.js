import { io } from 'socket.io-client'

let socket = null

export const initSocket = () => {
  if (socket) return socket

  // Connect to backend socket server
  socket = io('http://localhost:5003', {
    withCredentials: true,
    autoConnect: false
  })

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Socket connected successfully:', socket.id)
  })

  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('🔴 Socket connection error:', error.message)
  })

  socket.on('error', (error) => {
    console.error('🔴 Socket error:', error)
  })

  return socket
}

export const connectSocket = () => {
  if (!socket) {
    socket = initSocket()
  }
  if (!socket.connected) {
    socket.connect()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect()
    console.log('🔌 Socket manually disconnected')
  }
}

export const getSocket = () => socket

export default {
  initSocket,
  connectSocket,
  disconnectSocket,
  getSocket
}
